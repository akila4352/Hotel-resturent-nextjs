import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { parseISO, format, differenceInDays } from "date-fns"
import { rtdb } from "../lib/firebase"
import { ref as dbRef, push } from "firebase/database"

export default function ReservationPage() {
  const router = useRouter()
  const { checkIn, checkOut, adults = "1", children = "0", rooms = "1" } = router.query

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

  // simple rooms list for step 1 (replace/add your real rooms)
  const roomOptions = [
    { id: "family", title: "Family Room", price: 24.99, img: "/images/b4.jpeg" },
    { id: "deluxe", title: "Deluxe Room", price: 34.99, img: "/images/b5.jpg" },
    { id: "suite", title: "Suite", price: 54.99, img: "/images/b6.jpg" },
  ]

  // UI state
  const [step, setStep] = useState(1) // 1 = choose room, 2 = guest details
  const [selectedRoom, setSelectedRoom] = useState(roomOptions[0] || null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  // guest form
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

  useEffect(() => {
    // if you want default room from query, you can read router.query.room here
    setSelectedRoom((prev) => prev || roomOptions[0] || null)
  }, [])

  const onSelectRoom = (room) => {
    setSelectedRoom(room)
    setStep(2)
    // scroll to top so form is visible on small screens
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }))
  }

  const handleBack = () => setStep(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.agree) {
      alert("Please accept terms and conditions.")
      return
    }
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
        selectedRoom: selectedRoom ? { id: selectedRoom.id, title: selectedRoom.title, price: selectedRoom.price } : null,
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

      // show immediate browser confirmation then update UI and redirect to home
      alert("Booking request saved. Our team will contact you within 3 hours.")
      setSaved(true)
      setSubmitting(false)
      // navigate to home after a short delay so user sees the alert
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

  return (
    <div className="reservation-page">
      {/* Left summary */}
      <aside className={`aside ${showSummary ? "visible" : ""}`} aria-hidden={!showSummary && typeof window !== "undefined" && window.innerWidth < 768}>
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
            <div className="room-title">{selectedRoom?.title || "No room selected"}</div>
            <div className="room-price">Price per night: {selectedRoom ? `${selectedRoom.price}$` : "-"}</div>
            <div className="room-details">
              <div className="row"><div>Space Price</div><div>{selectedRoom ? `${(selectedRoom.price).toFixed(2)}$` : "-"}</div></div>
              <div className="row"><div>Tax</div><div>FREE</div></div>
            </div>
          </div>
        </div>

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
          <div className="total-right">{selectedRoom ? `${(selectedRoom.price * Math.max(1,nights)).toFixed(2)}$` : "-"}</div>
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
                  {roomOptions.map((r) => (
                    <div key={r.id} className={`room-card ${selectedRoom?.id === r.id ? "selected" : ""}`} role="listitem">
                      <div className="room-img" style={{ backgroundImage: `url(${r.img})` }} />
                      <div className="room-row">
                        <div>
                          <div className="room-name">{r.title}</div>
                          <div className="room-rate">{r.price}$ / night</div>
                        </div>
                        <div className="room-actions">
                          <button onClick={() => setSelectedRoom(r)} className={`btn small ${selectedRoom?.id === r.id ? "primary" : "muted"}`}>Select</button>
                          <button onClick={() => onSelectRoom(r)} className="btn continue">Continue</button>
                        </div>
                      </div>
                    </div>
                  ))}
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
      `}</style>
    </div>
  )
}

