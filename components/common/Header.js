import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { RiMenu4Line } from "react-icons/ri"
import { AiOutlineClose } from "react-icons/ai"
import { FaGlobeAmericas } from "react-icons/fa"
import Head from "next/head" // <-- Add this line

const Header = () => {
  const [activeLink, setActiveLink] = useState("")
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  const router = useRouter()
  
  useEffect(() => {
    setActiveLink(router.pathname)
  }, [router.pathname])

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && !e.target.closest('.mobile-nav') && !e.target.closest('.menu-toggle-btn')) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/rooms2', label: 'ROOMS' },
    { href: '/restaurant2', label: 'RESTAURANT' },
    { href: '/showcase', label: 'NEARBY PLACES' },
    { href: '/blogs', label: 'CONTACT' }
  ]

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ]

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          background: isScrolled ? "rgba(11,18,32,0.95)" : "transparent",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
          boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
          backdropFilter: isScrolled ? "saturate(120%) blur(10px)" : "none",
        }}
      >
        <div className='container'>
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="menu-toggle-btn"
          >
            {open ? <AiOutlineClose size={24} /> : <RiMenu4Line size={24} />}
          </button>

          {/* Logo */}
          <div className='logo'>
            <Link
              href='/'
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              <Image
                src="/images/logoo.png"
                alt="AMORE logo"
                width={280}
                height={50}
                priority
                style={{
                  objectFit: "contain",
                  transition: "transform 0.3s ease",
                  transform: zoom ? "scale(1.08)" : "scale(1)",
                }}
              />
            </Link>
          </div>

          {/* Navigation - always rendered, but hidden on mobile unless menu is open */}
          <nav className={`desktop-nav${open ? ' show-on-mobile' : ''}`}>
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={activeLink === link.href ? "nav-link active" : "nav-link"}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Mobile Navigation - REMOVE this block */}
        {/* 
        <div className={`mobile-nav ${open ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={activeLink === link.href ? "mobile-nav-link active" : "mobile-nav-link"}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        */}
        {/* Backdrop overlay for mobile menu */}
        {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      </header>

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .menu-toggle-btn {
          display: none;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s ease;
          z-index: 1200;
        }

        .menu-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          z-index: 1150;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 40px;
          flex: 1;
          justify-content: center;
          margin: 0 40px;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          .desktop-nav.show-on-mobile {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 60px;
            left: 0;
            width: 100vw;
            background: rgba(15, 25, 40, 0.98);
            z-index: 1500;
            padding: 32px 0 16px 0;
            box-shadow: 0 8px 32px rgba(0,0,0,0.25);
            align-items: center;
            gap: 24px;
          }
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1.2px;
          transition: all 0.3s ease;
          position: relative;
          padding: 8px 0;
          font-family: 'Playfair Display', serif !important;
          text-shadow:
            1px 1px 0 #222,
            2px 2px 0 #222,
            3px 3px 1px #111,
            4px 4px 2px #000,
            0 5px 15px rgba(0,0,0,0.25),
            0 1px 0 #fff,
            0 2px 0 #fff,
            0 3px 0 #fff;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #fff;
          transition: width 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #fff;
          font-family: 'Playfair Display', serif !important;
          text-shadow:
            1px 1px 0 #222,
            2px 2px 0 #222,
            3px 3px 1px #111,
            4px 4px 2px #000,
            0 5px 15px rgba(0,0,0,0.25),
            0 1px 0 #fff,
            0 2px 0 #fff,
            0 3px 0 #fff;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .language-selector {
          position: relative;
          z-index: 1150;
        }

        .lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: rgba(20, 30, 50, 0.98);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          overflow: hidden;
          min-width: 160px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lang-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .lang-option:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .flag {
          font-size: 18px;
        }

        .mobile-nav {
          position: fixed;
          top: 70px;
          left: 0;
          width: 300px;
          height: calc(100vh - 70px);
          background: rgba(15, 25, 40, 0.98);
          backdrop-filter: blur(10px);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1090;
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
        }

        .mobile-nav.open {
          transform: translateX(0);
        }

        .mobile-nav-content {
          padding: 24px;
        }

        .mobile-nav-link {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 1px;
          padding: 16px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
          font-family: 'Playfair Display', serif !important;
          text-shadow:
            1px 1px 0 #222,
            2px 2px 0 #222,
            3px 3px 1px #111,
            4px 4px 2px #000,
            0 5px 15px rgba(0,0,0,0.25),
            0 1px 0 #fff,
            0 2px 0 #fff,
            0 3px 0 #fff;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          padding-left: 20px;
          font-family: 'Playfair Display', serif !important;
          text-shadow:
            1px 1px 0 #222,
            2px 2px 0 #222,
            3px 3px 1px #111,
            4px 4px 2px #000,
            0 5px 15px rgba(0,0,0,0.25),
            0 1px 0 #fff,
            0 2px 0 #fff,
            0 3px 0 #fff;
        }

        .mobile-lang-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-lang-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 12px;
          padding: 0 12px;
        }

        .mobile-lang-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .mobile-lang-option:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1080;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
            height: 60px;
          }

          .menu-toggle-btn {
            display: flex;
          }

          .desktop-nav {
            display: none;
          }

          .language-selector {
            display: none;
          }

          .logo {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
        }

        @media (min-width: 769px) {
          .mobile-nav {
            display: none;
          }

          .backdrop {
            display: none;
          }
        }

        /* 3D text effect styles for navigation links */
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
        :global(header nav a.active),
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
      `}</style>
    </>
  )
}
 
export default Header