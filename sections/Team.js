import { teamdata } from "@/assets/data/dummydata"
import { Card } from "@/components/common/Card"
import { Title, TitleSm } from "@/components/common/Title"
import React from "react"

const RestaurantShowcase = () => {
  return (
    <>
      <section className='agency bg-top'>
        <div className='container'>
          <div className='heading-title'>
            <TitleSm title='SRI LANKAN RESTAURANT SHOWCASE' /> <br />
            <br />
            <Title title='Taste authentic Sri Lankan flavors' className='title-bg' />
            {/* Short description for the showcase */}
            <p className="lead">
              Explore our curated selection of chefs and signature dishes highlighting Sri Lanka's rich culinary heritage.
            </p> 
          </div>
          <div className='grid-4 py'>
            {teamdata.map((item) => (
              // prefer a cuisine/dish field if available, otherwise fall back to item.post
              <Card data={item} key={item.id} caption={item.cuisine || item.dish || item.post} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default RestaurantShowcase
