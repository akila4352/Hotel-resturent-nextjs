import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { parseISO, format, differenceInDays } from "date-fns"
import { rtdb } from "../lib/firebase"
import { ref as dbRef, push } from "firebase/database"
import { rooms as roomOptions } from "@/sections/Rooms"
import ProgressBar from "../components/ProgressBar"

export default function ReservationPage() {
  const router = useRouter()
  const { checkIn, checkOut, adults = "1", children = "0", rooms = "1", roomType: qRoomType } = router.query

  const queryRoomType = qRoomType ? String(qRoomType).toLowerCase() : ""

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

  const maxRoomsByType = { room1: 1, room2: 4, room3: 4, room4: 4, room5: 4, room6: 1 }
  const getTypeKey = (r) => (r?.type || "").toString().toLowerCase()
  const countByType = (type, list = selectedRooms) =>
    list.reduce((s, sr) => (getTypeKey(sr.room) === type ? s + sr.qty : s), 0)

  const [typeLimitMessage, setTypeLimitMessage] = useState(null)
  const [step, setStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState(roomOptions[0] || null)
  const [selectedRooms, setSelectedRooms] = useState(() => {
    const qRoom = router.query?.room
    if (qRoom) {
      const found = roomOptions.find((rr) => String(rr.id) === String(qRoom))
      return found ? [{ room: found, qty: 1 }] : []
    }
    return []
  })
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

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

  const [breakfastType, setBreakfastType] = useState("") // Breakfast type
  const breakfastPrices = { sriLanka: 3.32, continental: 4.20 }; // Prices per person

  const isRoomSelected = (r) => selectedRooms.some((sr) => String(sr.room.id) === String(r.id))
  
  const addRoom = (r) => {
    const typeKey = getTypeKey(r)
    const max = maxRoomsByType[typeKey]
    const current = countByType(typeKey)
    if (typeof max === "number" && current + 1 > max) {
      setTypeLimitMessage({ type: typeKey, msg: `Sorry, we have only ${max} ${typeKey} room${max > 1 ? "s" : ""}.` })
      return
    }
    setTypeLimitMessage(null)
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

    if (qType) {
      const foundByType = roomOptions.find((rr) => String(rr.type).toLowerCase() === qType)
      if (foundByType) {
        setSelectedRoom(foundByType)
        setSelectedRooms([{ room: foundByType, qty: 1 }])
        return
      }
    }

    setSelectedRoom((prev) => prev || roomOptions[0] || null)
  }, [router.query?.room, router.query?.roomType])

  const visibleRooms = (queryRoomType ? roomOptions.filter((r) => String(r.type).toLowerCase() === queryRoomType) : roomOptions)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }))
  }

  const handleBack = () => setStep(1)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Input validation 
    const errors = [];
    if (!selectedRoom && selectedRooms.length === 0) {
      errors.push("Please select a room before booking.");
    }
    if (!ci || !co) {
      errors.push("Please select valid check-in and check-out dates.");
    }
    if (!form.country) errors.push("Country is required.");
    if (!form.mobile || !/^\+?\d{7,15}$/.test(form.mobile)) errors.push("Valid mobile number is required.");
    if (!form.firstName) errors.push("First name is required.");
    if (!form.address) errors.push("Address is required.");
    if (!form.city) errors.push("City is required.");
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errors.push("Valid email address is required.");
    if (!form.agree) errors.push("You must agree to the terms and conditions.");

    const suitability = multiSuitability();
    if (!suitability.ok) {
      errors.push(suitability.reason + ". Please add more rooms.");
    }

    if (errors.length > 0) {
      alert(errors.join("\n")); 
      return;
    }

    setSubmitting(true)
    try {
      // Calculate room numbers and total price
      const bookedRooms = selectedRooms.length
        ? selectedRooms
        : selectedRoom
        ? [{ room: selectedRoom, qty: 1 }]
        : [];
      const roomNumbers = bookedRooms.map((sr) => sr.room.id);
      const totalPriceValue = (bookedRooms.reduce((sum, sr) => sum + ((sr.room.price || 0) * sr.qty), 0) + (breakfastType ? totalGuests * breakfastPrices[breakfastType] : 0)) * nights;

      const payload = {
        checkIn: ci ? ci.toISOString().slice(0, 10) : checkIn || "",
        checkOut: co ? co.toISOString().slice(0, 10) : checkOut || "",
        nights,
        adults: Number(adults || 0),
        children: Number(children || 0),
        rooms: Number(rooms || 0),
        totalGuests,
        selectedRooms: bookedRooms.map((sr) => ({ id: sr.room.id, title: sr.room.title, price: sr.room.price || 0, qty: sr.qty })),
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
        roomNumbers, // array of room numbers
        totalPrice: totalPriceValue, // total price for the booking
      }

      await push(dbRef(rtdb, "reservations"), payload)

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
        const dtend = formatDate(endDateIso)
 
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

      const tryPushIcs = async (ics) => {
        try {
          const iCalUrl = process.env.NEXT_PUBLIC_TRIPLE_ICAL
          if (!iCalUrl) return { ok: false, message: "No remote calendar configured." }

          try {
            const parsed = new URL(iCalUrl)
            const host = (parsed.hostname || "").toLowerCase()
            const path = (parsed.pathname || "").toLowerCase()
            if (host.includes("booking.com") || path.includes("/v1/export")) {
              return {
                ok: false,
                message: "Configured calendar appears to be a Booking.com export (read-only).",
              }
            }
          } catch (e) {
            console.warn("tryPushIcs: failed to parse iCalUrl", e)
          }

          const proxyUrl = `/api/fetch-ical?url=${encodeURIComponent(iCalUrl)}`
          const res = await fetch(proxyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ics, method: "PUT" }),
          })
          const json = await res.json().catch(() => ({ ok: false, message: `HTTP ${res.status}` }))
          if (!res.ok || !json.ok) return { ok: false, message: json?.message || `Remote responded ${res.status}` }
          return { ok: true, message: json.message || "Pushed" }
        } catch (err) {
          return { ok: false, message: err?.message || "Unknown error" }
        }
      }

      const ics = buildIcsForReservation(payload.guest || {}, payload.checkIn, payload.checkOut)
      const pushResult = await tryPushIcs(ics)

      console.log("Calendar push result:", pushResult)
      alert("Booking request saved.")
 
      setSaved(true)
      setSubmitting(false)
      setTimeout(() => {
        router.push("/").catch(() => {})
      }, 1200)
    } catch (err) {
      console.error("Failed saving reservation:", err)
      alert("Failed to save reservation. Please try again.")
      setSubmitting(false)
    }
  }

  const [showSummary, setShowSummary] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isClientSmall, setIsClientSmall] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const update = () => setIsClientSmall(window.innerWidth < 768)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.add("reservation-navbar-black");
      return () => document.body.classList.remove("reservation-navbar-black");
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const prev = document.body.style.paddingTop || "";
    const apply = () => {
      document.body.style.paddingTop = window.innerWidth <= 800 ? "64px" : "72px";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      document.body.style.paddingTop = prev;
    };
  }, []);

  const StepHeader = () => (
    <div className="step-header">
      <div className="step-container">
        <div className={`step-circle ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
          {step > 1 ? "✓" : "1"}
        </div>
        <div className="step-label-box">
          <span className="step-label">Choose Room</span>
        </div>
      </div>
      
      <div className="connector-line">
        <div className={`connector-fill ${step > 1 ? "filled" : ""}`} />
      </div>
      
      <div className="step-container">
        <div className={`step-circle ${step >= 2 ? "active" : ""}`}>
          <span className="heart-icon">♥</span>
        </div>
        <div className="step-label-box">
          <span className="step-label">Guest Details</span>
        </div>
      </div>
    </div>
  )

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

  const handleAsideContinue = () => {
    if (selectedRooms.length === 0 && selectedRoom) {
      setSelectedRooms([{ room: selectedRoom, qty: 1 }])
    }

    const suitability = multiSuitability(selectedRooms.length ? selectedRooms : (selectedRoom ? [{ room: selectedRoom, qty: 1 }] : []))
    if (!suitability.ok) {
      alert(suitability.reason + ". Please add more rooms.")
      return
    }

    setStep(2)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPrice = useMemo(() => {
    const roomPrice = selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0);
    const breakfastPrice = breakfastType
      ? totalGuests * breakfastPrices[breakfastType]
      : 0;
    return roomPrice + breakfastPrice;
  }, [selectedRooms, breakfastType, totalGuests]);

  const handleBreakfastTypeChange = (e) => {
    setBreakfastType(e.target.value);
  };

  return ( 
    <div className="reservation-page">
      <aside className={`aside ${showSummary ? "visible" : ""}`} aria-hidden={mounted && isClientSmall ? !showSummary : false}>
        <div className="full-details">
          <h3 className="heading">DATES</h3>
          <div className="aside-body">
            <div className="info-row">
              <strong>Check-In</strong>
              <span>{ci ? format(ci, "EEE, MMM dd") : "-"}</span>
            </div>
            <div className="info-row">
              <strong>Check-Out</strong>
              <span>{co ? format(co, "EEE, MMM dd") : "-"}</span>
            </div>
            <div className="info-row highlight">
              <strong>Total Nights</strong>
              <span>{nights}</span>
            </div>
          </div>

          <hr className="divider" />

          <h4 className="subheading">GUESTS</h4>
          <div className="guest-info">
            <div className="guest-pill">
              <span className="guest-icon">👤</span>
              <span>{adults} Adults</span>
            </div>
            <div className="guest-pill">
              <span className="guest-icon">👶</span>
              <span>{children} Children</span>
            </div>
          </div>

          <hr className="divider" />

          <h4 className="subheading">SELECTED ROOMS</h4>
          <div className="selected-room">
            {selectedRooms.length === 0 ? (
              <div className="empty-state">
                <div className="room-title">
                  {selectedRoom ? `ROOM-${selectedRoom.roomNumber || selectedRoom.id}. ${selectedRoom.title}` : "No room selected"}
                </div>
                <div className="room-price">Price per night: {selectedRoom ? `${selectedRoom.price}$` : "-"}</div>
              </div>
            ) : (
              <>
                <div className="room-list">
                  {selectedRooms.map((sr, idx) => (
                    <div key={sr.room.id} className="room-item" style={{animationDelay: `${idx * 0.1}s`}}>
                      <div className="room-info">
                        <div className="room-title-line">
                          ROOM-{sr.room.roomNumber || sr.room.id}. {sr.room.title}
                          <span className="qty-badge">×{sr.qty}</span>
                        </div>
                        <div className="room-meta-line">{formatRoomMeta(sr.room)}</div>
                      </div>
                      <div className="room-price-info">
                        <div className="price-total">${((sr.room.price || 0) * sr.qty).toFixed(2)}</div>
                        <div className="price-per">${(sr.room.price || 0).toFixed(2)} / night</div>
                      </div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const s = multiSuitability()
                  return !s.ok ? (
                    <div className="suitability-warning">{`Not suitable: ${s.reason}`}</div>
                  ) : (
                    <div className="suitability-success">Selected rooms cover your guest count</div>
                  )
                })()}
              </>
            )}
            
            <div className="price-breakdown">
              <div className="price-row">
                <span>Space Price</span>
                <span>{selectedRooms.length ? `${selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0).toFixed(2)}$` : (selectedRoom ? `${(selectedRoom.price).toFixed(2)}$` : "-")}</span>
              </div>
              <div className="price-row">
                <span>Tax</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="price-row">
                <span>
                  Breakfast <span style={{ color: "red" }}>*</span>
                </span>
                <div>
                  <select
                    value={breakfastType}
                    onChange={handleBreakfastTypeChange}
                    className="breakfast-select"
                  >
                    <option value="">Not included</option>
                    <option value="sriLanka">Sri Lanka - 3.32$</option>
                    <option value="continental">Continental - 4.20$/pp</option>
                  </select>
                </div>
              </div>
              <div className="price-row total-row">
                <span>Total</span>
                <span className="total-amount">${(totalPrice * nights).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="aside-continue" 
            onClick={handleAsideContinue} 
            disabled={!(selectedRooms.length > 0 || selectedRoom)}
            style={{ display: step === 1 ? "block" : "none" }} // Hide button when in Guest Details section
          >
            Continue to Guest Details →
          </button>
        </div>

        <div className={`total-preview${showSummary ? " open" : ""}`} role="button" tabIndex={0} onClick={() => setShowSummary((s) => !s)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowSummary((s) => !s) }} aria-expanded={showSummary}>
          <div className="total-left">TOTAL</div>
          <div className="total-right">
            {selectedRooms.length
              ? `${(selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0) * Math.max(1, nights)).toFixed(2)}$`
              : selectedRoom
              ? `${(selectedRoom.price * Math.max(1, nights)).toFixed(2)}$`
              : "-"}
          </div>
          <div className={`chev ${showSummary ? "open" : ""}`}>▾</div>
        </div>
      </aside>

      <main className="main">
        <div className="mobile-toggle">
          <button type="button" className="toggle-btn" onClick={() => setShowSummary((s) => !s)} aria-expanded={showSummary}>
            {showSummary ? "Hide summary" : "Show summary"}
          </button>
        </div>

        <ProgressBar currentStep={step} />

        {saved ? (
          <div className="saved-state">
            <div className="success-icon">✓</div>
            <h2>Reservation Confirmed!</h2>
            <p>Your booking has been saved. A team member will contact you shortly.</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <section className="room-section">
                <h2 className="section-title">Choose a room</h2>
                <div className="room-grid">
                  {visibleRooms.length === 0 ? (
                    <div style={{ padding: 20, width: "100%", textAlign: "center", color: "#666" }}>
                      No rooms match the selected room type.
                    </div>
                  ) : (
                    visibleRooms.map((r, idx) => {
                      const already = selectedRooms.find((sr) => String(sr.room.id) === String(r.id))
                      const tempList = already ? selectedRooms : [...selectedRooms, { room: r, qty: 1 }]
                      const suitability = multiSuitability(tempList)
                      return (
                        <div key={r.id} className={`room-card ${already ? "selected" : ""}`} style={{animationDelay: `${idx * 0.1}s`}}>
                          <div className="room-img" style={{ backgroundImage: `url(${r.img})` }}>
                            {already && <div className="selected-badge">✓ Selected</div>}
                          </div>
                          <div className="room-content">
                            <div className="room-header">
                              <div className="room-name">ROOM-{r.roomNumber || r.id}. {r.title}</div>
                              <div className="room-rate">${r.price} / night</div>
                            </div>
                            <div className="room-meta">{formatRoomMeta(r)}</div>
                            {!suitability.ok && (
                              <div className="warning-msg">{suitability.reason}</div>
                            )}
                            <div className="room-actions">
                              {!already ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                                  <button onClick={() => addRoom(r)} className="btn-add">Add</button>
                                  {typeLimitMessage && typeLimitMessage.type === getTypeKey(r) && (
                                    <div className="limit-msg">{typeLimitMessage.msg}</div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                                  <button onClick={() => removeRoom(r)} className="btn-remove">Remove</button>
                                  {typeLimitMessage && typeLimitMessage.type === getTypeKey(r) && (
                                    <div className="limit-msg">{typeLimitMessage.msg}</div>
                                  )}
                                </div>
                              )}
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
              <section className="form-section">
                <h2 className="section-title">Guest Details</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Country *</label>
                      <select name="country" required value={form.country} onChange={handleChange}>
                        <option value="">Select Your Country</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Sri Lanka</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Mobile Number *</label>
                      <input name="mobile" required value={form.mobile} onChange={handleChange} placeholder="Mobile Number" />
                    </div>

                    <div className="form-field">
                      <label>First Name *</label>
                      <input name="firstName" required value={form.firstName} onChange={handleChange} placeholder="First name" />
                    </div>

                    <div className="form-field">
                      <label>Last Name</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                    </div>

                    <div className="form-field full">
                      <label>Address *</label>
                      <input name="address" required value={form.address} onChange={handleChange} placeholder="Street Address" />
                    </div>

                    <div className="form-field">
                      <label>City / Town *</label>
                      <input name="city" required value={form.city} onChange={handleChange} placeholder="City or Town" />
                    </div>

                    <div className="form-field">
                      <label>Email Address *</label>
                      <input name="email" required type="email" value={form.email} onChange={handleChange} placeholder="Email" />
                    </div>

                    <div className="form-field full">
                      <label>Extra Notes</label>
                      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any special requests..." rows={4} />
                    </div>

                    <div className="form-field full agree-field">
                      <input name="agree" id="agree" type="checkbox" checked={form.agree} onChange={handleChange} required />
                      <label htmlFor="agree">By clicking here, I state that I have read and understood the terms and conditions.</label>
                    </div>
                  </div>

                  <div className="action-row">
                    <button type="button" onClick={handleBack} className="btn-back">← Back</button>
                    <button type="submit" disabled={submitting} className="btn-submit">{submitting ? "Processing..." : "BOOK RESERVATION"}</button>
                  </div>
                </form>
              </section>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes checkIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .reservation-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          gap: 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          flex-direction: column;
        }

        .aside {
          width: 100%;
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .full-details {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .heading {
          margin: 0 0 16px 0;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          opacity: 0.9;
        }

        .aside-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
        }

        .info-row.highlight {
          background: rgba(255,255,255,0.15);
          padding: 12px;
          border-radius: 8px;
          margin-top: 8px;
          font-weight: 600;
        }

        .divider {
          border: none;
          height: 1px;
          background: rgba(255,255,255,0.2);
          margin: 20px 0;
        }

        .subheading {
          margin: 0 0 12px 0;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          opacity: 0.9;
        }

        .guest-info {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .guest-pill {
          flex: 1;
          min-width: 120px;
          background: rgba(255,255,255,0.15);
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .guest-pill:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .guest-icon {
          font-size: 18px;
        }

        .selected-room {
          background: rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 20px;
          opacity: 0.8;
        }

        .room-title {
          font-weight: 700;
          margin-bottom: 4px;
        }

        .room-price {
          color: rgba(255,255,255,0.8);
          font-size: 13px;
        }

        .room-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .room-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          animation: fadeInUp 0.4s ease both;
          transition: all 0.3s ease;
        }

        .room-item:hover {
          background: rgba(255,255,255,0.15);
          transform: translateX(4px);
        }

        .room-info {
          flex: 1;
        }

        .room-title-line {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .qty-badge {
          background: rgba(255,255,255,0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }

        .room-meta-line {
          font-size: 11px;
          opacity: 0.8;
          line-height: 1.4;
        }

        .room-price-info {
          text-align: right;
        }

        .price-total {
          font-weight: 700;
          font-size: 16px;
        }

        .price-per {
          font-size: 11px;
          opacity: 0.7;
        }

        .suitability-warning {
          margin-top: 8px;
          color: #fecaca;
          font-size: 13px;
          font-weight: 600;
        }

        .suitability-success {
          margin-top: 8px;
          color: #86efac;
          font-size: 13px;
          font-weight: 600;
        }

        .price-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.2);
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .price-row.total-row {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.2);
          font-weight: 700;
          font-size: 16px;
        }

        .free-tag {
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }

        .total-amount {
          font-size: 20px;
        }

        .aside-continue {
          width: 100%;
          padding: 14px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
        }

        .aside-continue:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        .aside-continue:active:not(:disabled) {
          transform: translateY(0);
        }

        .aside-continue:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .total-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 16px;
          border-radius: 12px;
          background: #111;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          user-select: none;
          margin-top: 12px;
          transition: all 0.3s ease;
        }

        .total-preview:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
        }

        .total-preview .chev {
          margin-left: 8px;
          transition: transform 0.3s ease;
          font-size: 18px;
        }

        .total-preview.open .chev {
          transform: rotate(180deg);
        }

        .total-left {
          font-size: 14px;
        }

        .total-right {
          font-size: 18px;
        }

        .main {
          flex: 1;
          animation: fadeInUp 0.6s ease 0.2s both;
        }

        .mobile-toggle {
          display: block;
          margin-bottom: 16px;
        }

        .toggle-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-btn:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        /* New Step Progress Bar Styles */
        .step-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
          padding: 0 20px;
        }

        .step-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid #d1d5db;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #9ca3af;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 2;
        }

        .step-circle.active {
          border-color: #10b981;
          background: #10b981;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          animation: checkIn 0.5s ease;
        }

        .step-circle.completed {
          border-color: #10b981;
          background: #10b981;
          color: white;
        }

        .heart-icon {
          font-size: 22px;
          color: inherit;
        }

        .step-circle.active .heart-icon {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .step-label-box {
          position: absolute;
          top: 60px;
          white-space: nowrap;
        }

        .step-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .step-circle.active + .step-label-box .step-label {
          color: #10b981;
          font-weight: 700;
        }

        .connector-line {
          width: 120px;
          height: 3px;
          background: #e5e7eb;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
          margin: 0 -10px;
        }

        .connector-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: #10b981;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .connector-fill.filled {
          width: 100%;
          animation: progressFill 0.6s ease;
        }

        .section-title {
          margin: 0 0 24px 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .room-section,
        .form-section {
          animation: fadeInUp 0.5s ease;
        }

        .room-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .room-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          animation: scaleIn 0.5s ease both;
        }

        .room-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          border-color: #667eea;
        }

        .room-card.selected {
          border-color: #10b981;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
          background: linear-gradient(to bottom, #ffffff, #f0fdf4);
        }

        .room-img {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #10b981;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          animation: pulse 2s infinite;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .room-content {
          padding: 20px;
        }

        .room-header {
          margin-bottom: 12px;
        }

        .room-name {
          font-weight: 700;
          font-size: 18px;
          color: #111827;
          margin-bottom: 6px;
        }

        .room-rate {
          color: #667eea;
          font-weight: 700;
          font-size: 16px;
        }

        .room-meta {
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .warning-msg {
          background: #fef2f2;
          color: #dc2626;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .limit-msg {
          color: #dc2626;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .room-actions {
          display: flex;
          gap: 8px;
        }

        .btn-add,
        .btn-remove {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
        }

        .btn-add {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-remove {
          background: #fef2f2;
          color: #dc2626;
          border: 2px solid #dc2626;
        }

        .btn-remove:hover {
          background: #dc2626;
          color: white;
          transform: translateY(-2px);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field.full {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          padding: 12px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .agree-field {
          flex-direction: row;
          align-items: flex-start;
          gap: 12px;
        }

        .agree-field input[type="checkbox"] {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .agree-field label {
          flex: 1;
          font-size: 13px;
          cursor: pointer;
        }

        .action-row {
          display: flex;
          gap: 12px;
          flex-direction: column;
        }

        .btn-back,
        .btn-submit {
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 15px;
        }

        .btn-back {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-back:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .btn-submit {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .saved-state {
          text-align: center;
          padding: 60px 20px;
          animation: fadeInUp 0.6s ease;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
          animation: checkIn 0.6s ease;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }

        .saved-state h2 {
          font-size: 28px;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .saved-state p {
          font-size: 16px;
          color: #6b7280;
        }

        .breakfast-select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          font-size: 14px;
          background: #fff;
          color: #374151;
          transition: border-color 0.3s;
          min-width: 180px;
        }
        .breakfast-select:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
        }

        @media (min-width: 768px) {
          .reservation-page {
            flex-direction: row;
          }

          .aside {
            width: 360px;
            flex-shrink: 0;
          }

          .mobile-toggle {
            display: none;
          }

          .total-preview {
            display: none;
          }

          .room-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }

          .form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .action-row {
            flex-direction: row;
            justify-content: space-between;
          }

          .btn-back {
            width: auto;
            min-width: 120px;
          }

          .btn-submit {
            width: auto;
            min-width: 200px;
          }

          .connector-line {
            width: 200px;
          }
        }

        @media (max-width: 768px) {
          .aside .full-details {
            display: none;
          }

          .aside.visible .full-details {
            display: block;
            margin-bottom: 12px;
            animation: fadeInUp 0.4s ease;
          }

          .aside .total-preview {
            display: flex;
          }

          .connector-line {
            width: 80px;
          }

          .step-circle {
            width: 45px;
            height: 45px;
            font-size: 16px;
          }

          .step-label {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .step-header {
            padding: 0 10px;
          }

          .connector-line {
            width: 60px;
          }

          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .heart-icon {
            font-size: 18px;
          }

          .step-label-box {
            top: 50px;
          }

          .step-label {
            font-size: 11px;
          }
        }

        :global(body.reservation-navbar-black nav),
        :global(body.reservation-navbar-black .navbar),
        :global(body.reservation-navbar-black header),
        :global(body.reservation-navbar-black .header) {
          background-color: #000 !important;
          color: #fff !important;
        }
        
        :global(body.reservation-navbar-black nav a),
        :global(body.reservation-navbar-black .navbar a),
        :global(body.reservation-navbar-black header a),
        :global(body.reservation-navbar-black .header a) {
          color: #fff !important;
        }
      `}</style>
    </div>
  )
}