export default async function handler(req, res) {
  const url = req.query?.url;

  if (!url) {
    res.status(400).send("Missing url query");
    return;
  }

  // Always return valid ICS to avoid Booking.com sync errors
  const minimalICal = () =>
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//YourSite//EmptyCalendar//EN",
      "CALSCALE:GREGORIAN",
      "END:VCALENDAR",
      ""
    ].join("\r\n");

  // --------------------------------------
  // GET → Return ICS from remote URL
  // --------------------------------------
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.status(200).send(minimalICal());
      return;
    }

    // Fetch remote ICS
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/calendar, text/plain, */*",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!r.ok) {
      console.error("Remote ICS fetch failed:", r.status, r.statusText);
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.status(200).send(minimalICal());
      return;
    }

    const text = await r.text();

    const upper = text.toUpperCase();
    const validICS =
      upper.includes("BEGIN:VCALENDAR") ||
      upper.includes("BEGIN:VEVENT") ||
      upper.includes("BEGIN:VFREEBUSY");

    if (!validICS) {
      console.error("Invalid ICS content");
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.status(200).send(minimalICal());
      return;
    }

    // SUCCESS → return ICS unchanged
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.status(200).send(text);

  } catch (err) {
    console.error("fetch-ical error:", err);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.status(200).send(minimalICal());
  }
}
