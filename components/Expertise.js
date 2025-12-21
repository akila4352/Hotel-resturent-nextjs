import React from "react"
import { Title } from "./common/Title"
import { expertise } from "@/assets/data/dummydata"
import { RoomCard } from "./common/RoomCard"

const Expertise = () => {
  return ( 
    <>
      <section className='expertise'>
        <div className='container'>
          <div className='heading-title'>
            <Title title='Our Rooms' />
            <p>Our Beautiful Bedrooms are more than just a place to lay your head down. They are also meant to serve as your home away from home. View our cozy accommodations and roomy suites.</p>
          </div>
          <div className='hero-content rooms-grid'>
            {expertise.map((item) => (
              <RoomCard data={item} key={item.id} caption='Book now' />
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .rooms-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (max-width: 600px) {
          .rooms-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>
    </>
  )
}

export default Expertise
