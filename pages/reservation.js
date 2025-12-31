import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { parseISO, format, differenceInDays } from "date-fns"
import { rtdb } from "../lib/firebase"
import { ref as dbRef, push } from "firebase/database"
import { rooms as roomOptions } from "@/sections/Rooms"
import ProgressBar from "../components/ProgressBar"
import dynamic from "next/dynamic"
const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false })

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

  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [emailError, setEmailError] = useState("")
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""

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
    if (!recaptchaToken) errors.push("Please complete the reCAPTCHA.");

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
      // 1. Verify reCAPTCHA
      const recaptchaRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recaptchaToken }),
      })
      const recaptchaJson = await recaptchaRes.json()
      if (!recaptchaJson.success) {
        setSubmitting(false)
        alert("reCAPTCHA verification failed. Please try again.")
        setRecaptchaToken(null)
        return
      }

      // Calculate room numbers and total price
      const bookedRooms = selectedRooms.length
        ? selectedRooms
        : selectedRoom
        ? [{ room: selectedRoom, qty: 1 }]
        : []
      const roomNumbers = bookedRooms.map((sr) => sr.room.id)
      const totalPriceValue = (bookedRooms.reduce((sum, sr) => sum + ((sr.room.price || 0) * sr.qty), 0) + (breakfastType ? totalGuests * breakfastPrices[breakfastType] : 0)) * nights

      // Always use YYYY-MM-DD and if check-in and check-out are the same, set check-out to next day
      let checkInDate = ci ? new Date(ci) : checkIn ? new Date(checkIn) : null
      let checkOutDate = co ? new Date(co) : checkOut ? new Date(checkOut) : null
      if (checkInDate && checkOutDate && checkInDate.toDateString() === checkOutDate.toDateString()) {
        checkOutDate.setDate(checkOutDate.getDate() + 1)
      }
      const payload = {
        checkIn: checkInDate ? checkInDate.toISOString().slice(0, 10) : "",
        checkOut: checkOutDate ? checkOutDate.toISOString().slice(0, 10) : "",
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
        roomNumbers,
        totalPrice: totalPriceValue,
      }

      await push(dbRef(rtdb, "reservations"), payload)

      // Send booking confirmation emails to user and admin
      try {
        const emailRes = await fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: form.email,
            userName: form.firstName + (form.lastName ? " " + form.lastName : ""),
            bookingDetails: payload,
          }),
        })
        const emailJson = await emailRes.json()
        if (!emailRes.ok) {
          setEmailError("Booking saved, but failed to send email: " + (emailJson?.error || emailJson?.message || "Unknown error"))
        }
      } catch (emailErr) {
        setEmailError("Booking saved, but failed to send email: " + (emailErr?.message || "Unknown error"))
      }

      // --- Wait for iCal endpoint to be pinged before redirecting ---
      try {
        if (payload.roomNumbers && payload.roomNumbers.length > 0) {
          const icalRes = await fetch(`/api/ical/room${payload.roomNumbers[0]}.ics?ping=${Date.now()}`)
          // Optionally log or check status
        }
      } catch (e) {
        // Optionally log
      }

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
        {/* Desktop/full view: show summary always */}
        {!isClientSmall && (
          <div className="full-details desktop-summary">
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
              style={{ display: step === 1 ? "block" : "none" }}
            >
              Continue to Guest Details →
            </button>
          </div>
        )}
      </aside>

      <main className="main">
        <ProgressBar currentStep={step} />
        {saved ? (
          <div className="saved-state">
            <div className="success-icon">✓</div>
            <h2>Reservation Confirmed!</h2>
            <p>Your booking has been saved. A team member will contact you shortly.</p>
            {emailError && <div style={{ color: "#dc2626", marginTop: 16 }}>{emailError}</div>}
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
                        <div key={r.id} className={`room-card mobile-room-card ${already ? "selected" : ""}`} style={{animationDelay: `${idx * 0.1}s`}}>
                          <div className="room-img mobile-room-img" style={{ backgroundImage: `url(${r.img})` }}>
                            {already && <div className="selected-badge mobile-selected-badge">✓ Selected</div>}
                          </div>
                          <div className="room-content mobile-room-content">
                            <div className="room-header mobile-room-header">
                              <div className="room-name mobile-room-name">ROOM-{r.roomNumber || r.id}. {r.title}</div>
                              <div className="room-rate mobile-room-rate">${r.price} <span className="mobile-room-night">/ night</span></div>
                            </div>
                            <div className="room-meta mobile-room-meta">{formatRoomMeta(r)}</div>
                            {!suitability.ok && (
                              <div className="warning-msg">{suitability.reason}</div>
                            )}
                            <div className="room-actions mobile-room-actions">
                              {!already ? (
                                <button onClick={() => addRoom(r)} className="btn-add mobile-btn-add">Add</button>
                              ) : (
                                <button onClick={() => removeRoom(r)} className="btn-remove mobile-btn-remove">Remove</button>
                              )}
                              {typeLimitMessage && typeLimitMessage.type === getTypeKey(r) && (
                                <div className="limit-msg">{typeLimitMessage.msg}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                {/* Fixed total bar for mobile */}
                <div className="mobile-total-bar">
                  <div className="mobile-total-label">TOTAL</div>
                  <div className="mobile-total-value">
                    {selectedRooms.length
                      ? `${(selectedRooms.reduce((s, sr) => s + ((sr.room.price || 0) * sr.qty), 0) * Math.max(1, nights)).toFixed(2)}$`
                      : selectedRoom
                      ? `${(selectedRoom.price * Math.max(1, nights)).toFixed(2)}$`
                      : "-"}
                  </div>
                  <button className="mobile-next-btn" onClick={handleAsideContinue} disabled={!(selectedRooms.length > 0 || selectedRoom)}>
                    NEXT
                  </button>
                </div>
                <button type="button" className="mobile-show-summary" onClick={() => setShowSummary((s) => !s)}>
                  {showSummary ? "Hide summary" : "Show summary"}
                </button>
                {/* Show summary details under the button on mobile when open */}
                {showSummary && (
                  <div className="full-details mobile-summary">
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
                      style={{ display: step === 1 ? "block" : "none" }}
                    >
                      Continue to Guest Details →
                    </button>
                  </div>
                )}
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

                    {/* Add reCAPTCHA widget */}
                    <div className="form-field full" style={{ margin: "10px 0" }}>
                      {siteKey && (
                        <ReCAPTCHA
                          sitekey={siteKey}
                          onChange={token => setRecaptchaToken(token)}
                        />
                      )}
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
    </div>
  )
}