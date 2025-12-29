import Head from "next/head"
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
import Link from 'next/link'

// Auto-Swapping Icons Component
const AutoSwapIcons = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const itemsPerView = 4

  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [items.length, isPaused])

  const getVisibleItems = () => {
    const visible = []
    for (let i = 0; i < itemsPerView; i++) {
      visible.push(items[(currentIndex + i) % items.length])
    }
    return visible
  }

  const handlePrev = () => {
    setIsPaused(true)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
      setIsAnimating(false)
      setTimeout(() => setIsPaused(false), 5000)
    }, 300)
  }

  const handleNext = () => {
    setIsPaused(true)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setIsAnimating(false)
      setTimeout(() => setIsPaused(false), 5000)
    }, 300)
  }
 
  return (
    <>
      <style jsx>{`
        .auto-swap-container {
          position: relative;
          overflow: hidden;
          padding: 20px 0;
        }

        .icons-wrapper {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          transition: opacity 0.3s ease;
          opacity: ${isAnimating ? 0.3 : 1};
        }

        .icon-box {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 30px 20px;
          text-align: center;
          transition: all 0.3s ease;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .icon-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-color: #d4af37;
        }

        .icon-box .icon {
          font-size: 48px;
          color: #d4af37;
          margin-bottom: 20px;
          display: block;
        }

        .icon-box h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          border: 2px solid #d4af37;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .nav-button:hover {
          background: #d4af37;
          color: white;
        }

        .nav-button.prev {
          left: 10px; /* Adjusted from -25px */
        }

        .nav-button.next {
          right: 10px; /* Adjusted from -25px */
        }

        .nav-button svg {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 1024px) {
          .icons-wrapper {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .icons-wrapper {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .icon-box {
            padding: 20px 15px;
            min-height: 150px;
          }

          .icon-box .icon {
            font-size: 36px;
          }

          .icon-box h3 {
            font-size: 16px;
          }

          .nav-button {
            width: 40px;
            height: 40px;
          }

          .nav-button.prev {
            left: 5px; /* Adjusted from -15px */
          }

          .nav-button.next {
            right: 5px; /* Adjusted from -15px */
          }
        }

        @media (max-width: 480px) {
          .icons-wrapper {
            grid-template-columns: 1fr;
          }

          .nav-button {
            display: none;
          }
        }
      `}</style>

      <div className="auto-swap-container">
        <button className="nav-button prev" onClick={handlePrev} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="icons-wrapper">
          {getVisibleItems().map((item, i) => (
            item.link ? (
              <Link href={item.link} passHref legacyBehavior key={`${currentIndex}-${i}`}>
                <a className="icon-box">
                  <span className="icon">{item.icon}</span>
                  <h3>{item.title}</h3>
                </a>
              </Link>
            ) : (
              <div className="icon-box" key={`${currentIndex}-${i}`}>
                <span className="icon">{item.icon}</span>
                <h3>{item.title}</h3>
              </div>
            )
          ))}
        </div>

        <button className="nav-button next" onClick={handleNext} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </>
  )
}


const seoKeywords = [
  "luxury beach resort",
  "boutique hotel",
  "romantic hotel",
  "family-friendly hotel",
  "quiet beach hotel",
  "all-inclusive resort",
  "hotel in srilanka",
  "hotel in Balapitiya",
  "hotel in Ambalangoda",
  "hotel in Galle",
  "beach hotel in srilanka",
  "beach hotel in Balapitiya",
  "beach hotel in Ambalangoda",
  "beach hotel in Galle",
  "resort in srilanka",
  "resort in Balapitiya",
  "resort in Ambalangoda",
  "resort in Galle",
  "beachfront hotel srilanka",
  "beachfront hotel Balapitiya",
  "beachfront hotel Ambalangoda",
  "beachfront hotel Galle",
  "seaside hotel srilanka",
  "seaside hotel Balapitiya",
  "seaside hotel Ambalangoda",
  "seaside hotel Galle"
].join(", ");

const seoTitle = "Hotel Amore | Luxury Beach Resort & Boutique Hotel in Balapitiya, Sri Lanka";
const seoDescription = "Hotel Amore is a luxury beachfront boutique hotel and resort in Balapitiya, Sri Lanka. Perfect for romantic getaways, family holidays, and quiet escapes. Enjoy all-inclusive amenities, stunning sea views, and easy access to Ambalangoda and Galle.";

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
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:image" content="https://yourdomain.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="https://yourdomain.com/images/og-image.jpg" />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Head>

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
          <AutoSwapIcons items={home} />
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