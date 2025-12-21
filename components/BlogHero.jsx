"use client"
import React, { useRef, useEffect } from "react"

const BlogHero = ({ videoUrl, title, subtitle, description }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.loop = true
      videoRef.current.playsInline = true
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section style={{
      position: 'relative',
      height: '420px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
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
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <div style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: '30px'
        }}>
          <h1
            className="title-underline"
            style={{
              fontSize: '90px',
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
            {title}
          </h1>
        </div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '300',
          color: '#d4af37',
          margin: '0',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          {subtitle}
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {description}
        </p>
      </div>
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
            font-size: 48px !important;
          }
          section h2 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </section>
  )
}

export default BlogHero
