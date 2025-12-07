// components/Contact.jsx
"use client"

import React, { useRef, useEffect } from "react"

const Blogs = () => {
  const videoRef = useRef(null)

  useEffect(() => {
    // Auto-loop the video and ensure muted so autoplay works
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.loop = true
      videoRef.current.playsInline = true
      videoRef.current.play().catch(err => console.log("Autoplay blocked:", err))
    }
  }, [])

  return (
    <>
      {/* Hero Section with Video Background Text */}
      <section style={{
        position: 'relative',
        height: '420px', // reduced from 600px
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Background video (autoplays muted and fills the area) */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <source src="https://media.istockphoto.com/id/1194337503/video/aerial-view-of-clear-turquoise-sea-and-waves.mp4?s=mp4-640x640-is&k=20&c=9bXAggRhoV_cO7uqdXF8cCUn-d1gTDg0hzjbG3Z8XoU=" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}></div>

        {/* Text with Video Background Cutout */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 20px'
        }}>
          {/* Large Text with Video Background */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '30px'
          }}>
            <h1
              className="title-underline"
              style={{
                fontSize: '90px', // reduced from 150px
                fontWeight: '900',
                margin: '0',
                letterSpacing: '10px',
                textTransform: 'uppercase',
                lineHeight: '1',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                WebkitTextStroke: '3px white',
                textStroke: '3px white',
                textShadow: 'none'
              }}
            >
               AMORE Hotel
            </h1>
          </div>

          {/* Amore Subtitle */}
          <h2 style={{
            fontSize: '28px', // reduced subtitle size for balance
            fontWeight: '300',
            color: '#d4af37',
            margin: '0',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
           CONTACT
          </h2>

          {/* Subtitle Text */}
          <p style={{
            fontSize: '1.2rem',
            color: 'white',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Get in touch with us for reservations, inquiries, and more
          </p>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          animation: 'bounce 2s infinite'
        }}>
          <div style={{
            width: '30px',
            height: '50px',
            border: '2px solid #d4af37',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '10px 0'
          }}>
            <div style={{
              width: '4px',
              height: '10px',
              background: '#d4af37',
              borderRadius: '2px',
              animation: 'scroll 1.5s infinite'
            }}></div>
          </div>
        </div>
      </section>

     
      {/* Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        @keyframes scroll {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        @media (max-width: 768px) {
          section h1 {
            font-size: 48px !important; /* adjust responsive size */
          }
          section h2 {
            font-size: 2rem !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

export default Blogs