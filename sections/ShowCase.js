import { showcase } from "@/assets/data/dummydata"
import { Card } from "@/components/common/Card"
import { Title, TitleSm } from "@/components/common/Title"
import React from "react"

const ShowCase = () => {
  return (
    <>
      <section className='showcase bg-top'>
        <div className='container'>
          <div className='heading-title'>
            <TitleSm title='NEARBY PLACES' /> <br />
            <br />
            <Title title='Discover places near the hotel' className='title-bg' />
            {/* Short description about nearby attractions */}
            <p className="lead">
              Explore local attractions, tours and dining options just minutes from the hotel.
            </p>
          </div>
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
