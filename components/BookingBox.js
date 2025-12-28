import React, { useEffect, useMemo, useState } from "react"
import { DateRange } from "react-date-range"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { rtdb } from "@/lib/firebase"
import { ref as dbRef, onValue } from "firebase/database"

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

  // mapping roomType -> iCal URL
  const iCalMap = {
    room3: "https://ical.booking.com/v1/export?t=a4e9369b-eba9-4794-9c66-3b461d62862a",
    room2: "https://ical.booking.com/v1/export?t=b6905504-0332-405d-bbda-9c90a024503b",
    room5: "https://ical.booking.com/v1/export?t=0daa19a6-a97f-4ede-9fec-e1787aca9672",
    room1: "https://ical.booking.com/v1/export?t=a75aef94-6f98-443a-8b24-f179be163fe5",
    room4: "/calendars/room4.ics",
    room6: "https://ical.booking.com/v1/export?t=dd62bdaf-ffa4-4a91-ae04-7eaed4ec79d5",
  }

  // blocked dates from iCal (Booking.com)
  const [iCalBlockedDates, setICalBlockedDates] = useState([])
  
  // blocked dates from Firebase reservations
  const [firebaseBlockedDates, setFirebaseBlockedDates] = useState([])
  
  // combined blocked dates
  const blockedDates = useMemo(() => {
    return [...iCalBlockedDates, ...firebaseBlockedDates]
  }, [iCalBlockedDates, firebaseBlockedDates])

  // Set of blocked date strings for quick lookup
  const blockedSet = useMemo(() => {
    const s = new Set()
    blockedDates.forEach((d) => s.add(d.toISOString().slice(0, 10)))
    return s
  }, [blockedDates])
 
  // local flag to prevent double-clicks while calendar sync is running
  const [syncing, setSyncing] = useState(false)

  // when the user clicks the date pill/calendar icon: toggle the calendar UI
  const onDateToggle = () => {
    try {
      setOpenDate((s) => !s)
    } catch (e) {
      console.warn("setOpenDate unavailable", e)
    }
  } 

  // parse simple iCal: extract DTSTART/DTEND from VEVENTs
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
        if (cur.status && String(cur.status).toUpperCase() === "CANCELLED") {
          cur = {}
          continue
        }
        if (cur.dtstart) {
          events.push({ 
            dtstart: cur.dtstart, 
            dtend: cur.dtend || cur.dtstart, 
            summary: cur.summary || "" 
          })
        }
        cur = {}
        continue
      }
      
      if (!inEvent) continue

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

    const out = []
    const toDate = (val) => {
      if (!val) return null
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
      const s = toDate(ev.dtstart)
      let e = toDate(ev.dtend)
      if (!s) continue
      if (e) e = addDays(e, -1)
      else e = s
      for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
        out.push(new Date(d))
      }
    }
    return out
  }

  // Fetch Firebase reservations and block dates for selected room type
  useEffect(() => {
    const type = (options?.roomType || "").toLowerCase()
    if (!type) {
      setFirebaseBlockedDates([])
      return
    }

    const bookingsRef = dbRef(rtdb, "reservations")
    
    const unsubscribe = onValue(
      bookingsRef, 
      (snapshot) => {
        try {
          const data = snapshot.val()
          
          if (!data) {
            console.log("Firebase: No reservations found in database")
            setFirebaseBlockedDates([])
            return
          }

          const blocked = []
          let matchedBookings = 0
          
          Object.entries(data).forEach(([bookingId, booking]) => {
            try {
              console.log(`Checking booking ${bookingId}:`, {
                selectedRooms: booking.selectedRooms,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut
              })
              
              if (!booking.selectedRooms || !Array.isArray(booking.selectedRooms)) {
                console.warn(`Booking ${bookingId}: Missing selectedRooms array`)
                return
              }

              const typeNumber = type.replace("room", "")
              
              const hasMatchingRoom = booking.selectedRooms.some(room => {
                const roomId = String(room.id || "")
                const matches = roomId === typeNumber || roomId === type
                console.log(`  Room ID ${roomId} vs ${type} (${typeNumber}): ${matches}`)
                return matches
              })

              if (hasMatchingRoom) {
                matchedBookings++
                
                const checkInStr = booking.checkIn
                const checkOutStr = booking.checkOut
                
                if (!checkInStr || !checkOutStr) {
                  return
                }

                const startDate = new Date(checkInStr)
                const endDate = new Date(checkOutStr)
                
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  return
                }
                
                const currentDate = new Date(startDate)
                while (currentDate <= endDate) {
                  blocked.push(new Date(currentDate))
                  currentDate.setDate(currentDate.getDate() + 1)
                }
              }
            } catch (err) {
              console.error(`Error processing booking ${bookingId}:`, err)
            }
          })

          setFirebaseBlockedDates(blocked)
          console.log(`Firebase: Found ${matchedBookings} bookings for ${type}`)
          console.log(`Firebase: Blocked ${blocked.length} dates for ${type}`)
        } catch (err) {
          console.error("Firebase: Error fetching reservations:", err)
          setFirebaseBlockedDates([])
        }
      },
      (error) => {
        console.error("Firebase: Database read failed:", error)
        setFirebaseBlockedDates([])
      }
    )

    return () => unsubscribe()
  }, [options?.roomType])

  // Fetch iCal when roomType changes
  useEffect(() => {
    const type = (options?.roomType || "").toLowerCase()
    if (!type) {
      setICalBlockedDates([])
      return
    }
    const url = iCalMap[type]
    if (!url) {
      setICalBlockedDates([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const proxyUrl = `/api/fetch-ical?url=${encodeURIComponent(url)}`
        const res = await fetch(proxyUrl)
        if (!res.ok) throw new Error("Failed to fetch iCal via proxy")
        const text = await res.text()
        if (cancelled) return
        const parsed = await parseICal(text)
        if (!cancelled) {
          setICalBlockedDates(parsed)
          console.log(`iCal: Blocked ${parsed.length} dates for ${type}`)
        }
      } catch (err) {
        console.error("iCal fetch/parse error:", err)
        if (!cancelled) setICalBlockedDates([])
      }
    })()
    return () => { cancelled = true }
  }, [options?.roomType])

  // navigate to reservation page
  const onBookNow = async () => {
    if (submitting || syncing) return
    
    if (!options?.roomType) {
      alert("Please select a room type before booking.")
      return
    }
    
    let start = range && range[0] && range[0].startDate
    let end = range && range[0] && range[0].endDate
    
    if (start && end && start.toDateString() === end.toDateString()) {
      end = new Date(start)
      end.setDate(end.getDate() + 1)
    }
    
    const checkIn = start ? format(start, "yyyy-MM-dd") : ""
    const checkOut = end ? format(end, "yyyy-MM-dd") : ""

    // Validate dates are not blocked
    const currentDate = new Date(start)
    const endDate = new Date(end)
    const hasBlockedDate = []
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      if (blockedSet.has(dateStr)) {
        hasBlockedDate.push(format(currentDate, "dd MMM yyyy"))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    if (hasBlockedDate.length > 0) {
      alert(`The following dates are already booked: ${hasBlockedDate.join(", ")}. Please select different dates.`)
      return
    }
    
    const query = {
      checkIn,
      checkOut,
      adults: String(options?.adult ?? 1),
      children: String(options?.children ?? 0),
      rooms: String(options?.room ?? 1),
      roomType: String(options?.roomType ?? ""),
    }

    // Sync calendar before navigating
    setSyncing(true)
    try {
      const iCalUrl = iCalMap[(options?.roomType || "").toLowerCase()]
      if (iCalUrl && !iCalUrl.startsWith("/")) {
        const proxyUrl = `/api/fetch-ical?url=${encodeURIComponent(iCalUrl)}`
        const res = await fetch(proxyUrl)
        if (res.ok) {
          const text = await res.text()
          const parsed = await parseICal(text)
          setICalBlockedDates(parsed)
          console.log(`Calendar sync complete. ${parsed.length} blocked dates.`)
        }
      }
    } catch (err) {
      console.error("Calendar sync error:", err)
    } finally {
      setSyncing(false)
      router.push({ pathname: "/reservation", query })
    } 
  }

  // Compute wrapper position
  const isStatic = !!forceStatic
  const wrapperStyle = {
    position: isStatic ? "static" : isFixed ? "fixed" : "absolute",
    bottom: isStatic ? "auto" : isFixed ? "2%" : "auto",
    top: isStatic ? "auto" : isFixed ? "auto" : `${absTop}px`,
    left: isStatic ? "0" : "50%",
    transform: isStatic ? "none" : "translateX(-50%)",
    zIndex: 60,
    background: isStatic ? "#ffffff" : "transparent",
    color: "#000",
    borderRadius: 0,
    border: "none",
    boxShadow: "0 4px 12px rgba(11,18,32,0.04)",
    padding: isStatic ? "8px 0" : 4,
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
          display: "flex",
          flexDirection: isStatic ? "column" : "row",
          gap: isStatic ? 8 : 4,
          alignItems: isStatic ? "stretch" : "center",
          flexWrap: "nowrap",
          overflowX: "hidden",
          padding: isStatic ? "12px" : "10px 12px",
          background: isStatic ? "#ffffff" : "rgba(255,255,255,0.60)",
          borderRadius: 0,
          border: "0.5px solid rgba(11,18,32,0.08)",
          boxShadow: "0 2px 8px rgba(11,18,32,0.04)",
          width: isStatic ? "100%" : undefined,
        }}
      >
        {/* Room type select is FIRST */}
        <div style={{ display: "flex", alignItems: "center", width: isStatic ? "100%" : "auto" }}>
          <select
            name="roomType"
            value={options.roomType || ""}
            onChange={(e) => handleRoomType && handleRoomType(e.target.value)}
            aria-label="Select room type"
            style={{
              padding: "10px 12px",
              borderRadius: 0,
              border: "0.5px solid rgba(11,18,32,0.08)",
              background: "white",
              fontWeight: 700,
              fontSize: 13,
              height: 44,
              width: isStatic ? "100%" : "auto",
              minWidth: isStatic ? "auto" : 140,
            }}
            required
          >
            <option value="">Room Type</option>
            <option value="room3">ROOM-3. Relax Deluxe</option>
            <option value="room2">ROOM-2. Antik room</option>
            <option value="room5">ROOM-5. No Air Conditioning With Fan</option>
            <option value="room1">ROOM-1. Family Room</option>
            <option value="room4">ROOM-4. Deluxe room</option>
            <option value="room6">ROOM-6. Non Air conditioning With Fan</option>
          </select>
        </div>

        {/* Date pill is SECOND */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap", width: isStatic ? "100%" : "auto" }}>
          <button
            type="button"
            className="booking-date"
            onClick={onDateToggle}
            style={{
              background: "white",
              color: "#000",
              border: "0.5px solid rgba(11,18,32,0.08)",
              padding: "10px 12px",
              borderRadius: 0,
              width: isStatic ? "100%" : "auto",
              minWidth: isStatic ? "auto" : 180,
              height: 44,
              fontWeight: 800,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "space-between",
              boxShadow: "0 2px 6px rgba(11,18,32,0.03)",
            }}
            aria-label="Select dates"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
              <span className="date-label" style={{ letterSpacing: 0.6, color: "#000", fontWeight: 800 }}>{formattedDate(range[0].startDate)}</span>
              <small style={{ color: "#374151", fontWeight: 600, marginTop: 4 }}>{formattedDate(range[0].endDate)}</small>
            </div>
            <span className="date-icon" aria-hidden style={{ display: "inline-flex", alignItems: "center", color: "#000" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor"/>
                <path d="M16 2V6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Controls: Adult and Children ONLY (Room removed) */}
        <div className="booking-controls" style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap", width: isStatic ? "100%" : "auto" }}>
          {/* Adult group */}
          <div className="group" style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "8px 10px", borderRadius: 0, border: "0.5px solid rgba(11,18,32,0.08)", width: isStatic ? "100%" : "auto", minWidth: isStatic ? "auto" : 130, height: 44, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                  <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22" fill="currentColor" opacity="0.9"/>
                </svg>
              </span>
              <label style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>Adult</label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => handleOption("adult", "d")}
                style={{ padding: 6, borderRadius: 0, background: "transparent", border: "0.5px solid rgba(11,18,32,0.08)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, minWidth: 28, minHeight: 28 }}
                aria-label="Decrease adults"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                  <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <span style={{ minWidth: 24, textAlign: "center", color: "#000", fontSize: 14, fontWeight: 700 }}>{options.adult}</span>
              <button
                onClick={() => handleOption("adult", "i")}
                style={{ padding: 6, borderRadius: 0, background: "transparent", border: "0.5px solid rgba(11,18,32,0.08)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, minWidth: 28, minHeight: 28 }}
                aria-label="Increase adults"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                  <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                  <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Children group */}
          <div className="group" style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "8px 10px", borderRadius: 0, border: "0.5px solid rgba(11,18,32,0.08)", width: isStatic ? "100%" : "auto", minWidth: isStatic ? "auto" : 140, height: 44, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                  <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="currentColor"/>
                  <path d="M4 20C4 16 7.58172 14 12 14C16.4183 14 20 16 20 20" fill="currentColor" opacity="0.9"/>
                </svg>
              </span>
              <label style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>Children</label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => handleOption("children", "d")} style={{ padding: 6, borderRadius: 0, background: "transparent", border: "0.5px solid rgba(11,18,32,0.08)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, minHeight: 28 }} aria-label="Decrease children">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                  <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <span style={{ minWidth: 24, textAlign: "center", color: "#000", fontSize: 14, fontWeight: 700 }}>{options.children}</span>
              <button onClick={() => handleOption("children", "i")} style={{ padding: 6, borderRadius: 0, background: "transparent", border: "0.5px solid rgba(11,18,32,0.08)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, minHeight: 28 }} aria-label="Increase children">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#000", fill: "#000", stroke: "#000" }}>
                  <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                  <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Book Now button */}
        <button
          onClick={onBookNow}
          disabled={submitting || syncing}
          className="booking-cta"
          style={{
            background: "linear-gradient(90deg,#ff7a59,#ffbf69)",
            color: "#000",
            border: "none",
            padding: "10px 16px",
            borderRadius: 0,
            fontWeight: 700,
            fontSize: 13,
            height: 44,
            opacity: submitting || syncing ? 0.8 : 1,
            cursor: submitting || syncing ? "wait" : "pointer",
            marginLeft: isStatic ? 0 : 4,
            width: isStatic ? "100%" : undefined,
            minWidth: 130,
          }}
          aria-label="Book now"
        >
          {submitting ? "Saving..." : "Book Now"}
        </button>
      </div>

      {openDate && (
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
            borderRadius: 0,
            border: "0.5px solid rgba(11,18,32,0.08)",
            boxShadow: "0 4px 16px rgba(11,18,32,0.08)",
            overflow: "hidden",
            width: isStatic ? "100%" : undefined,
            display: isStatic ? "flex" : undefined,
            justifyContent: isStatic ? "flex-start" : undefined,
            boxSizing: "border-box",
            paddingLeft: isStatic ? 8 : undefined,
          }}
        >
          <div style={{ width: isStatic ? "min(420px, 100%)" : "auto" }}>
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              minDate={new Date()}
              disabledDates={blockedDates}
              months={isStatic ? 1 : 2}
              direction={isStatic ? "vertical" : "horizontal"}
              showSelectionPreview={true}
              editableDateInputs={true}
              showMonthAndYearPickers={true}
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