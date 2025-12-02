import React, { useEffect, useMemo, useState } from "react"
import { DateRange } from "react-date-range"
import { format } from "date-fns"
import { useRouter } from "next/router"

export default function BookingBox({
  bookingRef,
  calendarRef,
  isFixed,
  absTop,
  openDate,
  setOpenDate,
  range,
  setRange,
  options,
  handleOption,
  handleRoomType,
  handleBookNow,
  submitting,
  forceStatic = false,
}) {
  const router = useRouter()
  const formattedDate = (d) => (d ? format(d, "dd LLL yyyy").toUpperCase() : "")

  // mapping roomType -> iCal URL (replace with your real feeds or put .ics in /public/calendars/)
  const iCalMap = {
    single: "/calendars/single.ics", // update when available
    double: "/calendars/double.ics", // update when available
    // Triple room iCal (from Booking.com) — provided by user
    triple: "https://ical.booking.com/v1/export?t=a75aef94-6f98-443a-8b24-f179be163fe5",
  }

  // blocked dates state (array of Date objects) and a Set of ISO strings for quick lookup
  const [blockedDates, setBlockedDates] = useState([])
  const blockedSet = useMemo(() => {
    const s = new Set()
    blockedDates.forEach((d) => s.add(d.toISOString().slice(0, 10)))
    return s
  }, [blockedDates])

  // local flag to prevent double-clicks while calendar sync is running
  const [syncing, setSyncing] = useState(false)

  // when the user clicks the date pill/calendar icon: always show the requested alert
  // and toggle the calendar UI. (Per request, this always shows the fixed message.)
  const onDateToggle = () => {
    // show the constant alert message
    alert("Calendar sync complete. 6 blocked date(s) retrieved from remote calendar.")
    // toggle the date picker visibility
    try {
      setOpenDate((s) => !s)
    } catch (e) {
      // defensive: if setOpenDate not provided, ignore
      console.warn("setOpenDate unavailable", e)
    }
  }

  // parse simple iCal: extract DTSTART/DTEND from VEVENTs (supports YYYYMMDD and YYYYMMDDTHHMMSSZ)
  const parseICal = async (text) => {
    const lines = text.split(/\r?\n/)
    const events = []
    let inEvent = false
    let cur = {}
    for (let raw of lines) {
      const line = raw.trim()
      if (!line) continue
      if (line === "BEGIN:VEVENT") {
        inEvent = true
        cur = { status: "CONFIRMED" }
        continue
      }
      if (line === "END:VEVENT") {
        inEvent = false
        // ignore cancelled events
        if (cur.status && String(cur.status).toUpperCase() === "CANCELLED") {
          cur = {}
          continue
        }
        if (cur.dtstart) events.push({ dtstart: cur.dtstart, dtend: cur.dtend || cur.dtstart, summary: cur.summary || "" })
        cur = {}
        continue
      }
      if (!inEvent) continue

      // capture DTSTART/DTEND/STATUS/SUMMARY lines robustly (handle params like DTSTART;VALUE=DATE:...)
      if (line.toUpperCase().startsWith("DTSTART")) {
        const idx = line.indexOf(":")
        if (idx !== -1) cur.dtstart = line.slice(idx + 1)
        continue
      }
      if (line.toUpperCase().startsWith("DTEND")) {
        const idx = line.indexOf(":")
        if (idx !== -1) cur.dtend = line.slice(idx + 1)
        continue
      }
      if (line.toUpperCase().startsWith("STATUS")) {
        const idx = line.indexOf(":")
        if (idx !== -1) cur.status = line.slice(idx + 1)
        continue
      }
      if (line.toUpperCase().startsWith("SUMMARY")) {
        const idx = line.indexOf(":")
        if (idx !== -1) cur.summary = line.slice(idx + 1)
        continue
      }
    }

    // expand events to array of date objects (inclusive of start, exclusive of dtend per iCal; subtract one day)
    const out = []
    const toDate = (val) => {
      if (!val) return null
      // YYYYMMDD or YYYYMMDDTHHMMSSZ
      const m = val.match(/^(\d{4})(\d{2})(\d{2})/)
      if (m) {
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      }
      const dd = new Date(val)
      return isNaN(dd.getTime()) ? null : dd
    }

    const addDays = (d, n) => {
      const x = new Date(d)
      x.setDate(x.getDate() + n)
      return x
    }

    for (const ev of events) {
      // Treat any VEVENT (including ones whose SUMMARY contains "Closed" or similar) as blocked
      const s = toDate(ev.dtstart)
      let e = toDate(ev.dtend)
      if (!s) continue
      if (e) e = addDays(e, -1) // iCal DTEND is exclusive
      else e = s
      for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
        out.push(new Date(d))
      }
    }
    return out
  }

  // fetch iCal when roomType changes — use local API proxy to avoid CORS
  useEffect(() => {
    const type = (options?.roomType || "").toLowerCase()
    if (!type) {
      setBlockedDates([])
      return
    }
    const url = iCalMap[type]
    if (!url) {
      setBlockedDates([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        // call our server-side proxy to avoid CORS issues
        const proxyUrl = `/api/fetch-ical?url=${encodeURIComponent(url)}`
        const res = await fetch(proxyUrl)
        if (!res.ok) throw new Error("Failed to fetch iCal via proxy")
        const text = await res.text()
        if (cancelled) return
        const parsed = await parseICal(text)
        if (!cancelled) setBlockedDates(parsed)
      } catch (err) {
        console.error("iCal fetch/parse error:", err)
        if (!cancelled) setBlockedDates([])
      }
    })()
    return () => { cancelled = true }
  }, [options?.roomType])

  // navigate to reservation page — do NOT submit/save here to avoid showing alerts.
  // The reservation page will handle final save/alert after guest details are entered.
  const onBookNow = async () => {
    if (submitting || syncing) return
    // require room type selection
    if (!options?.roomType) {
      alert("Please select a room type before booking.")
      return
    }

    const start = range && range[0] && range[0].startDate
    const end = range && range[0] && range[0].endDate
    const checkIn = start ? start.toISOString().slice(0, 10) : ""
    const checkOut = end ? end.toISOString().slice(0, 10) : ""

    const query = {
      checkIn,
      checkOut,
      adults: String(options?.adult ?? 1),
      children: String(options?.children ?? 0),
      rooms: String(options?.room ?? 1),
      roomType: String(options?.roomType ?? ""),
    }

    // Synchronize calendar before navigating — wait and show alert with result.
    setSyncing(true)
    try {
      const iCalUrl = iCalMap[(options?.roomType || "").toLowerCase()] || process.env.NEXT_PUBLIC_TRIPLE_ICAL
      if (!iCalUrl) throw new Error("No remote calendar URL configured for this room type.")
      const proxyUrl = `/api/fetch-ical?url=${encodeURIComponent(iCalUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error(`Failed to fetch iCal: ${res.status} ${res.statusText}`)
      const text = await res.text()
      const parsed = await parseICal(text)
      const uniq = new Set(parsed.map((d) => d.toISOString().slice(0, 10)))
      alert(`Calendar sync complete. ${uniq.size} blocked date(s) retrieved from remote calendar.`)
    } catch (err) {
      console.error("Calendar sync error:", err)
      alert(`Calendar sync failed: ${err?.message || "Unknown error"}`)
    } finally {
      setSyncing(false)
      // Navigate after user has dismissed the alert
      router.push({ pathname: "/reservation", query })
    }
  }

  // compute wrapper position; on mobile/forceStatic we render as static so it pushes content
  const isStatic = !!forceStatic
  const wrapperStyle = {
    position: isStatic ? "static" : isFixed ? "fixed" : "absolute",
    bottom: isStatic ? "auto" : isFixed ? "6%" : "auto",
    top: isStatic ? "auto" : isFixed ? "auto" : `${absTop}px`,
    left: isStatic ? "0" : "50%",
    transform: isStatic ? "none" : "translateX(-50%)",
    zIndex: 60,
    background: isStatic ? "#ffffff" : "transparent", // make wrapper solid white on mobile/static
    color: "#000",
    borderRadius: 12,
    border: "none",
    boxShadow: "0 10px 30px rgba(11,18,32,0.06)",
    padding: isStatic ? "12px 0" : 6,
    width: isStatic ? "100%" : undefined,
    boxSizing: isStatic ? "border-box" : undefined,
  }

  return (
    <div
      ref={bookingRef}
      className={`booking-box ${forceStatic ? "mobile-static" : ""}`}
      style={wrapperStyle}
    >
      <div
        className="booking-inner"
        style={{
          // keep inner visual style; on static mode make it full-width inside wrapper
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "nowrap",            // keep everything on one line
          overflowX: "hidden",           // prevent horizontal scrollbar; shrink controls instead
          padding: isStatic ? "14px" : "12px 14px",
          background: isStatic ? "#ffffff" : "rgba(255,255,255,0.60)", // solid white on responsive/static
          borderRadius: 12,
          border: "1px solid rgba(11,18,32,0.06)",
          boxShadow: "0 6px 18px rgba(11,18,32,0.06)",
          width: isStatic ? "100%" : undefined,
        }}
      >
        {/* Single date pill: shows check-in / check-out stacked (simpler for users) */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap" }}>
          <button
            type="button"
            className="booking-date"
            onClick={onDateToggle}
            style={{
              background: "white",
              color: "#000",
              border: "1px solid rgba(11,18,32,0.06)",
              padding: "8px 10px",
              borderRadius: 8,
              minWidth: 120,            // reduced to fit on one line
              fontWeight: 800,
              fontSize: 13,             // slightly smaller
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "space-between",
              boxShadow: "0 4px 14px rgba(11,18,32,0.06)",
            }}
            aria-label="Select dates"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
              <span className="date-label" style={{ letterSpacing: 0.6, color: "#000", fontWeight: 800 }}>{formattedDate(range[0].startDate)}</span>
              <small style={{ color: "#374151", fontWeight: 600, marginTop: 4 }}>{formattedDate(range[0].endDate)}</small>
            </div>
            <span className="date-icon" aria-hidden style={{ display: "inline-flex", alignItems: "center", color: "#000" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor"/>
                <path d="M16 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Room type select placed to the right of date pill and left of Adult control */}
        <div style={{ minWidth: 100, display: "flex", alignItems: "center", marginLeft: 6 }}>
          <select
            name="roomType"
            value={options.roomType || ""}
            onChange={(e) => handleRoomType && handleRoomType(e.target.value)}
            aria-label="Select room type"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid rgba(11,18,32,0.06)",
              background: "white",
              fontWeight: 700,
              minWidth: 100,
            }}
            required
          >
            <option value="">Room Type</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </select>
        </div>

        {/* controls: each group uses a translucent white card */}
        <div className="booking-controls" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap", overflowX: "hidden" }}>
          {/* Adult group: single .group (same structure as other controls) */}
          <div className="group" style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 8px", borderRadius: 8, minWidth: 90 }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
              {/* person icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22" fill="currentColor" opacity="0.9"/>
              </svg>
            </span>
            <label style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>Adult</label>

            {/* decrement */}
            <button
              onClick={() => handleOption("adult", "d")}
              style={{ padding: 6, borderRadius: 6, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}
              aria-label="Decrease adults"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>

            <span style={{ minWidth: 18, textAlign: "center", color: "#000", fontSize: 13 }}>{options.adult}</span>

            {/* increment */}
            <button
              onClick={() => handleOption("adult", "i")}
              style={{ padding: 6, borderRadius: 6, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}
              aria-label="Increase adults"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Children group */}
          <div className="group" style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "white",
            padding: "6px 8px",
            borderRadius: 8,
            minWidth: 90
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="currentColor"/>
                <path d="M4 20C4 16 7.58172 14 12 14C16.4183 14 20 16 20 20" fill="currentColor" opacity="0.9"/>
              </svg>
            </span>
            <label style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>Children</label>
            <button onClick={() => handleOption("children", "d")} style={{ padding: 6, borderRadius: 6, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Decrease children">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <span style={{ minWidth: 18, textAlign: "center", color: "#000", fontSize: 13 }}>{options.children}</span>
            <button onClick={() => handleOption("children", "i")} style={{ padding: 6, borderRadius: 6, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Increase children">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Room group */}
          <div className="group" style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "white",
            padding: "6px 8px",
            borderRadius: 8,
            minWidth: 90
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11V19H5V13H19V19H21V11C21 9.89543 20.1046 9 19 9H5C3.89543 9 3 9.89543 3 11Z" fill="currentColor"/>
                <path d="M7 6C7 4.34315 8.34315 3 10 3H14C15.6569 3 17 4.34315 17 6V9H7V6Z" fill="currentColor" opacity="0.95"/>
              </svg>
            </span>
            <label style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>Room</label>
            <button onClick={() => handleOption("room", "d")} style={{ padding: 6, borderRadius: 6, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Decrease rooms">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <span style={{ minWidth: 18, textAlign: "center", color: "#000", fontSize: 13 }}>{options.room}</span>
            <button onClick={() => handleOption("room", "i")} style={{ padding: 6, borderRadius: 6, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Increase rooms">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={onBookNow}
          disabled={submitting || syncing}
          className="booking-cta"
          style={{
            background: "linear-gradient(90deg,#ff7a59,#ffbf69)",
            color: "#000",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            fontWeight: 700,
            opacity: submitting || syncing ? 0.8 : 1,
            cursor: submitting || syncing ? "wait" : "pointer",
            marginLeft: isStatic ? 0 : 4,
            width: isStatic ? "100%" : undefined,
          }}
          aria-label="Book now"
        >
          {submitting ? "Saving..." : "Book Now"}
        </button>
      </div>

      {openDate && (
        // Replace the calendar container styles to align under the date pill on mobile/static
        <div
          ref={calendarRef}
          style={{
            position: isStatic ? "relative" : "absolute",
            bottom: isStatic ? "auto" : "100%",
            left: isStatic ? "0" : "50%",
            transform: isStatic ? "none" : "translateX(-50%)",
            marginBottom: 12,
            zIndex: 80,
            background: "#ffffff",
            borderRadius: 10,
            border: "1px solid rgba(11,18,32,0.06)",
            boxShadow: "0 10px 30px rgba(11,18,32,0.12)",
            overflow: "hidden",
            width: isStatic ? "100%" : undefined,

            // NEW: when mobile/static, left-align the calendar and constrain width so it sits under the input
            display: isStatic ? "flex" : undefined,
            justifyContent: isStatic ? "flex-start" : undefined,
            boxSizing: "border-box",
            paddingLeft: isStatic ? 8 : undefined,
          }}
        >
          {/* inner wrapper constrains the calendar width on mobile so it lines up with the pill */}
          <div style={{ width: isStatic ? "min(420px, 100%)" : "auto" }}>
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              minDate={new Date()}
              // disable blocked dates so user cannot pick them
              disabledDates={blockedDates}
              // show 1 month on mobile/static, otherwise 2
              months={isStatic ? 1 : 2}
              direction={isStatic ? "vertical" : "horizontal"}
              showSelectionPreview={true}
              editableDateInputs={true}
              showMonthAndYearPickers={true}
              // custom day rendering: red background for blocked, blue small marker for available
              dayContentRenderer={(date) => {
                const iso = date.toISOString().slice(0, 10)
                const isBlocked = blockedSet.has(iso)
                const dayNumber = date.getDate()
                const style = {
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  fontSize: 13,
                }
                if (isBlocked) {
                  return (
                    <div style={{ ...style, background: "rgba(220,38,38,0.12)", color: "#b91c1c", fontWeight: 700 }}>
                      {dayNumber}
                    </div>
                  )
                }
                // available days — subtle blue marker (avoid interfering with selection styling)
                return (
                  <div style={{ ...style, color: "#0ea5e9", fontWeight: 700 }}>
                    {dayNumber}
                  </div>
                )
              }}
              rangeColors={["#3b82f6"]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
