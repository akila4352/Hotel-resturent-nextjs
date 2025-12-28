// components/Footer.jsx
import Link from "next/link"
import Image from "next/image"
import footerLogo from "../../public/images/footer-logo.png"
import { BsFacebook } from "react-icons/bs"
import { AiFillInstagram } from "react-icons/ai"
import { FaAirbnb, FaTripadvisor } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { useState, useRef } from "react";
import { rtdb } from "../../lib/firebase";
import { ref, push, serverTimestamp } from "firebase/database";
import dynamic from "next/dynamic";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

const Footer = () => {
  const [message, setMessage] = useState("");
  const [gmail, setGmail] = useState(""); // new state for gmail
  const [status, setStatus] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!gmail.trim() || !gmail.includes("@gmail.com")) {
      setStatus("Please enter a valid Gmail address.");
      return;
    }
    if (!message.trim()) {
      setStatus("Please enter a message.");
      return;
    }
    if (!recaptchaToken) {
      setStatus("Please complete the reCAPTCHA.");
      return;
    }
    try {
      // 1. Verify reCAPTCHA token with your backend, send gmail as well
      const verifyRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recaptchaToken, gmail }), // send gmail
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setStatus("reCAPTCHA failed. Please try again.");
        return;
      }

      // 2. Only push to Firebase if reCAPTCHA is valid
      await push(ref(rtdb, "newsletterMessages"), {
        gmail,
        message,
        createdAt: Date.now(),
      });
      setStatus("Message sent!");
      setMessage("");
      setGmail("");
      setRecaptchaToken("");
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } catch (error) {
      setStatus("Failed to send. Try again.");
    }
  };
  return (
    <>
      {/* Google Map Section */}
      <section className="map-section1">
        {(() => {
          const lat = 6.292282008549159;
          const lng = 80.04071460920905;
          const placeQuery = encodeURIComponent("Amore 392 Galle Rd Balapitiya");
          const apiKey = process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
          const placeId = process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID || "";

          let src = "";
          if (apiKey && placeId) {
            src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`;
          } else if (apiKey) {
            src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${placeQuery}`;
          } else {
            src = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
          }

          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

          return (
            <>
              <iframe
                src={src}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Amore Location - Balapitiya"
              ></iframe>

              <div className="place-card" aria-hidden>
                <div className="place-left">
                  <strong className="place-name">Amore</strong>
                  <div className="place-address">392 Galle Rd, Balapitiya</div>
                </div>
                <div className="place-right">
                  <div className="rating">
                    <span className="score">5.0</span>
                    <span className="stars">★★★★★</span>
                  </div>
                  <a className="reviews" href="#" onClick={(e)=>e.preventDefault()}>1 review</a>
                  <a
                    className="directions-btn"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get directions to Amore"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </>
          );
        })()}
      </section>

      <style jsx>{`
        .map-section1 {
          width: 100%;
          height: 240px;
          position: relative;
          margin-bottom: 0;
        }
        .place-card {
          position: absolute;
          left: 12px;
          bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          color: #111;
          padding: 10px 12px;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          font-size: 13px;
          min-width: 220px;
          z-index: 5;
        }
        .place-name { display:block; font-size:15px; color:#111; }
        .place-address { color:#666; font-size:12px; margin-top:2px; }
        .place-right { text-align: right; min-width:90px; }
        .rating { color:#d4af37; font-weight:600; display:flex; align-items:center; gap:6px; justify-content:flex-end; }
        .score { color:#111; font-weight:700; margin-right:4px; }
        .stars { font-size:12px; letter-spacing:1px; color:#d4af37; }
        .reviews { color:#1a73e8; text-decoration:none; font-size:12px; display:block; margin-top:4px; }
        .directions-btn {
          display: inline-block;
          margin-top: 8px;
          padding: 6px 10px;
          background: #1a73e8;
          color: #fff;
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(26,115,232,0.18);
        }
        .directions-btn:hover { background: #155abd; }

        @media (max-width: 768px) {
          .map-section1 { height: 180px; }
          .place-card { left: 8px; bottom: 8px; padding:8px 10px; min-width:190px; font-size:12px; }
        }
        @media (max-width: 420px) {
          .map-section1 { height: 150px; }
          .place-card { left: 6px; bottom: 6px; padding:7px 9px; min-width:160px; font-size:11px; }
        }
      `}</style>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>
          
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input 
              type="email"
              placeholder="Enter your Gmail address"
              className="newsletter-input"
              value={gmail}
              onChange={e => setGmail(e.target.value)}
              style={{ marginBottom: 10 }}
              required
            />
            <input 
              type="text" 
              placeholder="Send your message" 
              className="newsletter-input"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
            {/* reCAPTCHA widget */}
            <div style={{ margin: "10px 0" }}>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LfzQjksAAAAAJ48SRIwoZW-yVjaZMFGOXIdGA1p"}
                onChange={token => setRecaptchaToken(token)}
                ref={recaptchaRef}
              />
            </div>
            <button type="submit" className="newsletter-submit">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </form>
          {status && (
            <div style={{ color: status === "Message sent!" ? "#c9a961" : "#ff6b6b", marginTop: 8, fontSize: 14 }}>
              {status}
            </div>
          )}

          <div className="social-icons">
            <Link href='https://twitter.com' target='_blank' className="social-link">
              <FaXTwitter size={20} />
            </Link>
            <Link href='https://facebook.com' target='_blank' className="social-link">
              <BsFacebook size={20} />
            </Link>
            <Link href='https://tripadvisor.com' target='_blank' className="social-link">
              <FaTripadvisor size={20} />
            </Link>
            <Link href='https://instagram.com' target='_blank' className="social-link">
              <AiFillInstagram size={20} />
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .newsletter-section {
          background: #3a3a3a;
          padding: 50px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .newsletter-container {
          max-width: 800px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .newsletter-icon {
          color: #c9a961;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border: 2px solid #c9a961;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .newsletter-form {
          position: relative;
          flex: 1;
          min-width: 300px;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .newsletter-input {
          width: 100%;
          padding: 15px 60px 15px 20px;
          background: #4a4a4a;
          border: 1px solid #5a5a5a;
          border-radius: 4px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          margin-bottom: 0;
        }

        .newsletter-input::placeholder {
          color: #999;
        }

        .newsletter-input:focus {
          border-color: #c9a961;
          background: #4f4f4f;
        }

        .newsletter-submit {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          background: #c9a961;
          border: none;
          width: 45px;
          height: 45px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s ease;
          color: #2a2a2a;
        }

        .newsletter-submit:hover {
          background: #d4b872;
        }

        .social-icons {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .social-link {
          color: #fff;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-link:hover {
          color: #c9a961;
        }

        @media (max-width: 768px) {
          .newsletter-container {
            gap: 30px;
          }
          
          .newsletter-icon {
            width: 60px;
            height: 60px;
          }

          .newsletter-form {
            min-width: 250px;
          }
        }
      `}</style>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className='footer-content'>
          <div className='footer-logo-section'>
            <Image
              src={footerLogo}
              alt="Amore logo"
              width={200}
              height={120}
              priority
            />
          </div>
          
          <div className='footer-links'>
            <Link href='/hotel-policies' className='footer-link'>Hotel Policies</Link>
            <Link href='/contact' className='footer-link'>Contact Us</Link>
          </div>

          <button className='scroll-top' onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            </svg>
          </button>
        </div>
      </footer>

      <style jsx>{`
        .main-footer {
          background: #2a2a2a;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
        }

        .footer-content {
          max-width: 1200px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .footer-logo-section {
          display: flex;
          justify-content: center;
        }

        .footer-links {
          display: flex;
          gap: 60px;
          align-items: center;
        }

        .footer-link {
          color: #fff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #c9a961;
        }

        .scroll-top {
          background: transparent;
          border: 2px solid #c9a961;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #c9a961;
        }

        .scroll-top:hover {
          background: #c9a961;
          color: #2a2a2a;
          transform: translateY(-5px);
        }

        @media (max-width: 768px) {
          .footer-links {
            flex-direction: column;
            gap: 20px;
          }

          .footer-content {
            gap: 30px;
          }
        }
      `}</style>
    </>
  )
}

export default Footer