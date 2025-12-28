import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { RiMenu4Line } from "react-icons/ri"
import { AiOutlineClose } from "react-icons/ai"
import { FaGlobeAmericas } from "react-icons/fa"
import Head from "next/head"
import ReactCountryFlag from "react-country-flag"

const Header = () => {
  const [activeLink, setActiveLink] = useState("")
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [currentLang, setCurrentLang] = useState({ code: 'en', countryCode: 'GB', label: 'English' })

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
      if (open && !e.target.closest('.desktop-nav') && !e.target.closest('.menu-toggle-btn')) {
        setOpen(false)
      }
      if (showLangDropdown && !e.target.closest('.language-selector')) {
        setShowLangDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open, showLangDropdown])

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/rooms2', label: 'ROOMS' },
    { href: '/restaurant2', label: 'RESTAURANT' },
    { href: '/showcase', label: 'NEARBY PLACES' },
    { href: '/blogs', label: 'CONTACT' }
  ]

  const languages = [
    { code: 'en', label: 'English', countryCode: 'GB' },
    { code: 'sv', label: 'Svenska', countryCode: 'SE' },
    { code: 'es', label: 'Español', countryCode: 'ES' },
    { code: 'fr', label: 'Français', countryCode: 'FR' },
    { code: 'de', label: 'Deutsch', countryCode: 'DE' },
    { code: 'it', label: 'Italiano', countryCode: 'IT' },
    { code: 'pt', label: 'Português', countryCode: 'PT' },
    { code: 'ja', label: '日本語', countryCode: 'JP' },
    { code: 'ko', label: '한국어', countryCode: 'KR' },
    { code: 'zh-CN', label: '中文', countryCode: 'CN' },
    { code: 'ar', label: 'العربية', countryCode: 'SA' },
    { code: 'hi', label: 'हिन्दी', countryCode: 'IN' },
    { code: 'si', label: 'සිංහල', countryCode: 'LK' }
  ]

  const changeLanguage = (langCode, countryCode, label) => {
    const googleTranslateSelect = document.querySelector('.goog-te-combo')
    if (googleTranslateSelect) {
      googleTranslateSelect.value = langCode
      googleTranslateSelect.dispatchEvent(new Event('change'))
      setCurrentLang({ code: langCode, countryCode: countryCode, label: label })
      setShowLangDropdown(false)
      setOpen(false)
    }
  }

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
            {open ? <AiOutlineClose size={24} style={{ pointerEvents: 'none' }} /> : <RiMenu4Line size={24} style={{ pointerEvents: 'none' }} />}
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

          {/* Navigation */}
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
            
            {/* Language Selector as Nav Item */}
            <div className="language-selector">
              <button
                className="nav-link lang-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLangDropdown(!showLangDropdown)
                }}
                aria-label="Select language"
              >
                <ReactCountryFlag
                  countryCode={currentLang.countryCode}
                  svg
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                  title={currentLang.label}
                />
                <span className="lang-name">{currentLang.label}</span>
              </button>

              {showLangDropdown && (
                <div className="lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`lang-option ${currentLang.code === lang.code ? 'active' : ''}`}
                      onClick={() => changeLanguage(lang.code, lang.countryCode, lang.label)}
                    >
                      <ReactCountryFlag
                        countryCode={lang.countryCode}
                        svg
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          objectFit: 'cover'
                        }}
                        title={lang.label}
                      />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

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
          background: rgba(255,255,255,0.08);
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          transition: background 0.2s;
          z-index: 1200;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
        }

        .menu-toggle-btn:hover, .menu-toggle-btn:focus {
          background: rgba(255, 255, 255, 0.18);
          outline: none;
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
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
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
        }

        .lang-trigger {
          white-space: nowrap;
          text-shadow: none !important;
        }

        .lang-trigger:hover {
          text-shadow: none !important;
        }

        .lang-name {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1.2px;
          text-shadow: none !important;
        }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: rgba(15, 25, 40, 0.98);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          overflow: hidden;
          min-width: 200px;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.2s ease;
          z-index: 2000;
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
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          text-align: left;
          font-family: 'Playfair Display', serif;
        }

        .lang-option:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .lang-option.active {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          font-weight: 600;
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

          .logo {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }

          .lang-dropdown {
            position: fixed;
            top: auto;
            right: 50%;
            transform: translateX(50%);
            width: 90vw;
            max-width: 300px;
          }
        }

        /* Scrollbar styling for language dropdown */
        .lang-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .lang-dropdown::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .lang-dropdown::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .lang-dropdown::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
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