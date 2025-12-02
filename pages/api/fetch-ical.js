export default async function handler(req, res) {
  const url = req.query?.url;
  if (!url) {
    res.status(400).send("Missing url query");
    return;
  }

  // Always return valid ICS to avoid Booking.com sync failures
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
  // (OPTIONAL) POST → push ICS to remote
  // --------------------------------------
  if (req.method === "POST") {
    try {
      const { ics, method } = req.body || {};

      if (!ics || typeof ics !== "string") {
        res.status(400).json({ error: "Missing ics in request body" });
        return;
      }

      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        res.status(400).json({ error: "Invalid protocol" });
        return;
      }

      const pushMethod = (method || "PUT").toUpperCase();
      const remote = await fetch(url, {
        method: pushMethod,
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "User-Agent": "Mozilla/5.0 (compatible; Next.js)"
        },
        body: ics
      });

      if (!remote.ok) {
        res.status(502).json({
          ok: false,
          status: remote.status,
          statusText: remote.statusText
        });
        return;
      }

      res.status(200).json({
        ok: true,
        message: "ICS pushed successfully"
      });
      return;
    } catch (err) {
      console.error("POST ICS push error:", err);
      res.status(500).json({ ok: false, message: "Server error pushing ICS" });
      return;
    }
  }

  // --------------------------------------
  // GET → return ICS from Booking.com link
  // --------------------------------------
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.status(200).send(minimalICal());
      return;
    }

    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/calendar, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (compatible; Next.js)"
      }
    });

    if (!r.ok) {
      console.error("Remote calendar error:", r.status, r.statusText);
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.status(200).send(minimalICal());
      return;
    }

    const text = await r.text();

    const check = text.toUpperCase();
    const looksValid =
      check.includes("BEGIN:VCALENDAR") ||
      check.includes("BEGIN:VEVENT") ||
      check.includes("BEGIN:VFREEBUSY");

    if (!looksValid) {
      console.error("Invalid ICS returned:", text.slice(0, 200));
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.status(200).send(minimalICal());
      return;
    }

    // Success → return raw ICS
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.status(200).send(text);
  } catch (err) {
    console.error("GET ICS fetch error:", err);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.status(200).send(minimalICal());
  }
}
