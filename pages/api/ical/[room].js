import { rtdb } from "@/lib/firebase"
import { ref as dbRef, get } from "firebase/database"

function toICSDate(dateStr) {
  return new Date(dateStr).toISOString().slice(0, 10).replace(/-/g, "")
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function buildICal(reservations, roomKey) {
  let events = ""
  const roomNumber = roomKey.replace("room", "")
  const now =
    new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z"

  Object.entries(reservations || {}).forEach(([id, booking]) => {
    if (!booking?.checkIn || !booking?.checkOut) return
    if (!Array.isArray(booking.selectedRooms)) return

    const match = booking.selectedRooms.some(
      r => String(r.id) === roomNumber
    )
    if (!match) return

    events += `
BEGIN:VEVENT
UID:${id}-${roomKey}@amorebeach.com
DTSTAMP:${now}
DTSTART;VALUE=DATE:${toICSDate(booking.checkIn)}
DTEND;VALUE=DATE:${toICSDate(addDays(booking.checkOut, 1))}
SUMMARY:Booked
STATUS:CONFIRMED
END:VEVENT`
  })

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amore Beach//Booking Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}
END:VCALENDAR`
}

export default async function handler(req, res) {
  const { room } = req.query

  try {
    const snap = await get(dbRef(rtdb, "reservations"))
    const reservations = snap.val() || {}

    const ical = buildICal(reservations, room)

    res.setHeader("Content-Type", "text/calendar; charset=utf-8")
    res.setHeader("Cache-Control", "no-store")
    res.status(200).send(ical)
  } catch (err) {
    console.error("iCal error:", err)
    res.status(500).send("Failed to generate calendar")
  }
}
