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
  const [transparent, setTransparent] = useState(false)
  const [zoom, setZoom] = useState(false) // added zoom state for logo hover effect

  const router = useRouter()
  useEffect(() => {
    setActiveLink(router.pathname)
  }, [router.pathname])

  // make header transparent when user scrolls (toggle at 20px)
  useEffect(() => {
    const onScroll = () => {
      setTransparent(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header className={transparent ? "transparent" : ""}>
        <div className='container'>
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
                height={80}
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
          <nav className={open ? "openMenu" : "closeMenu"} onClick={() => setOpen(null)}>
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
          <button onClick={() => setOpen(!open)}>{open ? <AiOutlineClose size={25} /> : <RiMenu4Line size={25} />}</button>
         </div>
       </header>
     </>
   )
 }
 
 export default Header
