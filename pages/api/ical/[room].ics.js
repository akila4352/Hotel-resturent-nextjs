import { rtdb } from "@/lib/firebase"
import { ref as dbRef, get } from "firebase/database"

/**
 * Format date to YYYYMMDD (iCal DATE)
 */
function toICSDate(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 10).replace(/-/g, "")
}

/**
 * Add days to date
 */
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Build iCal string
 */
function buildICal(reservations, roomKey) {
  let events = ""
  const roomNumber = roomKey.replace("room", "") // room1 -> 1
  const nowStamp =
    new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z"

  Object.entries(reservations || {}).forEach(([id, booking]) => {
    if (!booking?.checkIn || !booking?.checkOut) return
    if (!Array.isArray(booking.selectedRooms)) return

    const match = booking.selectedRooms.some(
      r => String(r.id) === roomNumber
    )
    if (!match) return

    const dtStart = toICSDate(booking.checkIn)

    // Booking.com REQUIRES checkout + 1 day
    const dtEnd = toICSDate(addDays(booking.checkOut, 1))

    events += `
BEGIN:VEVENT
UID:${id}-${roomKey}@amorebeach.com
DTSTAMP:${nowStamp}
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
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
  const roomKey = room || "room1"

  try {
    const snap = await get(dbRef(rtdb, "reservations"))
    const reservations = snap.val() || {}

    const ical = buildICal(reservations, roomKey)

    res.setHeader("Content-Type", "text/calendar; charset=utf-8")
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${roomKey}.ics"`
    )
    res.status(200).send(ical)
  } catch (err) {
    console.error("iCal error:", err)
    res.status(500).send("Failed to generate calendar")
  }
}
