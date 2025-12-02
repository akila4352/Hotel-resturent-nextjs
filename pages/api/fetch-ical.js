export default async function handler(req, res) {
  const url = req.query?.url
  if (!url) {
    res.status(400).send("Missing url query")
    return
  }
 
  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).send("Invalid protocol")
      return
    }

    // Force fresh fetch and avoid caching of proxy responses
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "text/calendar, text/plain, */*;q=0.1",
        "User-Agent": "Mozilla/5.0 (compatible; Next.js)",
      },
      // don't let node-fetch cache results (if runtime supports)
      // cf. https://github.com/node-fetch/node-fetch/issues/1056
      // cache: "no-store",
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

    // Prevent caching of the proxy response so clients always get fresh iCal
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
