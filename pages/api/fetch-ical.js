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
    }

    // Use the built-in fetch provided by the Node runtime (Node 18+ / Next.js)
    const r = await fetch(url, { method: "GET" })
    if (!r.ok) {
      res.status(502).send("Failed fetching remote calendar")
      return
    }
    const text = await r.text()
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.status(200).send(text)
  } catch (err) {
    console.error("fetch-ical error:", err)
    res.status(500).send("Server error")
  }
}
