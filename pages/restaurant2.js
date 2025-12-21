import Head from "next/head"
import Restaurant2 from "@/sections/Restaurant2"
import BlogHero from "@/components/BlogHero"

export default function RestaurantPage() {
  return (
    <>
      <Head>
        <title>AMORE - Restaurant</title>
      </Head>
      <BlogHero
        videoUrl="https://media.istockphoto.com/id/1370288288/video/empty-tables-and-chairs-in-restaurant-stock-video.mp4?s=mp4-640x640-is&k=20&c=vyxtsnXtrk9OIt9A9JoXGdUSogkhQ5IrL1dfG6pOCzE="
        title="AMORE HOTEL"
        subtitle="RESTAURANT"
        description="Enjoy gourmet cuisine and a relaxing atmosphere in our restaurant."
      />
      <Restaurant2 />
    </>
  )
}