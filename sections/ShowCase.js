import { showcase } from "@/assets/data/dummydata"
import { Card } from "@/components/common/Card"
import { Title, TitleSm } from "@/components/common/Title"
import React from "react"
import BlogHero from "@/components/BlogHero"

const ShowCase = () => {
  return (
    <>
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
