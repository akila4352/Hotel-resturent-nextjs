import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end("Method Not Allowed");
  }

  // ===== ROOM ID =====
  const ROOM_ID = "room1";

  // ===== READ BOOKINGS FROM JSON FILE =====
  const bookingsFile = path.join(process.cwd(), "bookings.json");
  let bookings = [];
  try {
    if (fs.existsSync(bookingsFile)) {
      bookings = JSON.parse(fs.readFileSync(bookingsFile, "utf8"));
    }
  } catch (e) {
    bookings = [];
  }

  // ===== DATE FORMATTER (YYYYMMDD) =====
  const formatDate = (dateStr) =>
    dateStr.replace(/-/g, "");

  // ===== BUILD EVENTS =====
  const events = bookings
    .filter(b => b.roomId === ROOM_ID)
    .map((b, index) => {
      return [
        "BEGIN:VEVENT",
        `UID:${ROOM_ID}-${index}-${Date.now()}@yourdomain.com`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`,
        `DTSTART;VALUE=DATE:${formatDate(b.checkIn)}`,
        `DTEND;VALUE=DATE:${formatDate(b.checkOut)}`,
        `SUMMARY:Booked (${ROOM_ID})`,
        `DESCRIPTION:Guest ${b.guest}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  // ===== FINAL CALENDAR =====
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourHotel//BookingSync//EN",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  // ===== RESPONSE =====
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.status(200).send(calendar);
}
