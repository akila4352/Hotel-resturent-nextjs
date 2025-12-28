// components/Restaurant.jsx
"use client"
import React, { useState } from "react"
import Image from "next/image"
import { dishdata } from "@/assets/data/dummydata"
import Head from "next/head"

const seoTitle = "Restaurant | Hotel Amore - Beachfront Dining in Balapitiya, Sri Lanka"
const seoDescription = "Enjoy exquisite dining at Hotel Amore's beachfront restaurant in Balapitiya, Sri Lanka. Savor local and international cuisine in a stunning seaside setting."
const seoKeywords = "luxury beach resort, boutique hotel, romantic hotel, family-friendly hotel, quiet beach hotel, all-inclusive resort, hotel in srilanka, hotel in Balapitiya, hotel in Ambalangoda, hotel in Galle, beach hotel in srilanka, beach hotel in Balapitiya, beach hotel in Ambalangoda, beach hotel in Galle, resort in srilanka, resort in Balapitiya, resort in Ambalangoda, resort in Galle, beachfront hotel srilanka, beachfront hotel Balapitiya, beachfront hotel Ambalangoda, beachfront hotel Galle, seaside hotel srilanka, seaside hotel Balapitiya, seaside hotel Ambalangoda, seaside hotel Galle"

const Restaurant2 = () => {
  const [activeMenuTab, setActiveMenuTab] = useState("BREAKFAST")
  const [activeGalleryTab, setActiveGalleryTab] = useState("ALL")

  // Filter menu items based on active tab
  const filteredMenu = dishdata.filter(item => item.category === activeMenuTab)

  // Filter gallery items - fixed to properly handle DRINK category
  const filteredGallery = activeGalleryTab === "ALL" 
    ? dishdata 
    : dishdata.filter(item => item.category === activeGalleryTab)

  const menuTabs = [ 
    { name: "BREAKFAST", time: "08:00 AM - 10:00 AM" },
    { name: "LUNCH", time: "01:00 PM - 3:00 PM" }, // Fixed: was 01:00 AM
    { name: "DINNER", time: "08:00 PM - 10:00 PM" }, // Fixed: was 08:00 AM
    { name: "DRINK", time: "08:00 AM - 10:00 PM" }
  ]

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/restaurant" />
        <meta property="og:image" content="https://yourdomain.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="https://yourdomain.com/images/og-image.jpg" />
        <link rel="canonical" href="https://yourdomain.com/restaurant" />
      </Head>
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
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item) => (
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
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                No items available for this category
              </p>
            )}
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
            {['ALL', 'BREAKFAST', 'LUNCH', 'DINNER', 'DRINK'].map((tab) => (
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
            {filteredGallery.length > 0 ? (
              filteredGallery.map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    height: '180px',
                    cursor: 'pointer'
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={320}
                    height={200}
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
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px 0', gridColumn: '1 / -1' }}>
                No items available for this category
              </p>
            )}
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