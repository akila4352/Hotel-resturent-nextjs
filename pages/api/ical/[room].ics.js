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
  const typeNumber = roomType.replace("room", "")
  Object.entries(reservations).forEach(([id, booking]) => {
    if (!booking.selectedRooms || !Array.isArray(booking.selectedRooms)) return
    // Match by room id (number or string)
    const hasRoom = booking.selectedRooms.some(
      room =>
        String(room.id) === typeNumber ||
        String(room.id) === roomType ||
        String(room.id) === String(roomType.replace("room", ""))
    )
    if (!hasRoom) return
    if (!booking.checkIn || !booking.checkOut) return
    const dtstart = formatDate(booking.checkIn)
    // Booking.com expects DTEND to be the day after checkout
    const dtend = formatDate(addDays(booking.checkOut, 1))
    const dtstamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z"
    events +=
`BEGIN:VEVENT
UID:${id}-${roomType}@amorebeach.com
DTSTAMP:${dtstamp}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
SUMMARY:Booked
DESCRIPTION:Room reservation
END:VEVENT
`
  })
  return (
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourCompany//YourApp//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
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
    // Debug: log how many reservations and the roomType
    console.log(`[iCal] Loaded ${Object.keys(reservations).length} reservations for roomType: ${roomType}`)
  } catch (err) {
    reservations = {}
    console.error("[iCal] Error loading reservations:", err)
  }
  const ical = buildICal(reservations, roomType)
  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename="${roomType}.ics"`)
  res.status(200).send(ical)
}
