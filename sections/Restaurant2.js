// components/Restaurant.jsx
"use client"
import React, { useState } from "react"
import Image from "next/image"
import { dishdata } from "@/assets/data/dummydata"

const Restaurant2 = () => {
  const [activeMenuTab, setActiveMenuTab] = useState("BREAKFAST")
  const [activeGalleryTab, setActiveGalleryTab] = useState("ALL")

  // Filter menu items based on active tab
  const filteredMenu = dishdata.filter(item => item.category === activeMenuTab)

  // Filter gallery items
  const filteredGallery = activeGalleryTab === "ALL" 
    ? dishdata 
    : dishdata.filter(item => item.category === activeGalleryTab)

  const menuTabs = [
    { name: "BREAKFAST", time: "08:00 AM - 10:00 AM" },
    { name: "LUNCH", time: "01:00 AM - 3:00 PM" },
    { name: "DINNER", time: "08:00 AM - 10:00 PM" },
    { name: "DRINK", time: "08:00 AM - 10:00 PM" }
  ]

  return (
    <>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '300px', // reduced hero height
        // use explicit background properties so it's scoped to this section only
        backgroundImage: "url('/images/background.jpg')",
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
            OUR RESTAURANT
          </h1>
          <p style={{
            fontSize: '1.1rem',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Hotel Amore has an exotic restaurant. Our exotic restaurant offers a traditional menu where you can choose between Sri Lankan or English Breakfast.
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section style={{ padding: '60px 0', background: 'white' }}>
        <div className='container'>
          {/* Menu Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '60px',
            marginBottom: '50px',
            flexWrap: 'wrap'
          }}>
            {menuTabs.map((tab) => (
              <div
                key={tab.name}
                onClick={() => setActiveMenuTab(tab.name)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 10px',
                  background: activeMenuTab === tab.name ? '#d4af37' : '#f5f5f5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{ fontSize: '28px' }}>
                    {tab.name === 'BREAKFAST' && '🍳'}
                    {tab.name === 'LUNCH' && '🍽️'}
                    {tab.name === 'DINNER' && '🍴'}
                    {tab.name === 'DRINK' && '🍹'}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: activeMenuTab === tab.name ? '#d4af37' : '#333'
                }}>
                  {tab.name}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#999'
                }}>
                  {tab.time}
                </p>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '25px 0',
                  borderBottom: '1px solid #e5e5e5'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      width: '40px',
                      height: '40px',
                      background: '#d4af37',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {item.icon || '🍽️'}
                    </span>
                    <h4 style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textTransform: 'uppercase'
                    }}>
                      {item.name}
                    </h4>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    lineHeight: '1.6',
                    marginLeft: '55px'
                  }}>
                    {item.description}
                  </p>
                </div>
                <div style={{
                  textAlign: 'right',
                  minWidth: '100px'
                }}>
                  <p style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#d4af37',
                    marginBottom: '5px'
                  }}>
                    ${item.price}
                  </p>
                  {item.oldPrice && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#999',
                      textDecoration: 'line-through'
                    }}>
                      ${item.oldPrice}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section style={{ padding: '60px 0', background: '#f9f9f9' }}>
        <div className='container'>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '40px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            GALLERY RESTAURANT
          </h2>

          {/* Gallery Filter Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            {['ALL', 'DINNER', 'LUNCH', 'DRINK'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveGalleryTab(tab)}
                style={{
                  padding: '10px 25px',
                  background: activeGalleryTab === tab ? '#d4af37' : 'white',
                  color: activeGalleryTab === tab ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeGalleryTab === tab ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  height: '180px', // reduced gallery tile height
                  cursor: 'pointer'
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={320}   // reduced intrinsic width
                  height={200}  // reduced intrinsic height
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '40px 20px 20px',
                  color: 'white'
                }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    marginBottom: '5px'
                  }}>
                    {item.name}
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#d4af37'
                  }}>
                    ${item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          section h1 {
            font-size: 2rem !important;
          }
          section h2 {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </>
  )
}

export default Restaurant2