export default async function handler(req, res) {
  const url = req.query?.url
  if (!url) {
    res.status(400).send("Missing url query")
    return
  }

  try {
    // Basic validation: only allow http(s) URLs to avoid SSRF; adjust host checks if needed.
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).send("Invalid protocol")
      return
    } // Optionally restrict to certain hosts/domains:

    // Use the built-in fetch provided by the Node runtime (Node 18+ / Next.js)
    // Add common headers to improve chances of a successful Booking.com response.
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/calendar, text/plain, */*;q=0.1",
        "User-Agent": "Mozilla/5.0 (compatible; Next.js)",
        // optionally add Referer if Booking.com expects one:
        // "Referer": "https://your-site.example"
      },
    })

    if (!r.ok) {
      const msg = `Remote server responded ${r.status} ${r.statusText}`
      console.error("fetch-ical fetch failed:", msg, url)
      res.status(502).send(msg)
      return
    }

    const text = await r.text()

    // Basic validation: ensure returned content looks like an iCal file
    const lc = (text || "").toUpperCase()
    if (!lc.includes("BEGIN:VCALENDAR") && !lc.includes("BEGIN:VFREEBUSY") && !lc.includes("BEGIN:VEVENT")) {
      const snippet = (text || "").slice(0, 2000)
      console.error("fetch-ical: fetched content not iCal:", { url, snippet: snippet.slice(0, 500) })
      res.status(422).json({
        error: "Fetched content does not appear to be an iCal (missing BEGIN:VCALENDAR/VEVENT/VFREEBUSY).",
        snippet,
      })
      return
    }

    // Return plain text iCal to client
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.status(200).send(text)
  } catch (err) {
    console.error("fetch-ical error:", err)
    res.status(500).send("Server error fetching iCal")
  }
}
