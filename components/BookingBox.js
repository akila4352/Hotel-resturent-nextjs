import React from "react"
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
  handleBookNow,
  submitting,
  forceStatic = false, // NEW prop: when true render in document flow (mobile)
}) {
  const router = useRouter()
  const formattedDate = (d) => (d ? format(d, "dd LLL yyyy").toUpperCase() : "")

  // navigate to reservation page — do NOT submit/save here to avoid showing alerts.
  // The reservation page will handle final save/alert after guest details are entered.
  const onBookNow = () => {
    if (submitting) return
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
    }

    router.push({ pathname: "/reservation", query })
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
          gap: 10,
          alignItems: "center",
          padding: isStatic ? "14px" : "12px 14px",
          background: isStatic ? "#ffffff" : "rgba(255,255,255,0.60)", // solid white on responsive/static
          borderRadius: 12,
          border: "1px solid rgba(11,18,32,0.06)",
          boxShadow: "0 6px 18px rgba(11,18,32,0.06)",
          width: isStatic ? "100%" : undefined,
        }}
      >
        {/* Single date pill: shows check-in / check-out stacked (simpler for users) */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="booking-date"
            onClick={() => setOpenDate((s) => !s)}
            style={{
              background: "white",
              color: "#000",
              border: "1px solid rgba(11,18,32,0.06)",
              padding: "10px 12px",
              borderRadius: 8,
              minWidth: 180,
              fontWeight: 800,
              fontSize: 14,
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

        {/* controls: each group uses a translucent white card */}
        <div className="booking-controls" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Adult group: single .group (same structure as other controls) */}
          <div className="group" style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "8px 10px", borderRadius: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
              {/* person icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22" fill="currentColor" opacity="0.9"/>
              </svg>
            </span>
            <label style={{ fontSize: 12, color: "#000", fontWeight: 700 }}>Adult</label>

            {/* decrement */}
            <button
              onClick={() => handleOption("adult", "d")}
              style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Decrease adults"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>

            <span style={{ minWidth: 20, textAlign: "center", color: "#000" }}>{options.adult}</span>

            {/* increment */}
            <button
              onClick={() => handleOption("adult", "i")}
              style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
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
            padding: "8px 10px",
            borderRadius: 8
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="currentColor"/>
                <path d="M4 20C4 16 7.58172 14 12 14C16.4183 14 20 16 20 20" fill="currentColor" opacity="0.9"/>
              </svg>
            </span>
            <label style={{ fontSize: 12, color: "#000", fontWeight: 700 }}>Children</label>
            <button onClick={() => handleOption("children", "d")} style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Decrease children">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <span style={{ minWidth: 20, textAlign: "center", color: "#000" }}>{options.children}</span>
            <button onClick={() => handleOption("children", "i")} style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Increase children">
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
            padding: "8px 10px",
            borderRadius: 8
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: "#000" }} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11V19H5V13H19V19H21V11C21 9.89543 20.1046 9 19 9H5C3.89543 9 3 9.89543 3 11Z" fill="currentColor"/>
                <path d="M7 6C7 4.34315 8.34315 3 10 3H14C15.6569 3 17 4.34315 17 6V9H7V6Z" fill="currentColor" opacity="0.95"/>
              </svg>
            </span>
            <label style={{ fontSize: 12, color: "#000", fontWeight: 700 }}>Room</label>
            <button onClick={() => handleOption("room", "d")} style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Decrease rooms">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <span style={{ minWidth: 20, textAlign: "center", color: "#000" }}>{options.room}</span>
            <button onClick={() => handleOption("room", "i")} style={{ padding: 8, borderRadius: 8, background: "transparent", border: "1px solid rgba(11,18,32,0.06)", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="Increase rooms">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={onBookNow}
          disabled={submitting}
          className="booking-cta"
          style={{
            background: "linear-gradient(90deg,#ff7a59,#ffbf69)",
            color: "#000",
            border: "none",
            padding: "12px 18px",
            borderRadius: 10,
            fontWeight: 700,
            opacity: submitting ? 0.8 : 1,
            cursor: submitting ? "wait" : "pointer",
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
              // NEW: show a single vertical month on mobile/static to avoid large popups
              months={isStatic ? 1 : 2}
              direction={isStatic ? "vertical" : "horizontal"}
              showSelectionPreview={true}
              editableDateInputs={true}
              showMonthAndYearPickers={true}
              rangeColors={["#3b82f6"]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
