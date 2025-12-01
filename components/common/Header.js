import Link from "next/link"
// replace TitleLogo import with Next.js Image
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { RiMenu4Line } from "react-icons/ri"
import { AiOutlineClose } from "react-icons/ai"

const Header = () => {
  const [activeLink, setActiveLink] = useState("")
  const [open, setOpen] = useState(false)
  // header is transparent at top (isScrolled === false). When user scrolls > 20px we mark it scrolled.
  const [isScrolled, setIsScrolled] = useState(false)
  const [zoom, setZoom] = useState(false) // added zoom state for logo hover effect

  const router = useRouter()
  useEffect(() => {
    setActiveLink(router.pathname)
  }, [router.pathname])

  // make header transparent when user scrolls (toggle at 20px)
  useEffect(() => {
    const onScroll = () => {
      // set true when scrolled past threshold so we can show dark background
      setIsScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
 
  return (
    <>
      {/* Fixed header overlays the carousel. Background toggles based on isScrolled. */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          background: isScrolled ? "rgba(11,18,32,0.95)" : "transparent",
          transition: "background 220ms ease, box-shadow 220ms ease",
          boxShadow: isScrolled ? "0 6px 20px rgba(2,6,23,0.35)" : "none",
          backdropFilter: isScrolled ? "saturate(120%) blur(6px)" : "none",
        }}
      >
        <div className='container' style={{ position: "relative" }}>
           <div className='logo'>
             <Link
               href='/'
               onMouseEnter={() => setZoom(true)}
               onMouseLeave={() => setZoom(false)}
             >
               {/* increased logo size to 260x80 and added zoom transition */}
               <Image
                 src="/images/logo1.png"
                 alt="AMORE logo"
                 width={260}
                 height={60}
                 priority
                 style={{
                   objectFit: "contain",
                   transition: "transform 220ms ease",
                   transform: zoom ? "scale(1.15)" : "scale(1)"
                 }}
                 className="logomin"
               />
             </Link>
           </div>
          <nav className={open ? "openMenu" : "closeMenu"} onClick={() => setOpen(false)}>
             <Link href='/' className={activeLink == "/" ? "activeLink" : "none"}>
               Home
             </Link>
             <Link href='/rooms' className={activeLink == "/rooms" ? "activeLink" : "none"}>
               ROOMS
             </Link>
             <Link href='/resturant' className={activeLink == "/resturant" ? "activeLink" : "none"}>
               RESTURANT
             </Link>
         
             <Link href='/showcase' className={activeLink == "/showcase" ? "activeLink" : "none"}>
               NEAR BY PLACES
             </Link>
             <Link href='/blogs' className={activeLink == "/blogs" ? "activeLink" : "none"}>
               BLOG
             </Link>
         
            
           </nav>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <AiOutlineClose size={25} /> : <RiMenu4Line size={25} />}
          </button>
          </div>
       </header>
     </>
   )
 }
 
 export default Header
