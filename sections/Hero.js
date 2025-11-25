import { home } from "@/assets/data/dummydata"
import Banner from "@/components/Banner"
import Expertise from "@/components/Expertise"
import ShowCase from "@/components/ShowCase"
import Testimonial from "@/components/Testimonial"
import { Title, TitleLogo, TitleSm } from "@/components/common/Title"
import { BlogCard, Brand } from "@/components/router"
import React, { useEffect, useRef, useState } from "react"
import Carousel from "@/components/Carousel"
import { DateRange } from "react-date-range"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { rtdb } from "@/lib/firebase"
import { ref as dbRef, push } from "firebase/database"

const Hero = () => {
  const router = useRouter()

  // Booking state (restored to match booking UI)
  // const [destination, setDestination] = useState("")
  const [openDate, setOpenDate] = useState(false)
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ])
  const calendarRef = useRef(null)
  const [options, setOptions] = useState({ adult: 1, children: 0, room: 1 })
  const [submitting, setSubmitting] = useState(false)

  // --- NEW: refs + state for sticky/stop behavior ---
  const heroRef = useRef(null)          // anchor hero section
  const bookingRef = useRef(null)       // booking box element
  const [isFixed, setIsFixed] = useState(true) // toggles fixed vs stopped
  const [absTop, setAbsTop] = useState(0)      // when stopped, absolute top position (document px)

  useEffect(() => {
    function handleClickOutside(e) {
      if (!openDate) return
      const target = e.target
      if (calendarRef.current && calendarRef.current.contains(target)) return
      if (target && target.closest && target.closest(".rdrCalendarWrapper")) return
      setOpenDate(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openDate])

  const handleOption = (name, op) =>
    setOptions((prev) => ({
      ...prev,
      [name]: op === "i" ? prev[name] + 1 : Math.max(name === "children" ? 0 : 1, prev[name] - 1),
    }))

  const handleBookNow = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const booking = {
        destination: "Hotel Amore",
        startDate: range[0].startDate.toISOString(),
        endDate: range[0].endDate.toISOString(),
        adult: options.adult,
        children: options.children,
        room: options.room,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      }
      await push(dbRef(rtdb, "hotelBookings"), booking)

      // booking saved — do not navigate away. Keep user on this page.
      alert("Booking request saved. Our team will contact you soon.")
    } catch (err) {
      console.error(err)
      alert("Failed to save booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // --- NEW: scroll logic to toggle fixed / stopped booking box ---
  useEffect(() => {
    if (!heroRef.current) return
    let ticking = false

    const updatePosition = () => {
      if (!heroRef.current || !bookingRef.current) return
      const heroRect = heroRef.current.getBoundingClientRect()
      const bookingRect = bookingRef.current.getBoundingClientRect()
      // If hero bottom is still below viewport bottom, keep booking fixed
      if (heroRect.bottom > window.innerHeight - 20) {
        setIsFixed(true)
      } else {
        // stop the booking box: compute document top so it sits at hero bottom
        const docTop = window.scrollY + heroRect.bottom
        // place booking so its bottom is slightly above hero bottom (adjust offset as needed)
        const topForBooking = docTop - bookingRect.height - 20
        setAbsTop(Math.max(0, Math.round(topForBooking)))
        setIsFixed(false)
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePosition)
        ticking = true
      }
    }

    // initial compute
    updatePosition()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [/* dependencies */ range, openDate]) // re-evaluate when date UI changes size

  return (
    <>
      {/* remove top/right gap: reset margin/padding and force full-viewport width */}
      <section
        className='hero'
        ref={heroRef} // <-- NEW: anchor hero for measurements
        style={{ margin: 0, padding: 0, overflowX: "hidden" }} // hide horizontal overflow
      >
        <div
          className='container'
          style={{
            position: 'relative',
            width: '100vw',       // full viewport width to remove container gutters
            maxWidth: '100vw',    // prevent any max-width from CSS
            boxSizing: 'border-box',
            height: '100vh',
            margin: 0,
            padding: 0,
            overflowX: 'hidden',  // ensure no horizontal scroll inside
          }}
        >
          <Carousel />
        </div>
      </section>

      <section className='hero-sec'>
        <div className='container'>
          <div className='heading-title'>
            <Title title='Why Book Direct with us' />
           </div>
          <div className='hero-content grid-4'>
            {home.map((item, i) => (
              <div className='box' key={i}>
                <span className='green'>{item.icon}</span> <br />
                <br />
                <h3>{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Expertise />
      <Testimonial />
      <ShowCase />

      {/* Booking box positioned over the hero/carousel (fixed inside this section) */}
      <div
        ref={bookingRef} // <-- NEW: ref for booking element
        className="booking-box"
        style={{
          /* keep dynamic position (fixed/absolute) here, layout handled by CSS */
          position: isFixed ? "fixed" : "absolute",
          bottom: isFixed ? "6%" : "auto",
          top: isFixed ? "auto" : `${absTop}px`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
        }}
      >
        <div className="booking-inner">
          <button
            type="button"
            className="booking-date"
            onClick={() => setOpenDate((s) => !s)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#ffcf9f",
              padding: "10px 14px",
              borderRadius: 10,
              minWidth: 160, /* reduced so it fits on phones */
              fontWeight: 700,
            }}
          >
            {`${format(range[0].startDate, "MM/dd/yyyy")} → ${format(range[0].endDate, "MM/dd/yyyy")}`}
          </button>

          {/* guest/room controls */}
          <div className="booking-controls">
            <div className="group">
              <label>Adult</label>
              <button onClick={() => handleOption("adult", "d")}>−</button>
              <span>{options.adult}</span>
              <button onClick={() => handleOption("adult", "i")}>+</button>
            </div>
            <div className="group">
              <label>Children</label>
              <button onClick={() => handleOption("children", "d")}>−</button>
              <span>{options.children}</span>
              <button onClick={() => handleOption("children", "i")}>+</button>
            </div>
            <div className="group">
              <label>Room</label>
              <button onClick={() => handleOption("room", "d")}>−</button>
              <span>{options.room}</span>
              <button onClick={() => handleOption("room", "i")}>+</button>
            </div>
          </div>

          <button
            onClick={handleBookNow}
            disabled={submitting}
            className="booking-cta"
            style={{
              background: "linear-gradient(90deg,#ff7a59,#ffbf69)",
              color: "#0b1220",
              border: "none",
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 700,
              opacity: submitting ? 0.8 : 1,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Saving..." : "Book Now"}
          </button>
        </div>

        {/* DateRange popup */}
        {openDate && (
          /* position calendar above the fixed booking box */
          <div ref={calendarRef} style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 12,
            zIndex: 80,
          }}>
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              minDate={new Date()}
              months={2}
              direction="horizontal"
              showSelectionPreview={true}
              editableDateInputs={true}
              showMonthAndYearPickers={true}
              rangeColors={["#3b82f6"]}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Hero
