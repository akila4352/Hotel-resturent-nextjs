export default async function handler(req, res) {
  if (req.method === "POST") {
    // Expect body: { action: "block", reservation: { ... } }
    try {
      const body = req.body || {}
      if (body.action !== "block" || !body.reservation) {
        res.status(400).json({ error: "Invalid POST payload. Expect { action: 'block', reservation }" })
        return
      }

      const bookingBlockUrl = process.env.BOOKING_BLOCK_URL
      if (!bookingBlockUrl) {
        // Server not configured to block Booking.com — return 501 so client knows it's not available
        res.status(501).json({ ok: false, error: "Booking block endpoint not configured on server (BOOKING_BLOCK_URL missing)." })
        return
      }

      // Forward the reservation payload to the configured endpoint.
      // The upstream service should perform the actual Booking.com calendar update.
      const headers = {
        "Content-Type": "application/json",
      }
      if (process.env.BOOKING_API_KEY) headers.Authorization = `Bearer ${process.env.BOOKING_API_KEY}`

      const forwardRes = await fetch(bookingBlockUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body.reservation),
      })

      const text = await forwardRes.text()
      if (!forwardRes.ok) {
        console.error("Forward block failed:", forwardRes.status, text)
        res.status(502).json({ ok: false, status: forwardRes.status, message: text })
        return
      }

      res.status(200).json({ ok: true, message: text })
      return
    } catch (err) {
      console.error("fetch-ical POST error:", err)
      res.status(500).json({ ok: false, error: "Server error forwarding block request" })
      return
    }
  }

  // ...existing GET handling code below...
  try {
    const url = req.query?.url
    if (!url) {
      res.status(400).send("Missing url query")
      return
    }
 
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).send("Invalid protocol")
      return
    }

    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/calendar, text/plain, */*;q=0.1",
        "User-Agent": "Mozilla/5.0 (compatible; Next.js)",
      },
    })

    if (!r.ok) {
      const msg = `Remote server responded ${r.status} ${r.statusText}`
      console.error("fetch-ical fetch failed:", msg, url)
      res.status(502).send(msg)
      return
    }

    const text = await r.text()

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

    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")

    res.status(200).send(text)
  } catch (err) {
    console.error("fetch-ical error:", err)
    res.status(500).send("Server error fetching iCal")
  }
}
