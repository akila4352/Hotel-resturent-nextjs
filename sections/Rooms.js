import { roomdata, teamdata } from "@/assets/data/dummydata"
import { Card } from "@/components/common/Card"
import { Title, TitleSm } from "@/components/common/Title"
import React from "react"

const Rooms = () => {
  return (
    <>
      <section className='agency bg-top'>
        <div className='container'>
          <div className='heading-title'>
            <TitleSm title='OUR ROOMS' /> <br />
            <br />
            <Title title='Comfort & Elegance' className='title-bg' />
            {/* Short description for the rooms page */}
            <p className="lead">
              Discover our carefully designed rooms and suites, offering comfort, modern amenities, and exceptional service for a relaxing stay.
            </p>
          </div>
          <div className='grid-4 py'>
            {roomdata.map((item) => (
              // prefer a cuisine/dish field if available, otherwise fall back to item.post
              <Card data={item} key={item.id} caption={item.cuisine || item.dish || item.post} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Rooms
