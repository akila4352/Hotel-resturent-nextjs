// components/Contact.jsx
"use client"

import React, { useRef, useEffect } from "react"
import Head from "next/head"
import BlogHero from "@/components/BlogHero"

const seoTitle = "Contact Us | Hotel Amore - Beach Resort in Balapitiya, Sri Lanka"
const seoDescription = "Contact Hotel Amore for reservations, inquiries, and more. Located in Balapitiya, Sri Lanka, our beachfront resort is ready to welcome you."
const seoKeywords = "luxury beach resort, boutique hotel, romantic hotel, family-friendly hotel, quiet beach hotel, all-inclusive resort, hotel in srilanka, hotel in Balapitiya, hotel in Ambalangoda, hotel in Galle, beach hotel in srilanka, beach hotel in Balapitiya, beach hotel in Ambalangoda, beach hotel in Galle, resort in srilanka, resort in Balapitiya, resort in Ambalangoda, resort in Galle, beachfront hotel srilanka, beachfront hotel Balapitiya, beachfront hotel Ambalangoda, beachfront hotel Galle, seaside hotel srilanka, seaside hotel Balapitiya, seaside hotel Ambalangoda, seaside hotel Galle"

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
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/contact" />
        <meta property="og:image" content="https://yourdomain.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="https://yourdomain.com/images/og-image.jpg" />
        <link rel="canonical" href="https://yourdomain.com/contact" />
      </Head>
      <BlogHero
        videoUrl="https://media.istockphoto.com/id/1194337503/video/aerial-view-of-clear-turquoise-sea-and-waves.mp4?s=mp4-640x640-is&k=20&c=9bXAggRhoV_cO7uqdXF8cCUn-d1gTDg0hzjbG3Z8XoU="
        title="AMORE HOTEL"
        subtitle="CONTACT"
        description="Get in touch with us for reservations, inquiries, and more"
      />
      {/* ...existing code or additional contact page content... */}
    </>
  )
}

export default Blogs