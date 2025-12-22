import React, { useEffect, useState } from "react"
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

const TableData = () => {
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const dbRef = ref(rtdb)
        const resSnap = await get(child(dbRef, "reservations"))
        if (resSnap.exists()) {
          const reservationsObj = resSnap.val()
          const reservationsArr = Object.entries(reservationsObj).map(([id, data]) => ({
            id,
            ...data,
          }))
          setBookings(reservationsArr)
        } else {
          setBookings([])
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
                    <div><strong>Email:</strong> {msg.email || '-'}</div>
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
                    <TableCell>ID</TableCell>
                    <TableCell>Guest Name</TableCell>
                    <TableCell>Room(s)</TableCell>
                    <TableCell>Check-in</TableCell>
                    <TableCell>Check-out</TableCell>
                    <TableCell>Adults</TableCell>
                    <TableCell>Children</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} style={{ textAlign: "center" }}>
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.id}</TableCell>
                        <TableCell>{b.guest ? `${b.guest.firstName || ''} ${b.guest.lastName || ''}`.trim() : '-'}</TableCell>
                        <TableCell>
                          {Array.isArray(b.selectedRooms)
                            ? b.selectedRooms.map((r, i) => `${r.title} x${r.qty}`).join(', ')
                            : b.selectedRooms && b.selectedRooms.title ? `${b.selectedRooms.title} x1` : '-'}
                        </TableCell>
                        <TableCell>{b.checkIn || '-'}</TableCell>
                        <TableCell>{b.checkOut || '-'}</TableCell>
                        <TableCell>{b.adults ?? '-'}</TableCell>
                        <TableCell>{b.children ?? '-'}</TableCell>
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