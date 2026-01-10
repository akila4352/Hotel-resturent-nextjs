function toICSDate(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 10).replace(/-/g, "")
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function handler(req, res) {
  const { roomId, checkIn, checkOut } = req.query

  // 🔴 Validate input
  if (!roomId || !checkIn || !checkOut) {
    return res
      .status(400)
      .send("roomId, checkIn and checkOut are required")
  }

  const now =
    new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z"

  const event = `
BEGIN:VEVENT
UID:${roomId}-${checkIn}@amorebeach.com
DTSTAMP:${now}
DTSTART;VALUE=DATE:${toICSDate(checkIn)}
DTEND;VALUE=DATE:${toICSDate(addDays(checkOut, 1))}
SUMMARY:Booked
END:VEVENT
`

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amore Beach//Booking Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${event}
END:VCALENDAR`

  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${roomId}.ics"`
  )

  res.status(200).send(ics)
}
