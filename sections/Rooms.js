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
  // type for filtering: prefer explicit r.type, otherwise infer from title (Single/Double/Triple), fallback to "double"
  type: (() => {
    if (r.type) return String(r.type).toLowerCase()
    const title = String(r.title || "").toLowerCase()
    if (title.includes("triple")) return "triple"
    if (title.includes("single")) return "single"
    if (title.includes("double")) return "double"
    // fallback: use metaType or default to double
    if (r.metaType) return String(r.metaType).toLowerCase()
    return "double"
  })(),
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
              // add a small wrapper class so styles target only these room cards
              <div key={item.id} className="room-item" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

      {/* Scoped styles to make all room images the same size */}
      <style jsx>{`
        /* normalize image look inside our room items (catch img, picture > img, any nested img) */
        .grid-4 .room-item :global(img),
        .grid-4 .room-item :global(picture img),
        .grid-4 .room-item :global(.card img) {
          width: 100% !important;
          height: 240px !important; /* fixed height — adjust as needed */
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          border-radius: 20px !important; /* consistent rounded corners */
        }

        /* Ensure the Card's wrapper doesn't add a conflicting radius or clipping */
        .grid-4 .room-item :global(.card) {
          border-radius: 0 !important;
          overflow: visible !important;
        }

        /* Responsive: reduce height on smaller screens */
        @media (max-width: 1024px) {
          .grid-4 .room-item :global(img),
          .grid-4 .room-item :global(picture img),
          .grid-4 .room-item :global(.card img) {
            height: 200px !important;
          }
        }
        @media (max-width: 768px) {
          .grid-4 .room-item :global(img),
          .grid-4 .room-item :global(picture img),
          .grid-4 .room-item :global(.card img) {
            height: 180px !important;
          }
        }
        @media (max-width: 480px) {
          .grid-4 .room-item :global(img),
          .grid-4 .room-item :global(picture img),
          .grid-4 .room-item :global(.card img) {
            height: 140px !important;
          }
        }
      `}</style>
    </>
  )
}

export default Rooms
