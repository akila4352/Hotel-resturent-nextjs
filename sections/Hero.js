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
import BookingBox from "@/components/BookingBox"

const Hero = () => {
  const router = useRouter()
 
  // Booking state (restored to match booking UI)
  // const [destination, setDestination] = useState("")
  const [openDate, setOpenDate] = useState(false)
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ])
  const bookingRef = useRef(null)       // booking box element
  const calendarRef = useRef(null)
  const [options, setOptions] = useState({ adult: 1, children: 0, room: 1, roomType: "" }) // include roomType
  const [submitting, setSubmitting] = useState(false)

  // --- NEW: refs + state for sticky/stop behavior ---
  const heroRef = useRef(null)          // anchor hero section
  const [isFixed, setIsFixed] = useState(true) // toggles fixed vs stopped
  const [absTop, setAbsTop] = useState(0)      // when stopped, absolute top position (document px)

  // NEW: detect mobile breakpoint so BookingBox can be placed inline
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function updateMobile() {
      setIsMobile(window.innerWidth <= 760)
    }
    updateMobile()
    window.addEventListener("resize", updateMobile)
    return () => window.removeEventListener("resize", updateMobile)
  }, [])

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

  // handler to set the selected room type
  const handleRoomType = (type) => {
    setOptions((prev) => ({ ...prev, roomType: type }))
  }

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
        style={{ margin: 0, padding: 0, overflowX: "hidden" }} // removed forced height so carousel can be shorter on mobile
      >
        <div
          className='container'
          style={{
            position: 'relative',
            width: '100vw',       // full viewport width to remove container gutters
            maxWidth: '100vw',
            boxSizing: 'border-box',
            // height: '100vh',      <-- removed to allow responsive carousel height on small screens
            margin: 0,
            padding: 0,
            overflowX: 'hidden',
          }}
        >
          <Carousel compact={isMobile} />

          {/* NEW: render booking box inline inside hero on small screens so it pushes content */}
          {isMobile && (
            /* pull booking up so it overlaps the reduced carousel height (adjust -24px as needed) */
            <div style={{ marginTop: -24, padding: "0 16px", boxSizing: "border-box" }}>
               <BookingBox
                 bookingRef={bookingRef}
                 calendarRef={calendarRef}
                 isFixed={isFixed}
                 absTop={absTop}
                 openDate={openDate} 
                 setOpenDate={setOpenDate}
                 range={range}
                 setRange={setRange}
                 options={options}
                 handleOption={handleOption}
                 handleRoomType={handleRoomType} // pass new handler
                 handleBookNow={handleBookNow}
                 submitting={submitting}
                 forceStatic={true} // force static flow on mobile
               />
             </div>
           )}
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

      {/* keep desktop/large-screen booking box in original place */}
      {!isMobile && (
        <BookingBox
          bookingRef={bookingRef}
          calendarRef={calendarRef}
          isFixed={isFixed}
          absTop={absTop}
          openDate={openDate}
          setOpenDate={setOpenDate}
          range={range}
          setRange={setRange}
          options={options}
          handleOption={handleOption}
          handleRoomType={handleRoomType}
          handleBookNow={handleBookNow}
          submitting={submitting}
        />
      )}
    </>
  )
}

export default Hero
