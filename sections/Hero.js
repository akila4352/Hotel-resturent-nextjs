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
import AboutUs from "@/components/AboutUs"

const Hero = () => {
  const router = useRouter() 
 
  const [openDate, setOpenDate] = useState(false)
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ])
  const bookingRef = useRef(null)
  const calendarRef = useRef(null)
  const [options, setOptions] = useState({ adult: 1, children: 0, room: 1, roomType: "" })
  const [submitting, setSubmitting] = useState(false)

  const heroRef = useRef(null)
  const [isFixed, setIsFixed] = useState(true)
  const [absTop, setAbsTop] = useState(0)

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
      alert("Booking request saved. Our team will contact you soon.")
    } catch (err) {
      console.error(err)
      alert("Failed to save booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!heroRef.current) return
    let ticking = false

    const updatePosition = () => {
      if (!heroRef.current || !bookingRef.current) return
      const heroRect = heroRef.current.getBoundingClientRect()
      const bookingRect = bookingRef.current.getBoundingClientRect()
      if (heroRect.bottom > window.innerHeight - 20) {
        setIsFixed(true)
      } else {
        const docTop = window.scrollY + heroRect.bottom
        const topForBooking = docTop - bookingRect.height - 4
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

    updatePosition()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [range, openDate])

  return (
    <>
      <style jsx>{`
        /* 3D Title Effect */
        .hero-sec .heading-title h1,
        .hero-sec .heading-title h2,
        .title-3d {
          font-family: 'Playfair Display', 'Georgia', serif;
          font-size: 48px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 2px;
          text-shadow: 
            1px 1px 0px rgba(0, 0, 0, 0.1),
            2px 2px 0px rgba(0, 0, 0, 0.08),
            3px 3px 0px rgba(0, 0, 0, 0.06),
            4px 4px 0px rgba(0, 0, 0, 0.04);
          position: relative;
          display: inline-block;
          margin-bottom: 0;
          padding-bottom: 25px;
        }

        /* Title with Underline Decoration */
        .hero-sec .heading-title h1::after,
        .hero-sec .heading-title h2::after,
        .title-3d::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 30px;
          background-image: url('/images/underline.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        /* Heading Container */
        .hero-sec .heading-title {
          text-align: center;
          margin-bottom: 50px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-sec .heading-title h1,
          .hero-sec .heading-title h2,
          .title-3d {
            font-size: 36px;
          }
          
          .hero-sec .heading-title h1::after,
          .hero-sec .heading-title h2::after,
          .title-3d::after {
            width: 150px;
            height: 25px;
          }
        }

        @media (max-width: 480px) {
          .hero-sec .heading-title h1,
          .hero-sec .heading-title h2,
          .title-3d {
            font-size: 28px;
          }
          
          .hero-sec .heading-title h1::after,
          .hero-sec .heading-title h2::after,
          .title-3d::after {
            width: 120px;
            height: 20px;
          }
        }
      `}</style>

      <section
        className='hero'
        ref={heroRef}
        style={{ margin: 0, padding: 0, overflowX: "hidden" }}
      >
        <div
          className='container'
          style={{
            position: 'relative',
            width: '100vw',
            maxWidth: '100vw',
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
            overflowX: 'hidden',
          }}
        >
          <Carousel compact={isMobile} />

          {isMobile && (
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
                 handleRoomType={handleRoomType}
                 handleBookNow={handleBookNow}
                 submitting={submitting}
                 forceStatic={true}
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
      <AboutUs />
      <Testimonial />
      

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