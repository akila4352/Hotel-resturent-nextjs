import { roomdata /*, teamdata */ } from "@/assets/data/dummydata"
import { Card } from "@/components/common/Card"
import { Title, TitleSm } from "@/components/common/Title"
import React from "react"
import { useRouter } from "next/router"

// create a small repeating price palette for rooms (adjust as needed)
const defaultPrices = [24.99, 34.99, 54.99]

// derive a rooms export that reservation.js can import and include occupancy/AC metadata
export const rooms = roomdata.slice(0, 6).map((r, i) => ({
  id: r.id ?? `room-${i}`,
  title: r.title ?? `Room ${i + 1}`,
  price: r.price ?? defaultPrices[i % defaultPrices.length] ?? 34.99,
  img: (r.cover || "").replace(/^\.{2}\//, "/") || "/images/placeholder.png",
  ac: typeof r.ac === "boolean" ? r.ac : true,
  minAdults: Number.isFinite(r.minAdults) ? r.minAdults : 1,
  maxAdults: Number.isFinite(r.maxAdults) ? r.maxAdults : (r.maxAdults === 0 ? 0 : (r.maxAdults ?? 2)),
  maxChildren: Number.isFinite(r.maxChildren) ? r.maxChildren : (r.maxChildren === 0 ? 0 : (r.maxChildren ?? 1)),
  oneAdultRequiresChild: !!r.oneAdultRequiresChild,
}))

const Rooms = () => {
  const router = useRouter()
  const handleBookRoom = (r) => {
    // navigate to reservation with the selected room id so reservation page can pre-select it
    router.push({
      pathname: "/reservation",
      query: {
        room: r.id,
        // keep sensible defaults for guests (user can change on reservation page)
        adults: r.minAdults ?? 1,
        children: 0,
        rooms: 1,
      },
    })
  }

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
              <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Card data={item} caption={item.cuisine || item.dish || item.post} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleBookRoom(item)}
                    className="btn continue"
                    aria-label={`Book ${item.title}`}
                    style={{ padding: "8px 12px", borderRadius: 8 }}
                  >
                    Book this room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Rooms
