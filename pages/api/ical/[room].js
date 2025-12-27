import { getDatabase, ref, get } from "firebase/database"

// Helper: Convert reservations to iCal format
function reservationsToICal(reservations, roomName) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourHotel//iCal Export//EN",
    "CALSCALE:GREGORIAN",
  ]
  reservations.forEach((res, idx) => {
    const dtstart = res.checkIn?.replace(/-/g, "") // YYYYMMDD
    const dtend = res.checkOut?.replace(/-/g, "")
    if (!dtstart || !dtend) return
    lines.push(
      "BEGIN:VEVENT",
      `UID:${roomName}-${idx}@yourhotel.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:Reservation for ${roomName}`,
      `DESCRIPTION:Guests: ${res.adults || ""} adults, ${res.children || ""} children`,
      "STATUS:CONFIRMED",
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
  if (!roomNumber) {
    res.status(404).send("Room not found")
    return
  }

  // Fetch reservations from your database for this room
  // Example: using Firebase RTDB (adjust as needed)
  let reservations = []
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
    // fallback: no reservations
    reservations = []
  }

  const ical = reservationsToICal(reservations, room)
  res.setHeader("Content-Type", "text/calendar")
  res.status(200).send(ical)
}
