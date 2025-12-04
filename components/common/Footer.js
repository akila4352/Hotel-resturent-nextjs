// components/Footer.jsx
import Link from "next/link"
import { TitleLogo } from "./Title"
import { BsFacebook } from "react-icons/bs"
import { AiFillInstagram } from "react-icons/ai"
import { FaAirbnb, FaTripadvisor } from "react-icons/fa"


const Footer = () => {
  return (
    <>
      {/* Google Map Section (reduced height, responsive) */}
      <section className="map-section1">
        {(() => {
          // exact hotel coordinates
          const lat = 6.292282008549159;
          const lng = 80.04071460920905;
          const placeQuery = encodeURIComponent("Amore 392 Galle Rd Balapitiya");
          const apiKey = process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
          const placeId = process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID || ""; // optional

          // Prefer Place mode with place_id if available, otherwise use place name with API key.
          let src = "";
          if (apiKey && placeId) {
            src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`;
          } else if (apiKey) {
            src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${placeQuery}`;
          } else {
            // fallback: center map on exact lat/lng and add a marker via query (no API key)
            src = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
          }

          // build directions URL (opens Google Maps directions to the hotel)
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

              {/* Custom overlay place card to show name/address/rating and a Directions button */}
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
          height: 240px; /* reduced default height */
          position: relative;
          margin-bottom: 0;
        }
        /* place card overlay */
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
        /* add styles for the directions button inside the same <style jsx> block already in the file */
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

      <footer>
        <div className='container'>
          <div className='grid-4'>
            <div className='logo'>
              <TitleLogo title='AMORE' className='logobg' />
              <br />
              <span>
                Questions? Reach us <br /> Monday – Friday from 9 am to 6 pm
              </span>
              <br />
              <br />
              <h3>0725845841</h3>
              <br />
              <button className='button-primary'>Request For Quote</button>
            </div>
            <ul>
              <h3>COMPANY</h3>
              <li>
                <Link href='/about'>About</Link>
              </li>
              <li>
                <Link href='/contact'>Contact</Link>
              </li>
            </ul>
            <ul>
              <h3>SERVICES</h3>
              <li>
                <Link href='/hotel'>Hotel</Link>
              </li>
              <li>
                <Link href='/restaurants'>Resturens</Link>
              </li>
              <li>
                <Link href='/travel-guide'>Travel Guid</Link>
              </li>
            </ul>
            <ul>
              <h3>CONNECT</h3>
              <div className='connect'>
                <li>
                  <Link href='https://facebook.com' target='_blank'>
                    <BsFacebook size={25} />
                  </Link>
                </li>
                <li>
                  <Link href='https://tripadvisor.com' target='_blank'>
                    <FaTripadvisor size={25} />
                  </Link>
                </li>
                <li>
                  <Link href='https://instagram.com' target='_blank'>
                    <AiFillInstagram size={25} />
                  </Link>
                </li>
                <li>
                  <Link href='https://airbnb.com' target='_blank'>
                    <FaAirbnb size={25} />
                  </Link>
                </li>
              </div>
            </ul>
          </div>
          <div className='legal connect py'>
            <div className='text'>
              <span>© 2025 THE SEVEN. ALL RIGHTS RESERVED.</span>
            </div>
            <div className='connect'>
              <span>DEVELOP BY</span>
              <span> &nbsp; | &nbsp; </span>
              <span>AKILA NIRMAL</span>
            </div>
          </div>
        </div>
      </footer>

    
    </>
  )
}

export default Footer