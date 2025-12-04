// components/Rooms.jsx
"use client"
import React, { useState } from "react"
import Image from "next/image"
import { roomsdata } from "@/assets/data/dummydata"

const Rooms2 = () => {
  const [expandedRoom, setExpandedRoom] = useState(null)

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
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>
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
          {roomsdata.map((room, index) => (
            <div
              key={room.id}
              style={{
                display: 'grid',
                gridTemplateColumns: index % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                gap: '50px',
                alignItems: 'center',
                marginBottom: '80px',
                flexDirection: index % 2 !== 0 ? 'row-reverse' : 'row'
              }}
            >
              {/* Image Section */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                height: '350px',
                order: index % 2 === 0 ? 1 : 2
              }}>
                <Image
                  src={room.image}
                  alt={room.name}
                  width={400}
                  height={350}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Content Section */}
              <div style={{
                order: index % 2 === 0 ? 2 : 1
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
                    Room Features:
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
          ))}
        </div>
      </section>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          section h1 {
            font-size: 2rem !important;
          }
          section h2 {
            font-size: 1.6rem !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

export default Rooms2