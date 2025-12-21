import Rooms2 from "@/sections/Rooms2"
import Services from "@/sections/Services"
import Head from "next/head"
import React from "react"
import BlogHero from "@/components/BlogHero"

const rooms2 = () => {
  return (
    <>
      <Head>
        <title>AMORE</title>
      </Head>
      <BlogHero
        videoUrl="https://media.istockphoto.com/id/1472082399/video/modern-minimalist-living-room.mp4?s=mp4-640x640-is&k=20&c=5nm0quOhOSnWKLgGYNDKuvxtnCN6pJjpp5SAPGCHgx0="
        title="AMORE HOTEL"
        subtitle="ROOMS"
        description="Experience comfort and elegance in our beautifully designed rooms."
      />
      <Rooms2 />
    </>
  )
}

export default rooms2