// components/AboutUs.jsx
import React from "react"
import { Title } from "@/components/common/Title"
import Image from "next/image"
import { roomdata } from "@/assets/data/dummydata" // import data to map images

const AboutUs = () => {
  // build images list from data.js; fallback to /images/bed1.jpg
  const images = roomdata.slice(0, 3).map((item) => item.cover || "/images/bed1.jpg")

  return (
    <>
      <section className='about-us' style={{ padding: '80px 0', background: '#f9f9f9' }}>
        <div className='container'>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title title='About Us' />
          </div>

          {/* Content */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto 60px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.8',
              color: '#333',
              marginBottom: '20px',
              textAlign: 'justify'
            }}>
              Hotel Amore is Located at Balapitiya, a beautiful city down south Sri Lanka and a mere 3-hour drive from Colombo. Hotel Amore is a prime spot for creating unforgettable experiences.
            </p>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.8',
              color: '#333',
              textAlign: 'justify'
            }}>
              Inside, our Hotel provides you with exquisite and equally comfortable room choices that promise to make you feel at home. Outside, the Balapitiya beach is within walking distance, and the anticipation of boat rides in the heart of the wetlands of Madu River will give you the time of your life. To satiate your appetite after all the sightseeing, Hotel Amore invites you to our exotic restaurant with a menu so tantalizing and varied it is bound to suit every taste bud of yours.
            </p>
          </div>

          {/* Image Grid - rendered from data via map */}
          <div className="image-grid">
            {images.map((src, idx) => (
              <div
                key={idx}
                className={`img-wrap ${idx === 1 ? 'large' : ''}`} // center image larger
              >
                <Image
                  src={src}
                  alt={`about-image-${idx}`}
                  width={600}
                  height={400}
                  priority={idx === 1}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive Styles */}
      <style jsx>{`
        .image-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: center;
        }
        .img-wrap {
          overflow: hidden;
          border-radius: 8px;
          height: 300px;
        }
        .img-wrap.large {
          height: 400px;
        }
        /* Target the underlying img rendered by next/image */
        .img-wrap :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .img-wrap:hover :global(img) {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .image-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .img-wrap {
            height: 250px;
          }
          .img-wrap.large {
            height: 300px;
          }
        }
      `}</style>
    </>
  )
}

export default AboutUs