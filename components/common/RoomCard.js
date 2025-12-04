// components/common/RoomCard.jsx
"use client"
import React, { useState } from "react"
import Image from "next/image"

export const RoomCard = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        cursor: 'pointer',
        height: '320px',      // reduced height (slimmer card)
        // width: '100%',        // responsive width within parent
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 0 }}>
        <Image 
          // use hover image when available
          src={isHovered && data.coverHover ? data.coverHover : data.cover} 
          alt={data.title}
          width={400}
          height={400}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.03)' : 'scale(1)', // smaller zoom for reduced height
            transition: 'transform 0.45s ease, filter 0.45s ease',
            filter: isHovered ? 'brightness(0.9)' : 'brightness(1)'
          }}
        />
        
        {/* Overlay - shown on hover */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',          // reduced padding to suit slimmer card
          zIndex: 3,
          pointerEvents: isHovered ? 'auto' : 'none',
          boxSizing: 'border-box'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '100%',
            width: '100%',
            padding: '0 0.5rem',
            // removed maxHeight and overflowY so no scrollbar appears
          }}>
            <h3 style={{
              fontSize: '1.15rem', // adjusted for reduced height
              fontWeight: 'bold',
              margin: '0 0 0.4rem 0',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              overflowWrap: 'break-word',
              wordBreak: 'break-word'
            }}>
              {data.title}
            </h3>
            
            <p style={{
              color: '#d4af37',
              fontSize: '1rem',
              marginBottom: '0.6rem'
            }}>
              ${data.price} <span style={{ fontSize: '0.8rem' }}>/ Per Night</span>
            </p>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#d1d5db',
              marginBottom: '1.25rem',
              lineHeight: '1.6',
              overflowWrap: 'break-word'
            }}>
              Cum sociis natoque penatibus et magnis dis part urient montes, nascetur ridiculus mus. Vestib ulum id ligula porta felis euis.
            </p>
            
            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem 1.5rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#9ca3af' }}>👤</span>
                <span>{data.capacity || "2 Person(s)"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#9ca3af' }}>📐</span>
                <span>{data.size || "30m2 / 323ft2"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#9ca3af' }}>👁️</span>
                <span>{data.view || "City View"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#9ca3af' }}>🛏️</span>
                <span>{data.bed || "Queen / Twin"}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button style={{
                border: '2px solid white',
                background: 'transparent',
                color: 'white',
                padding: '0.6rem 1.6rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
              }}>
                VIEW DETAIL
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Info - always visible */}
      {!isHovered && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          padding: '1rem', // reduced padding to match new card height
          textAlign: 'center',
          zIndex: 1 // keep bottom info below overlay
        }}>
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 'bold',
            marginBottom: '0.4rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            {data.title}
          </h3>
          <p style={{ color: '#d4af37', fontSize: '1rem' }}>
            ${data.price} <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>/ PER NIGHT</span>
          </p>
        </div>
      )}
      
      <style jsx>{`
        /* card should fill the grid cell provided by parent container */
        .room-card {
          display: block;
          width: 100%;
          margin: 0;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}