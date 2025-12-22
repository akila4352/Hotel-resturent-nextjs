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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const dbRef = ref(rtdb)
        const hotelSnap = await get(child(dbRef, "hotelBookings"))
        if (hotelSnap.exists()) {
          const bookingsObj = hotelSnap.val()
          // Convert object to array with id
          const bookingsArr = Object.entries(bookingsObj).map(([id, data]) => ({
            id,
            ...data,
          }))
          setBookings(bookingsArr)
        } else {
          setBookings([])
        }
      } catch (err) {
        console.error("Error fetching hotel bookings:", err)
      }
    }

    fetchBookings()
  }, [])

  return (
    <>
      <section className='project'>
        <div className='user cardBox'>
          <Common title='Messages' />
          <div className='userBox'>
            {/* User inbox or other content can go here */}
          </div>
        </div>
        <div className='table cardBox'>
          <Common title='Hotel Bookings' />
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
                    <TableCell>Name</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Check-in</TableCell>
                    <TableCell>Check-out</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
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
                        <TableCell>{b.name || "-"}</TableCell>
                        <TableCell>{b.room || "-"}</TableCell>
                        <TableCell>{b.checkIn || "-"}</TableCell>
                        <TableCell>{b.checkOut || "-"}</TableCell>
                        <TableCell>{b.price ? `Rs. ${b.price}` : "-"}</TableCell>
                        <TableCell>{b.status || "-"}</TableCell>
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