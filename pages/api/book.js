import fs from "fs"
import path from "path"

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { roomId, checkIn, checkOut, guest } = req.body || {};
  if (!roomId || !checkIn || !checkOut || !guest) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const bookingsFile = path.join(process.cwd(), "bookings.json");
  let bookings = [];
  try {
    if (fs.existsSync(bookingsFile)) {
      bookings = JSON.parse(fs.readFileSync(bookingsFile, "utf8"));
    }
  } catch (e) {
    bookings = [];
  }

  bookings.push({
    roomId,
    checkIn,
    checkOut,
    guest,
    createdAt: new Date().toISOString(),
  });

  try {
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2), "utf8");
  } catch (e) {
    return res.status(500).json({ error: "Failed to save booking" });
  }

  res.status(200).json({ ok: true });
}
