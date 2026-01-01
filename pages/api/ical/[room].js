import { getDatabase, ref, get } from "firebase/database"

// Helper: Convert reservations to iCal format
function reservationsToICal(reservations, roomName) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourCompany//YourApp//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ]
  reservations.forEach((res, idx) => {
    const dtstart = res.checkIn?.replace(/-/g, "") // YYYYMMDD
    // DTEND should be the day after checkout
    let dtend = res.checkOut
    if (dtend) {
      const d = new Date(dtend)
      d.setDate(d.getDate() + 1)
      dtend = d.toISOString().slice(0, 10).replace(/-/g, "")
    }
    if (!dtstart || !dtend) return
    const dtstamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z"
    lines.push(
      "BEGIN:VEVENT",
      `UID:${roomName}-${idx}@amorebeach.com`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:Booked`,
      `DESCRIPTION:Room reservation`,
      "END:VEVENT"
    )
  })
  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

export default async function handler(req, res) {
  const { room } = req.query
  // Map URL slug to your internal room name/number
  const roomMap = {
    "relax-deluxe": 3,
    "antik-room": 2,
    "no-air-conditioning-with-fan": 5,
    "family-room": 1,
    "deluxe-room": 4,
    "non-air-conditioning-with-fan": 6,
  }
  const roomNumber = roomMap[String(room).toLowerCase()]
  let reservations = []
  if (roomNumber) {
    try {
      const db = getDatabase()
      const snap = await get(ref(db, "reservations"))
      if (snap.exists()) {
        reservations = Object.values(snap.val() || {}).filter(
          (r) =>
            Array.isArray(r.selectedRooms) &&
            r.selectedRooms.some((sr) => String(sr.id) === String(roomNumber))
        )
      }
    } catch (e) {
      reservations = []
    }
  }
  // Always return a valid iCal file, even if no reservations or room not found
  const ical = reservationsToICal(reservations, room)
  res.setHeader("Content-Type", "text/calendar")
  res.status(200).send(ical)
}
