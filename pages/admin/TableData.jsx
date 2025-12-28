import React, { useEffect, useState } from "react"
import * as XLSX from "xlsx";
import Common from "./Common"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import { ref, get, child } from "firebase/database"
import { rtdb } from "../../lib/firebase"

const TableData = ({ setReservationCount }) => {
  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Export filtered bookings to Excel
  // Helper to format ISO date string to user-friendly format
  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleExportExcel = () => {
      if (bookings.length === 0) return;
    // Prepare data for export
      const exportData = bookings.map((b) => ({
        'Guest Name': b.guest ? `${b.guest.firstName || ''} ${b.guest.lastName || ''}`.trim() : '-',
        'Room(s)': Array.isArray(b.selectedRooms)
          ? b.selectedRooms.map((r) => `${r.title} x${r.qty}`).join(', ')
          : b.selectedRooms && b.selectedRooms.title ? `${b.selectedRooms.title} x1` : '-',
        'Room ID': Array.isArray(b.roomNumbers) && b.roomNumbers.length > 0
          ? b.roomNumbers.join(', ')
          : '-',
        'Total Price': typeof b.totalPrice === 'number' ? b.totalPrice : '-',
        'Check-in': b.checkIn || '-',
        'Check-out': b.checkOut || '-',
        'Adults': b.adults ?? '-',
        'Children': b.children ?? '-',
        'Mobile': b.guest?.mobile || '-',
        'Notes': b.guest?.notes || '-',
        'Created At': formatDate(b.createdAt),
        'Address': b.guest?.address || '-',
        'City': b.guest?.city || '-',
        'Country': b.guest?.country || '-',
        'Email': b.guest?.email || '-',
      }));
      import('xlsx').then((xlsx) => {
        const ws = xlsx.utils.json_to_sheet(exportData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Reservations');
        xlsx.writeFile(wb, 'reservations.xlsx');
      });
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const dbRef = ref(rtdb)
        const resSnap = await get(child(dbRef, "reservations"))
        if (resSnap.exists()) {
          const reservationsObj = resSnap.val()
          const reservationsArr = Object.entries(reservationsObj).map(([id, data]) => ({
            ...data,
          }))
          setAllBookings(reservationsArr)
          setReservationCount(reservationsArr.length)
        } else {
          setAllBookings([])
          setReservationCount(0)
        }
      } catch (err) {
        console.error("Error fetching reservations:", err)
      }
    }

    const fetchMessages = async () => {
      try {
        const dbRef = ref(rtdb)
        const msgSnap = await get(child(dbRef, "newsletterMessages"))
        if (msgSnap.exists()) {
          const messagesObj = msgSnap.val()
          const messagesArr = Object.entries(messagesObj).map(([id, data]) => ({
            id,
            ...data,
          }))
          setMessages(messagesArr)
        } else {
          setMessages([])
        }
      } catch (err) {
        console.error("Error fetching newsletter messages:", err)
      }
    }

    fetchReservations()
    fetchMessages()
  }, [])
  useEffect(() => {
    // Filter bookings for grid display only
    let filtered = allBookings;
    if (startDate || endDate) {
      filtered = allBookings.filter(r => {
        if (!r.checkIn) return false;
        const checkInDate = new Date(r.checkIn);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && checkInDate < start) return false;
        if (end && checkInDate > end) return false;
        return true;
      });
    }
    setBookings(filtered);
  }, [allBookings, startDate, endDate]);

  return (
    <>
      <section className='project'>
        <div className='user cardBox'>
          <Common title='Messages' />
          <div className='userBox'>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#aaa', padding: '1rem' }}>No messages found.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {messages.map((msg) => (
                  <li key={msg.id} style={{ borderBottom: '1px solid #444', padding: '0.5rem 0', color: '#fff' }}>
                    <div>
                      <strong>Email:</strong> {msg.gmail || msg.email || '-'}
                    </div>
                    {msg.message && <div><strong>Message:</strong> {msg.message}</div>}
                    {msg.createdAt &&
                      typeof msg.createdAt === 'string' &&
                      isNaN(Number(msg.createdAt)) && (
                        <div style={{ fontSize: '0.85em', color: '#888' }}>{msg.createdAt}</div>
                      )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className='table cardBox'>
          <Common title='Reservations' />
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ color: '#fff' }}>
              Check-in Start:
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            <label style={{ color: '#fff' }}>
              Check-in End:
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            <button onClick={() => { setStartDate(""); setEndDate(""); }} style={{ marginLeft: 8 }}>
              Clear
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={handleExportExcel} style={{ padding: '0.5rem 1rem', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Export to Excel
            </button>
          </div>
          <div className='tableBox'>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: "none", borderRadius: "none" }}
            >
              <Table
                className='tableContainer'
                sx={{
                  minWidth: 650,
                  background: "#313844",
                  border: "none",
                  "& td ,th": {
                    color: "rgb(166, 171, 176)",
                    borderBottom: "1px solid rgb(86, 86, 86)",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Guest Name</TableCell>
                    <TableCell>Room(s)</TableCell>
                    <TableCell>Room ID</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Check-in</TableCell>
                    <TableCell>Check-out</TableCell>
                    <TableCell>Adults</TableCell>
                    <TableCell>Children</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} style={{ textAlign: "center" }}>
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((b, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{b.guest ? `${b.guest.firstName || ''} ${b.guest.lastName || ''}`.trim() : '-'}</TableCell>
                        <TableCell>
                          {Array.isArray(b.selectedRooms)
                            ? b.selectedRooms.map((r, i) => `${r.title} x${r.qty}`).join(', ')
                            : b.selectedRooms && b.selectedRooms.title ? `${b.selectedRooms.title} x1` : '-'}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(b.roomNumbers) && b.roomNumbers.length > 0
                            ? b.roomNumbers.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {typeof b.totalPrice === 'number' ? `$${b.totalPrice.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>{b.checkIn || '-'}</TableCell>
                        <TableCell>{b.checkOut || '-'}</TableCell>
                        <TableCell>{b.adults ?? '-'}</TableCell>
                        <TableCell>{b.children ?? '-'}</TableCell>
                        <TableCell>{b.guest?.mobile || '-'}</TableCell>
                        <TableCell>{b.guest?.notes || '-'}</TableCell>
                        <TableCell>{formatDate(b.createdAt)}</TableCell>
                        <TableCell>{b.guest?.address || '-'}</TableCell>
                        <TableCell>{b.guest?.city || '-'}</TableCell>
                        <TableCell>{b.guest?.country || '-'}</TableCell>
                        <TableCell>{b.guest?.email || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </section> 
    </>
  )
}

export default TableData