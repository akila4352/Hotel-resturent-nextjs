import React, { useState } from "react"
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
  submitting,
  forceStatic = false,
}) {
  const router = useRouter()
  const formattedDate = (d) => (d ? format(d, "dd LLL yyyy").toUpperCase() : "")

  const onDateToggle = () => {
    try {
      setOpenDate((s) => !s)
    } catch (e) {
      console.warn("setOpenDate unavailable", e)
    }
  }

  const onCheckAvailability = () => {
    let start = range && range[0] && range[0].startDate
    let end = range && range[0] && range[0].endDate

    if (!start || !end) {
      alert("Please select check-in and check-out dates.")
      return
    }

    if (start && end && start.toDateString() === end.toDateString()) {
      end = new Date(start)
      end.setDate(end.getDate() + 1)
    }

    const checkIn = format(start, "yyyy-MM-dd")
    const checkOut = format(end, "yyyy-MM-dd")

    router.push({
      pathname: "/availability",
      query: {
        checkIn,
        checkOut,
        adults: String(options?.adult ?? 1),
        children: String(options?.children ?? 0),
      },
    })
  }

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
        {/* Date pill */}
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

        {/* Guest controls */}
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

        {/* Check Availability button */}
        <button
          onClick={onCheckAvailability}
          disabled={submitting}
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
            opacity: submitting ? 0.8 : 1,
            cursor: submitting ? "wait" : "pointer",
            marginLeft: isStatic ? 0 : 4,
            width: isStatic ? "100%" : undefined,
            minWidth: 160,
          }}
          aria-label="Check availability"
        >
          Check Availability
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
