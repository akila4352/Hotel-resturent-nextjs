import { rtdb } from "@/lib/firebase"
import { ref as dbRef, get } from "firebase/database"

function formatDate(dateStr) {
  // Returns date in YYYYMMDD format for iCal
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 10).replace(/-/g, "")
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
    const dtend = formatDate(new Date(new Date(booking.checkOut).getTime() + 24*60*60*1000))
    events += `
BEGIN:VEVENT
UID:${id}@yourdomain.com
SUMMARY:Reservation
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
STATUS:CONFIRMED
END:VEVENT`
  })
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Booking Export//EN
${events}
END:VCALENDAR`
}

export default async function handler(req, res) {
  const { roomType = "room1" } = req.query
  const snapshot = await get(dbRef(rtdb, "reservations"))
  const reservations = snapshot.val() || {}
  const ical = buildICal(reservations, roomType)
  res.setHeader("Content-Type", "text/calendar")
  res.status(200).send(ical)
}
