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
                 width={200}  // reduced logo width
                 height={48}  // reduced logo height
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
             <Link href='/rooms2' className={activeLink == "/rooms2" ? "activeLink" : "none"}>
               ROOMS
             </Link>
             <Link href='/restaurant2' className={activeLink == "/restaurant2" ? "activeLink" : "none"}>
               RESTURANT
             </Link>
         
             <Link href='/showcase' className={activeLink == "/showcase" ? "activeLink" : "none"}>
               NEAR BY PLACES
             </Link>
             <Link href='/blogs' className={activeLink == "/blogs" ? "activeLink" : "none"}>
               Contact
             </Link>
         
            
           </nav>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <AiOutlineClose size={25} /> : <RiMenu4Line size={25} />}
          </button>
          </div>
       </header>

      {/* 3D text effect styles for navigation links */}
      <style jsx>{`
        :global(header nav a) {
          font-family: 'Playfair Display', serif;
          text-shadow: 
            1px 1px 0 rgba(0,0,0,0.15),
            2px 2px 0 rgba(0,0,0,0.12),
            3px 3px 0 rgba(0,0,0,0.1),
            4px 4px 5px rgba(0,0,0,0.2),
            0 5px 15px rgba(0,0,0,0.25);
          font-weight: 600;
          transition: all 0.3s ease;
        }

        :global(header nav a:hover),
        :global(header nav a.activeLink) {
          font-family: 'Playfair Display', serif;
          text-shadow: 
            1px 1px 0 rgba(0,0,0,0.2),
            2px 2px 0 rgba(0,0,0,0.18),
            3px 3px 0 rgba(0,0,0,0.15),
            4px 4px 0 rgba(0,0,0,0.12),
            5px 5px 8px rgba(0,0,0,0.25),
            0 6px 20px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          :global(header nav a) {
            font-family: 'Playfair Display', serif;
            text-shadow: 
              1px 1px 0 rgba(0,0,0,0.12),
              2px 2px 0 rgba(0,0,0,0.1),
              3px 3px 5px rgba(0,0,0,0.18),
              0 4px 12px rgba(0,0,0,0.2);
          }

          :global(header nav a:hover),
          :global(header nav a.activeLink) {
            font-family: 'Playfair Display', serif;
            text-shadow: 
              1px 1px 0 rgba(0,0,0,0.15),
              2px 2px 0 rgba(0,0,0,0.12),
              3px 3px 6px rgba(0,0,0,0.2),
              0 5px 15px rgba(0,0,0,0.25);
          }
        }
      `}</style>
    </>
  )
}

export default Header
