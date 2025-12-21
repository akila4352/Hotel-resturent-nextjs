// components/Contact.jsx
"use client"

import React, { useRef, useEffect } from "react"
import BlogHero from "@/components/BlogHero"

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