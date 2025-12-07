// components/Rooms.jsx
"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { roomsdata } from "@/assets/data/dummydata"

const Rooms = () => {
  const [selectedImages, setSelectedImages] = useState({})
  const [imageIndexes, setImageIndexes] = useState({})

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      roomsdata.forEach((room) => {
        const gallery = room.gallery || [room.image]
        const currentIndex = imageIndexes[room.id] || 0
        const nextIndex = (currentIndex + 1) % gallery.length

        setImageIndexes(prev => ({
          ...prev,
          [room.id]: nextIndex
        }))

        setSelectedImages(prev => ({
          ...prev,
          [room.id]: gallery[nextIndex]
        }))
      })
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [imageIndexes])

  const handleThumbnailClick = (roomId, img, index) => {
    setSelectedImages({...selectedImages, [roomId]: img})
    setImageIndexes({...imageIndexes, [roomId]: index})
  }

  return (
    <>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '300px',
        backgroundImage: "url('/images/b1.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <h1
            className="title-underline"
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '3px'
            }}
          >
            ROOMS & RATES
          </h1>
          <p style={{
            fontSize: '1.1rem',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Our living spaces are about more than just accommodating gorgeous surroundings and modern conveniences.
          </p>
        </div>
      </section>

      {/* Rooms Section */}
      <section style={{ padding: '60px 0', background: 'white' }}>
        <div className='container'>
          {roomsdata.map((room, index) => {
            const currentImage = selectedImages[room.id] || room.image
            const allImages = room.gallery || [room.image]
            const currentIndex = imageIndexes[room.id] || 0

            return (
              <div
                key={room.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '50px',
                  alignItems: 'center',
                  marginBottom: '80px'
                }}
                className="room-row"
              >
                {/* Image Section */}
                <div style={{
                  position: 'relative',
                  order: index % 2 === 0 ? 1 : 2
                }}>
                  {/* Main Image with Animation */}
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    height: '350px',
                    marginBottom: '15px'
                  }}>
                    <Image
                      key={currentImage}
                      src={currentImage}
                      alt={room.name}
                      width={600}
                      height={350}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        animation: 'fadeInScale 0.8s ease-in-out'
                      }}
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    {allImages.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleThumbnailClick(room.id, img, idx)}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '4px',
                          height: '100px',
                          cursor: 'pointer',
                          border: currentIndex === idx ? '3px solid #d4af37' : '3px solid transparent',
                          transition: 'all 0.3s ease',
                          boxShadow: currentIndex === idx ? '0 0 15px rgba(212, 175, 55, 0.5)' : 'none'
                        }}
                      >
                        <Image
                          src={img}
                          alt={`${room.name} ${idx + 1}`}
                          width={200}
                          height={100}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Section */}
                <div style={{
                  order: index % 2 === 0 ? 2 : 1,
                  padding: '0 20px'
                }}>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '10px',
                    fontWeight: '600'
                  }}>
                    {room.startingPrice}
                  </p>
                  <h2 style={{
                    fontSize: '2.2rem',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    color: '#333',
                    letterSpacing: '1px'
                  }}>
                    {room.name}
                  </h2>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666',
                    lineHeight: '1.8',
                    marginBottom: '30px'
                  }}>
                    {room.description}
                  </p>

                  {/* Room Features */}
                  <div style={{
                    marginBottom: '30px'
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '15px',
                      textTransform: 'uppercase'
                    }}>
                      ROOM FEATURES:
                    </p>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      {room.features.map((feature, idx) => (
                        <li key={idx} style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          marginBottom: '8px',
                          paddingLeft: '20px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: '#d4af37'
                          }}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* View Details Button */}
                  <button style={{
                    padding: '12px 30px',
                    background: '#8b7355',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#d4af37'}
                  onMouseLeave={(e) => e.target.style.background = '#8b7355'}
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes growTurn {
          0% {
            transform: scale(0.8) rotate(-5deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @media (max-width: 968px) {
          .room-row {
            grid-template-columns: 1fr !important;
          }
          .room-row > div {
            order: unset !important;
          }
          section h1 {
            font-size: 2rem !important;
          }
          section h2 {
            font-size: 1.6rem !important;
          }
        }
      `}</style>
    </>
  )
}

export default Rooms