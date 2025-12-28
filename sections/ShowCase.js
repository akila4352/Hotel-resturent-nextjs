import { showcase } from "@/assets/data/dummydata"
import { Card } from "@/components/common/Card"
import { Title, TitleSm } from "@/components/common/Title"
import React from "react"
import BlogHero from "@/components/BlogHero"
import Head from "next/head"

const seoTitle = "Nearby Attractions | Hotel Amore - Beach Resort in Balapitiya, Sri Lanka"
const seoDescription = "Discover exciting attractions and experiences near Hotel Amore, a luxury beachfront resort in Balapitiya, Sri Lanka. Explore Galle, Ambalangoda, and more."
const seoKeywords = "luxury beach resort, boutique hotel, romantic hotel, family-friendly hotel, quiet beach hotel, all-inclusive resort, hotel in srilanka, hotel in Balapitiya, hotel in Ambalangoda, hotel in Galle, beach hotel in srilanka, beach hotel in Balapitiya, beach hotel in Ambalangoda, beach hotel in Galle, resort in srilanka, resort in Balapitiya, resort in Ambalangoda, resort in Galle, beachfront hotel srilanka, beachfront hotel Balapitiya, beachfront hotel Ambalangoda, beachfront hotel Galle, seaside hotel srilanka, seaside hotel Balapitiya, seaside hotel Ambalangoda, seaside hotel Galle"

const ShowCase = () => {
  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/showcase" />
        <meta property="og:image" content="https://yourdomain.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="https://yourdomain.com/images/og-image.jpg" />
        <link rel="canonical" href="https://yourdomain.com/showcase" />
      </Head>
      <BlogHero
        videoUrl="https://media.istockphoto.com/id/1400261418/video/aerial-view-of-beautiful-galle-fort-and-lighthouse-in-sri-lanka.mp4?s=mp4-640x640-is&k=20&c=iCF1Z1x90bhv0qo5STge3-8EddbG0zAMNLweup8FY5k="
        title="AMORE HOTEL"
        subtitle="NEARBY PLACES"
        description="Discover exciting attractions and experiences just steps away from our hotel."
      />
      <section className='showcase bg-top'>
        <div className='container'>
         
          <br />
          <br /> 
          <div className='grid-3'>
            {showcase.map((item) => (
              // prefer the (misspelled) 'catgeory' field, fallback to title
              <Card data={item} key={item.id} caption={item.catgeory || item.category || item.title} />
            ))}
          </div>
          <div className='py btn'>
            <button className='secondary-button'>Explore Nearby</button>
          </div>
        </div>
      </section>
    </>
  )
}

export default ShowCase
