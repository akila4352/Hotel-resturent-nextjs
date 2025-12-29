import { rtdb } from "@/lib/firebase"
import { ref as dbRef, get } from "firebase/database"

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 10).replace(/-/g, "")
}

function nowUTC() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z"
}

function buildICal(reservations, roomType) {
  let events = ""
  let hasEvent = false

  Object.entries(reservations).forEach(([id, booking], index) => {
    if (!booking.selectedRooms || !Array.isArray(booking.selectedRooms)) return

    const typeNumber = roomType.replace("room", "")
    const hasRoom = booking.selectedRooms.some(
      room => String(room.id) === typeNumber || String(room.id) === roomType
    )
    if (!hasRoom) return
    if (!booking.checkIn || !booking.checkOut) return

    const dtstart = formatDate(booking.checkIn)

    // DTEND must be checkout + 1 day
    const checkoutPlusOne = new Date(booking.checkOut)
    checkoutPlusOne.setDate(checkoutPlusOne.getDate() + 1)
    const dtend = formatDate(checkoutPlusOne)

    hasEvent = true

    events +=
`BEGIN:VEVENT\r
UID:${roomType}-${id}@amorebeach.com\r
DTSTAMP:${nowUTC()}\r
DTSTART;VALUE=DATE:${dtstart}\r
DTEND;VALUE=DATE:${dtend}\r
SUMMARY:Booked via AmoreBeach.com\r
STATUS:CONFIRMED\r
END:VEVENT\r
`
  })

  // Booking.com REQUIRES at least ONE event
  if (!hasEvent) {
    events =
`BEGIN:VEVENT\r
UID:${roomType}-placeholder@amorebeach.com\r
DTSTAMP:${nowUTC()}\r
DTSTART;VALUE=DATE:20990101\r
DTEND;VALUE=DATE:20990102\r
SUMMARY:Availability placeholder\r
STATUS:TENTATIVE\r
END:VEVENT\r
`
  }

  return (
`BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Amore Beach//Booking Export//EN\r
CALSCALE:GREGORIAN\r
METHOD:PUBLISH\r
${events}
END:VCALENDAR\r
`
  )
}

export default async function handler(req, res) {
  const { room = "room1" } = req.query

  const snapshot = await get(dbRef(rtdb, "reservations"))
  const reservations = snapshot.val() || {}

  const ical = buildICal(reservations, room)

  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader("Cache-Control", "no-store")
  res.setHeader("Content-Disposition", `inline; filename="${room}.ics"`)

  res.status(200).send(ical)
}
