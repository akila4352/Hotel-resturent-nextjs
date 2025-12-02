import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { parseISO, format, differenceInDays } from "date-fns"
import { rtdb } from "../lib/firebase"
import { ref as dbRef, push } from "firebase/database"
import { rooms as roomOptions } from "@/sections/Rooms" // <-- use shared rooms

export default function ReservationPage() {
  const router = useRouter()
  const { checkIn, checkOut, adults = "1", children = "0", rooms = "1", roomType: qRoomType } = router.query

  // compute a normalized roomType from query (lowercase)
  const queryRoomType = qRoomType ? String(qRoomType).toLowerCase() : ""

  // parse dates safely
  const [ci, setCi] = useState(null)
  const [co, setCo] = useState(null)
  useEffect(() => { 
    try {
      if (checkIn) setCi(parseISO(String(checkIn)))
      if (checkOut) setCo(parseISO(String(checkOut)))
    } catch (e) {
      setCi(null); setCo(null)
    }
  }, [checkIn, checkOut])

  const nights = useMemo(() => {
    if (ci && co) return Math.max(1, differenceInDays(co, ci))
    return 0
  }, [ci, co])
 
  const totalGuests = Number(adults || 0) + Number(children || 0)

  // UI state
  const [step, setStep] = useState(1) // 1 = choose room, 2 = guest details
  // single selectedRoom kept for compatibility with some UI, but main selection is selectedRooms
  const [selectedRoom, setSelectedRoom] = useState(roomOptions[0] || null)
  // support multiple room selections: { room, qty }
  const [selectedRooms, setSelectedRooms] = useState(() => {
    // preselect from query.room if present
    const qRoom = router.query?.room
    if (qRoom) {
      const found = roomOptions.find((rr) => String(rr.id) === String(qRoom))
      return found ? [{ room: found, qty: 1 }] : []
    }
    return []
  })
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  // form state used in Guest Details — initialize to avoid ReferenceError
  const [form, setForm] = useState({
    country: "",
    mobile: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    email: "",
    notes: "",
    agree: false,
  })

  // helpers to manage selectedRooms
  const isRoomSelected = (r) => selectedRooms.some((sr) => String(sr.room.id) === String(r.id))
  const setRoomQty = (roomId, qty) => {
    setSelectedRooms((prev) =>
      prev
        .map((sr) => (String(sr.room.id) === String(roomId) ? { ...sr, qty: Math.max(1, qty) } : sr))
        .filter(Boolean)
    )
  }
  const addRoom = (r) => {
    setSelectedRooms((prev) => {
      const found = prev.find((sr) => String(sr.room.id) === String(r.id))
      if (found) return prev
      return [...prev, { room: r, qty: 1 }]
    })
    setSelectedRoom(r)
  }
  const removeRoom = (r) => {
    setSelectedRooms((prev) => prev.filter((sr) => String(sr.room.id) !== String(r.id)))
  }
  
  // combined capacity checks (only enforce maximum capacities)
  const combinedCapacity = (roomsList = selectedRooms) => {
    const totalAdultCap = roomsList.reduce((s, sr) => s + ((sr.room.maxAdults ?? 2) * sr.qty), 0)
    const totalChildCap = roomsList.reduce((s, sr) => s + ((sr.room.maxChildren ?? 1) * sr.qty), 0)
    return { totalAdultCap, totalChildCap }
  }
  const multiSuitability = (roomsList = selectedRooms) => {
    const { totalAdultCap, totalChildCap } = combinedCapacity(roomsList)
    if (Number(adults || 0) > totalAdultCap) return { ok: false, reason: `Selected rooms capacity only ${totalAdultCap} adults` }
    if (Number(children || 0) > totalChildCap) return { ok: false, reason: `Selected rooms capacity only ${totalChildCap} children` }
    return { ok: true, reason: "" }
  }

  // if query.room or query.roomType present, try to pre-select that room; otherwise keep default
  useEffect(() => {
    const qRoom = router.query?.room
    const qType = router.query?.roomType ? String(router.query.roomType).toLowerCase() : null

    if (qRoom) {
      const found = roomOptions.find((rr) => String(rr.id) === String(qRoom))
      if (found) {
        setSelectedRoom(found)
        return
      }
    }

    // if roomType provided, try to select the first room matching that type
    if (qType) {
      const foundByType = roomOptions.find((rr) => String(rr.type).toLowerCase() === qType)
      if (foundByType) {
        setSelectedRoom(foundByType)
        // set selectedRooms to include that room as default
        setSelectedRooms([{ room: foundByType, qty: 1 }])
        return
      }
    }

    setSelectedRoom((prev) => prev || roomOptions[0] || null)
  }, [router.query?.room, router.query?.roomType]) // re-run when query changes

  // only show rooms matching the selected query roomType (if provided)
  const visibleRooms = (queryRoomType ? roomOptions.filter((r) => String(r.type).toLowerCase() === queryRoomType) : roomOptions)

  // numeric guest counts used in several places
  const numAdults = Number(adults || 0)
  const numChildren = Number(children || 0)
  
  // returns { ok, reason } for a room vs current guest counts
  // NOTE: only enforce maximum capacities (adults and children) per user request
  const roomSuitability = (r) => {
    if (!r) return { ok: false, reason: "No room selected" }
    if (numAdults > (r.maxAdults ?? 2)) return { ok: false, reason: `Allows up to ${r.maxAdults} adult(s).` }
    if (numChildren > (r.maxChildren ?? 1)) return { ok: false, reason: `Allows up to ${r.maxChildren} child(ren).` }
    return { ok: true, reason: "" }
  }

  // when user clicks "Continue" for a room we ensure it's included then proceed
  const onSelectRoom = (room) => {
    if (!isRoomSelected(room)) addRoom(room)
    // only proceed if combined capacity is enough
    const suitability = multiSuitability()
    if (!suitability.ok) {
      alert(suitability.reason)
      return
    }
    setStep(2)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Central continue handler from the summary/total area (single Continue button)
  const continueFromSummary = () => {
    if (selectedRooms.length === 0 && !selectedRoom) {
      alert("Please select a room before continuing.")
      return
    }
    const suitability = multiSuitability()
    if (!suitability.ok) {
      alert(suitability.reason + ". Please add more rooms.")
      return
    }
    setStep(2)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }))
  }

  const handleBack = () => setStep(1)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // basic validation before attempting to save
    const numAdults = Number(adults || 0)
    const numChildren = Number(children || 0)

    if (!selectedRoom) {
      alert("Please select a room before booking.")
      return
    }

    if (!ci || !co) {
      alert("Please select valid check-in and check-out dates.")
      return
    }

    // for multi-room flow: verify combined capacity satisfies guests (only maximums)
    const suitability = multiSuitability()
    if (!suitability.ok) {
      alert(suitability.reason + ". Please add more rooms.")
      return
    }

    // all validation passed — proceed to save
    setSubmitting(true)
    try {
      const payload = {
        checkIn: ci ? ci.toISOString().slice(0, 10) : checkIn || "",
        checkOut: co ? co.toISOString().slice(0, 10) : checkOut || "",
        nights,
        adults: Number(adults || 0),
        children: Number(children || 0),
        rooms: Number(rooms || 0),
        totalGuests,
        // include all selected room types and quantities
        selectedRooms: selectedRooms.length
          ? selectedRooms.map((sr) => ({ id: sr.room.id, title: sr.room.title, price: sr.room.price || 0, qty: sr.qty }))
          : selectedRoom
          ? [{ id: selectedRoom.id, title: selectedRoom.title, price: selectedRoom.price || 0, qty: 1 }]
          : null,
        guest: {
          country: form.country,
          mobile: form.mobile,
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          email: form.email,
          notes: form.notes,
        },
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      }

      // push to Realtime DB under 'reservations'
      await push(dbRef(rtdb, "reservations"), payload)

      // --- Attempt to push the booking as an ICS event to the remote calendar (Booking.com) ---
      // Build a minimal ICS representing the reserved date range (DTSTART inclusive, DTEND exclusive)
      const buildIcsForReservation = (guest, startDateIso, endDateIso) => {
        const formatDate = (iso) => {
          const dt = new Date(iso)
          const y = dt.getUTCFullYear().toString().padStart(4, "0")
          const m = (dt.getUTCMonth() + 1).toString().padStart(2, "0")
          const d = dt.getUTCDate().toString().padStart(2, "0")
          return `${y}${m}${d}`
        }
        const dtstamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z"
        const uid = `res-${Date.now()}@${typeof window !== "undefined" ? window.location.hostname : "example.com"}`
        const dtstart = formatDate(startDateIso)
        const dtend = formatDate(endDateIso) // iCal DTEND is exclusive for DATE values

        const summary = `Reservation: ${guest.firstName || ""} ${guest.lastName || ""}`.trim()
        const description = [
          `Guests: adults=${payload.adults}, children=${payload.children}, rooms=${payload.rooms}`,
          `Nights: ${payload.nights}`,
          `Email: ${guest.email || ""}`,
          `Phone: ${guest.mobile || ""}`,
        ].filter(Boolean).join("\\n")

        return [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//YourSite//ReservationSync//EN",
          "CALSCALE:GREGORIAN",
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART;VALUE=DATE:${dtstart}`,
          `DTEND;VALUE=DATE:${dtend}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          `STATUS:CONFIRMED`,
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n")
      }

      // Try to POST the ICS to our proxy which will attempt to push it to the remote URL.
      const tryPushIcs = async (ics) => {
        try {
          const iCalUrl = process.env.NEXT_PUBLIC_TRIPLE_ICAL
          if (!iCalUrl) return { ok: false, message: "No remote calendar configured." }

          // Detect Booking.com export/read-only URLs and avoid attempting to push there.
          // Booking.com export endpoints (like the one you used) are typically read-only and return 500 on PUT.
          try {
            const parsed = new URL(iCalUrl)
            const host = (parsed.hostname || "").toLowerCase()
            const path = (parsed.pathname || "").toLowerCase()
            if (host.includes("booking.com") || path.includes("/v1/export")) {
              return {
                ok: false,
                message:
                  "Configured calendar appears to be a Booking.com export (read-only). Automatic push is not supported. Use Booking.com partner API / channel manager or import the generated .ics manually.",
              }
            }
          } catch (e) {
            // ignore parsing errors and continue to attempt push
            console.warn("tryPushIcs: failed to parse iCalUrl", e)
          }

          // Non-Booking.com destinations: attempt POST -> proxy -> remote PUT
          const proxyUrl = `/api/fetch-ical?url=${encodeURIComponent(iCalUrl)}`
          const res = await fetch(proxyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ics, method: "PUT" }), // try PUT by default
          })
          const json = await res.json().catch(() => ({ ok: false, message: `HTTP ${res.status}` }))
          if (!res.ok || !json.ok) return { ok: false, message: json?.message || `Remote responded ${res.status}` }
          return { ok: true, message: json.message || "Pushed" }
        } catch (err) {
          return { ok: false, message: err?.message || "Unknown error" }
        }
      }

      // build ICS and attempt push (DTEND uses checkOut date)
      const ics = buildIcsForReservation(payload.guest || {}, payload.checkIn, payload.checkOut)
      const pushResult = await tryPushIcs(ics)

      // Inform user about overall outcome: reservation saved + calendar push result
      if (pushResult.ok) {
        alert(`Booking request saved. Remote calendar updated: ${pushResult.message}`)
      } else {
        // Give a clearer message when push not possible (e.g. Booking.com export URLs are read-only)
        if (String(pushResult.message || "").toLowerCase().includes("booking.com") || String(pushResult.message || "").toLowerCase().includes("read-only")) {
          alert(
            "Booking request saved. Automatic remote calendar update was not performed because the configured calendar is read-only (Booking.com export). Use Booking.com's partner API or a channel manager to sync availability, or import the generated .ics manually."
          )
        } else {
          alert(`Booking request saved. Remote calendar update failed: ${pushResult.message}`)
        }
      }

      setSaved(true)
      setSubmitting(false)
      // navigate to home after a short delay so user sees the alerts
      setTimeout(() => {
        router.push("/").catch(() => {})
      }, 1200)
    } catch (err) {
      console.error("Failed saving reservation:", err)
      alert("Failed to save reservation. Please try again.")
      setSubmitting(false)
    }
  }

  // mobile summary toggle state
  const [showSummary, setShowSummary] = useState(false)

  // avoid reading window during SSR — determine small-screen only after client mount
  const [mounted, setMounted] = useState(false)
  const [isClientSmall, setIsClientSmall] = useState(false)
  useEffect(() => {
    setMounted(true)
    const update = () => setIsClientSmall(window.innerWidth < 768)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // small step indicator UI
  const StepHeader = () => (
    <div className="step-header">
      <div className="step-row">
        <div className={`step-pill ${step === 1 ? "active" : ""}`}>1. Choose Room</div>
        <div className={`step-bar ${step > 1 ? "done" : ""}`} />
        <div className={`step-pill ${step === 2 ? "active" : ""}`}>2. Guest Details</div>
      </div>
    </div>
  )

  // helper to produce concise occupancy / AC string for a room object
  const formatRoomMeta = (r) => {
    if (!r) return ""
    const minA = Number.isFinite(r.minAdults) ? r.minAdults : null
    const maxA = Number.isFinite(r.maxAdults) ? r.maxAdults : null
    let adultsPart = ""
    if (minA != null && maxA != null) {
      adultsPart = minA === maxA ? `${minA} adult${minA > 1 ? "s" : ""}` : `${minA}–${maxA} adults`
    } else if (minA != null) {
      adultsPart = `${minA}+ adults`
    } else if (maxA != null) {
      adultsPart = `Up to ${maxA} adults`
    }

    const maxC = Number.isFinite(r.maxChildren) ? r.maxChildren : null
    let childrenPart = ""
    if (maxC != null) childrenPart = maxC === 0 ? "no children" : `up to ${maxC} child${maxC > 1 ? "ren" : ""}`

    const special = r.oneAdultRequiresChild ? "1 adult requires 1 child" : ""
    const acPart = typeof r.ac === "boolean" ? (r.ac ? "AC" : "Non-AC") : ""
    return [adultsPart, childrenPart, special, acPart].filter(Boolean).join(" · ")
  }

  return (
    <div className="reservation-page">
      {/* Left summary */}
      {/* aria-hidden / visibility for small screens is decided only after mount to avoid hydration mismatch */}
      <aside
        className={`aside ${showSummary ? "visible" : ""}`}
        aria-hidden={mounted && isClientSmall ? !showSummary : false}
      >
        {/* full details (hidden on small screens unless .visible) */}
        <div className="full-details">
          <h3 className="heading">DATES</h3>
          <div className="aside-body">
            <div><strong>Check-In</strong></div>
            <div>{ci ? format(ci, "EEE, yyyy-MM-dd") : "-"}</div>
            <div className="spacer" />
            <div><strong>Check-Out</strong></div>
            <div>{co ? format(co, "EEE, yyyy-MM-dd") : "-"}</div>
            <div className="spacer" />
            <div><strong>Total Nights</strong></div>
            <div>{nights}</div>
            <div className="spacer" />
            <div><strong>Total Adults</strong> {adults}</div>
            <div><strong>Total Children</strong> {children}</div>
            <div><strong>Total Guests</strong> {totalGuests} People</div>
          </div>

          <hr className="divider" />

          <h4 className="subheading">SELECTED ROOM</h4>
          <div className="selected-room">
            {selectedRooms.length === 0 ? (
              <>
                <div className="room-title">{selectedRoom?.title || "No room selected"}</div>
                <div className="room-price">Price per night: {selectedRoom ? `${selectedRoom.price}$` : "-"}</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>{selectedRooms.length} selected</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {selectedRooms.map((sr) => (
                    <div key={sr.room.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{sr.room.title} <small style={{ fontWeight: 600, color: "#666" }}>x{sr.qty}</small></div>
                        <div style={{ color: "#666", fontSize: 13 }}>{formatRoomMeta(sr.room)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700 }}>{((sr.room.price || 0) * sr.qty).toFixed(2)}$</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{(sr.room.price || 0).toFixed(2)}$ / night</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                  <div>Total</div>
                  <div>{selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0).toFixed(2)}$</div>
                </div>
                {/* combined suitability hint */}
                {(() => {
                  const s = multiSuitability()
                  return !s.ok ? (
                    <div style={{ marginTop: 8, color: "#b91c1c", fontSize: 13 }}>
                      {`Not suitable: ${s.reason}`}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, color: "#065f46", fontSize: 13 }}>Selected rooms cover your guest count</div>
                  )
                })()}
              </>
            )}
            <div className="room-details">
              <div className="row"><div>Space Price</div><div>{selectedRooms.length ? `${selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0).toFixed(2)}$` : (selectedRoom ? `${(selectedRoom.price).toFixed(2)}$` : "-")}</div></div>
              <div className="row"><div>Tax</div><div>FREE</div></div>
            </div>

          </div> {/* <-- ensure selected-room is closed BEFORE Continue button */}

          {/* single Continue button under the totals */}
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={continueFromSummary}
              className="btn continue aside-continue"
              disabled={!multiSuitability().ok}
              title={!multiSuitability().ok ? multiSuitability().reason : "Continue to Guest Details"}
            >
              Continue
            </button>
          </div>

        </div> {/* <-- close full-details */}

        {/* compact total preview always visible on mobile; click to toggle details */}
        <div
          className={`total-preview${showSummary ? " open" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setShowSummary((s) => !s)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowSummary((s) => !s) }}
          aria-expanded={showSummary}
        >
          <div className="total-left">TOTAL</div>
          <div className="total-right">
            {selectedRooms.length
              ? `${(selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0) * Math.max(1, nights)).toFixed(2)}$`
              : selectedRoom
              ? `${(selectedRoom.price * Math.max(1, nights)).toFixed(2)}$`
              : "-"}
          </div>

          {/* small Continue button in compact preview for mobile */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); continueFromSummary(); }}
            className="btn small continue preview-continue"
            disabled={!multiSuitability().ok}
            title={!multiSuitability().ok ? multiSuitability().reason : "Continue"}
          >
            Continue
          </button>
          
          <div className={`chev ${showSummary ? "open" : ""}`}>▾</div>
        </div>
      </aside>

      {/* Right: steps + content */}
      <main className="main">
        <div className="mobile-toggle">
          <button type="button" className="toggle-btn" onClick={() => setShowSummary((s) => !s)} aria-expanded={showSummary}>
            {showSummary ? "Hide summary" : "Show summary"}
          </button>
        </div>

        <StepHeader />

        {saved ? (
          <div className="saved">
            <h2>Reservation received</h2>
            <p>Your booking has been saved. A team member will contact you shortly.</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <section>
                <h2 className="section-title">Choose a room</h2>
                <div className="room-grid" role="list">
                  {visibleRooms.length === 0 ? (
                    <div style={{ padding: 20, width: "100%", textAlign: "center", color: "#666" }}>
                      No rooms match the selected room type. Please choose a different type.
                    </div>
                  ) : (
                    visibleRooms.map((r) => {
                      // if we add this room (or it's already added) what is combined capacity?
                      const already = selectedRooms.find((sr) => String(sr.room.id) === String(r.id))
                      const tempList = already ? selectedRooms : [...selectedRooms, { room: r, qty: 1 }]
                      const suitability = multiSuitability(tempList)
                      return (
                        <div key={r.id} className={`room-card ${already ? "selected" : ""}`} role="listitem">
                          <div className="room-img" style={{ backgroundImage: `url(${r.img})` }} />
                          <div className="room-row">
                            <div>
                              <div className="room-name">{r.title}</div>
                              <div className="room-rate">{r.price}$ / night</div>
                              {/* occupancy / AC details */}
                              <div className="room-meta" style={{ marginTop: 6, color: "#555", fontSize: 13, fontWeight: 600 }}>
                                {formatRoomMeta(r)}
                              </div>
                              {/* quick hint when adding this room would still be insufficient */}
                              {!suitability.ok && (
                                <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 13 }}>
                                  {suitability.reason}
                                </div>
                              )}
                            </div>
                            <div className="room-actions">
                              {/* toggle add/remove */}
                              {!already ? (
                                <button onClick={() => addRoom(r)} className="btn small muted">Add</button>
                              ) : (
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <button onClick={() => setRoomQty(r.id, Math.max(1, already.qty - 1))} className="btn small muted">-</button>
                                  <div style={{ minWidth: 28, textAlign: "center", fontWeight: 800 }}>{already.qty}</div>
                                  <button onClick={() => setRoomQty(r.id, already.qty + 1)} className="btn small muted">+</button>
                                  <button onClick={() => removeRoom(r)} className="btn small">Remove</button>
                                </div>
                              )}
                              {/* per-card Continue removed — single Continue is now in the summary */}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="section-title">Guest Details</h2>
                <form onSubmit={handleSubmit}>
                  <div className="two-col-grid">
                    <div>
                      <label className="label">Country *</label>
                      <select name="country" required value={form.country} onChange={handleChange} className="input">
                        <option value="">Select Your Country</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Sri Lanka</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Mobile Number *</label>
                      <input name="mobile" required value={form.mobile} onChange={handleChange} placeholder="Mobile Number" className="input" />
                    </div>

                    <div>
                      <label className="label">First Name *</label>
                      <input name="firstName" required value={form.firstName} onChange={handleChange} placeholder="First name" className="input" />
                    </div>

                    <div>
                      <label className="label">Last Name</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className="input" />
                    </div>

                    <div className="full">
                      <label className="label">Address *</label>
                      <input name="address" required value={form.address} onChange={handleChange} placeholder="Street Address" className="input" />
                    </div>

                    <div>
                      <label className="label">City / Town *</label>
                      <input name="city" required value={form.city} onChange={handleChange} placeholder="City or Town name" className="input" />
                    </div>

                    <div>
                      <label className="label">Email Address *</label>
                      <input name="email" required type="email" value={form.email} onChange={handleChange} placeholder="Contact Email Address" className="input" />
                    </div>

                    <div className="full">
                      <label className="label">Extra Notes</label>
                      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any extra details" rows={4} className="input" />
                    </div>

                    <div className="full agree-row">
                      <input name="agree" id="agree" type="checkbox" checked={form.agree} onChange={handleChange} required />
                      <label htmlFor="agree" className="agree-label">By clicking here, I state that I have read and understood the terms and conditions.</label>
                    </div>
                  </div>

                  <div className="action-row">
                    <button type="button" onClick={handleBack} className="btn secondary">Back</button>
                    <button type="submit" disabled={submitting} className="btn primary">{submitting ? "Saving..." : "BOOK RESERVATION"}</button>
                  </div>
                </form>
              </section>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        /* mobile-first layout */
        .reservation-page{
          max-width:1100px;
          margin:18px auto;
          padding:12px;
          display:flex;
          flex-direction:column;
          gap:16px;
          box-sizing:border-box;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }
        .aside{
          width:100%;
          background:#f7f7f7;
          padding:14px;
          border-radius:8px;
          box-sizing:border-box;
        }
        .heading{ margin:0 0 8px 0; letter-spacing:0.4px; }
        .aside-body{ font-size:14px; color:#333; line-height:1.6; }
        .spacer{ height:8px; }
        .divider{ margin:18px 0; border:none; height:1px; background:#e9e9e9; }
        .subheading{ margin:6px 0; }
        .selected-room{ background:#fff; padding:12px; border-radius:8px; margin-bottom:12px; }
        .room-title{ font-weight:700; }
        .room-price{ color:#666; font-size:13px; }
        .room-details .row{ display:flex; justify-content:space-between; font-size:14px; margin-top:6px; }
        .total-box{ margin-top:12px; background:#111; color:#fff; padding:12px; border-radius:8px; font-weight:700; }

        /* compact total preview for mobile */
        .total-preview{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          padding:12px;
          border-radius:8px;
          background:#111;
          color:#fff;
          font-weight:700;
          cursor:pointer;
          user-select:none;
        }
        .total-preview .chev{ margin-left:8px; transition: transform 200ms ease; }
        .total-preview.open .chev{ transform: rotate(180deg); }
        .total-left{ font-size:14px; color:#fff; }
        .total-right{ font-size:16px; color:#fff; }

        .main{ width:100%; box-sizing:border-box; background:#fff; padding:12px; border-radius:8px; }
        .mobile-toggle{ display:block; margin-bottom:12px; }
        .toggle-btn{ width:100%; padding:10px; border-radius:8px; border:1px solid #ddd; background:#fff; }

        .step-header{ margin-bottom:12px; }
        .step-row{ display:flex; gap:8px; align-items:center; }
        .step-pill{ padding:8px 12px; border-radius:8px; background:#eee; color:#666; font-weight:700; }
        .step-pill.active{ background:#ff7a59; color:#000; }
        .step-bar{ height:8px; flex:1; background:#f2f2f2; border-radius:4px; }
        .step-bar.done{ background:#ffbf69; }

        .section-title{ margin-top:0; margin-bottom:12px; font-size:20px; }

        .room-grid{ display:grid; grid-template-columns: 1fr; gap:12px; }
        .room-card{ border:1px solid #eee; border-radius:8px; padding:12px; background:#fafafa; display:flex; flex-direction:column; gap:10px; }
        .room-card.selected{ border-color:#ff7a59; box-shadow:0 2px 8px rgba(255,122,89,0.06); }
        .room-img{ height:160px; background-size:cover; background-position:center; border-radius:6px; }

        .room-row{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .room-name{ font-weight:700; font-size:16px; }
        .room-rate{ color:#666; font-size:13px; margin-top:4px; }
        .room-actions{ display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
        .btn{ border-radius:8px; padding:10px 12px; cursor:pointer; border:none; font-weight:600; }
        .btn.small{ padding:8px 10px; font-size:13px; }
        .btn.muted{ background:#fff; border:1px solid #ddd; color:#000; }
        .btn.primary{ background:#b88639; color:#fff; width:100%; }
        .btn.continue, .btn.continue:hover{ background:#ff7a59; color:#000; border:none; }
        .btn.secondary{ background:#eee; color:#000; width:100%; }

        .two-col-grid{ display:grid; grid-template-columns: 1fr; gap:12px; }
        .label{ display:block; margin-bottom:6px; font-size:13px; }
        .input{ width:100%; padding:10px; border-radius:8px; border:1px solid #e6e6e6; box-sizing:border-box; }
        .full{ grid-column: 1 / -1; }

        .agree-row{ display:flex; gap:8px; align-items:flex-start; }
        .agree-label{ font-size:13px; }

        .action-row{ margin-top:16px; display:flex; flex-direction:column; gap:12px; }

        /* larger screens */
        @media (min-width: 769px){
          .reservation-page{ flex-direction:row; padding:20px; gap:24px; }
          .aside{ width:320px; flex-shrink:0; order:0; display:block; }
          .main{ order:1; padding:18px; }
          .mobile-toggle{ display:none; }
          .room-grid{ grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
          .two-col-grid{ grid-template-columns: 1fr 1fr; }
          .room-actions{ flex-direction:row; align-items:center; }
          .btn.primary{ width:auto; min-width:180px; }
          .btn.secondary{ width:auto; min-width:120px; }
        }

        /* very small screens tweaks */
        @media (max-width: 420px){
          .room-img{ height:180px; }
          .toggle-btn{ padding:12px; font-size:15px; }
          .step-pill{ font-size:14px; padding:8px 10px; }
        }

        /* hide full-details on small screens unless aside.visible */
        @media (max-width: 768px){
          .aside .full-details{ display:none; }
          .aside.visible .full-details{ display:block; margin-bottom:12px; }
          /* keep preview visible */
          .aside .total-preview{ display:flex; }
        }

        /* aside continue button style */
        .aside-continue{ width:100%; margin-top:8px; background:#ff7a59; color:#000; border:none; padding:10px 12px; border-radius:8px; font-weight:700; }
        .preview-continue{ margin-left:8px; background:#ff7a59; color:#000; border:none; padding:6px 8px; border-radius:8px; font-weight:700; }
      `}</style>
    </div>
  )
}

