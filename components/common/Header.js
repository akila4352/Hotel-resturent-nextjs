import Link from "next/link"
import { TitleLogo } from "./Title"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { RiMenu4Line } from "react-icons/ri"
import { AiOutlineClose } from "react-icons/ai"

const Header = () => {
  const [activeLink, setActiveLink] = useState("")
  const [open, setOpen] = useState(false)
  const [transparent, setTransparent] = useState(false)

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
            <Link href='/'>
              <TitleLogo title='AMORE' caption='' className='logomin' />
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
           
        
           
          </nav>
          <button onClick={() => setOpen(!open)}>{open ? <AiOutlineClose size={25} /> : <RiMenu4Line size={25} />}</button>
         </div>
       </header>
     </>
   )
 }
 
 export default Header
