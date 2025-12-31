import { rtdb } from "@/lib/firebase"
import { ref as dbRef, get } from "firebase/database"

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 10).replace(/-/g, "")
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function buildICal(reservations, roomType) {
  let events = ""
  Object.entries(reservations).forEach(([id, booking]) => {
    if (!booking.selectedRooms || !Array.isArray(booking.selectedRooms)) return
    const typeNumber = roomType.replace("room", "")
    const hasRoom = booking.selectedRooms.some(
      room => String(room.id) === typeNumber || String(room.id) === roomType
    )
    if (!hasRoom) return
    if (!booking.checkIn || !booking.checkOut) return
    const dtstart = formatDate(booking.checkIn)
    // Booking.com expects DTEND to be the day after checkout
    const dtend = formatDate(addDays(booking.checkOut, 1))
    events +=
`BEGIN:VEVENT
UID:${id}-${roomType}@amorebeach.com
SUMMARY:Reservation
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
STATUS:CONFIRMED
END:VEVENT
`
  })
  return (
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//amorebeach.com//Booking Export//EN
${events}END:VCALENDAR`
  )
}

export default async function handler(req, res) {
  const { room } = req.query
  const roomType = room || "room1"
  let reservations = {}
  try {
    const snapshot = await get(dbRef(rtdb, "reservations"))
    reservations = snapshot.val() || {}
    console.log("Reservations loaded for iCal:", reservations)
  } catch (err) {
    reservations = {}
  }
  const ical = buildICal(reservations, roomType)
  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename="${roomType}.ics"`)
  res.status(200).send(ical)
}
