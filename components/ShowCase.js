import React, { useEffect, useRef } from "react"
import { FaShip, FaUmbrellaBeach } from "react-icons/fa"
import { GiBoatFishing, GiElephant } from "react-icons/gi"
import { Title } from "./common/Title"
import { showcase } from "@/assets/data/dummydata"
import { Card } from "./common/Card"
import Link from "next/link"
import { HiOutlineArrowRight } from "react-icons/hi"

// choose an icon based on category text
const getIcon = (cat) => {
  if (!cat) return null
  const c = cat.toLowerCase()
  if (c.includes("lake")) return <GiBoatFishing size={28} />
  if (c.includes("sea")) return <FaShip size={28} />
  if (c.includes("beach")) return <FaUmbrellaBeach size={28} />
  if (c.includes("safari")) return <GiElephant size={28} />
  return <FaShip size={24} />
}

const ShowCase = () => {
  // add refs for each card wrapper
  const cardRefs = useRef([])

  useEffect(() => {
    // run client-side after mount
    cardRefs.current.forEach((wrap) => {
      if (!wrap) return
      const cat = wrap.dataset.cat?.trim()
      if (!cat) return

      // search typical text elements inside the Card but exclude our overlay
      const candidates = wrap.querySelectorAll(
        "h1,h2,h3,h4,h5,h6,span,p,strong,small,a,figcaption"
      )
      candidates.forEach((el) => {
        if (!el) return
        // skip elements inside our overlay container
        if (el.closest(".img-overlay")) return
        const text = (el.textContent || "").trim()
        if (!text) return
        // if element contains the category text, hide it
        if (text.toLowerCase().includes(cat.toLowerCase())) {
          el.style.display = "none"
          el.style.visibility = "hidden"
        }
      })
    })
  }, [])

  return (
    <>
      <section className='showcase'>
        <div className='container'>
          <div className='heading-title'>
            <Title title='Explore Our Destinations' />
          </div>

          <div className='hero-content grid-3 py'>
            {showcase.map((item, idx) => (
              <div
                className="card-wrap"
                key={item.id}
                data-cat={item.catgeory}
                ref={(el) => (cardRefs.current[idx] = el)}
              >
                <Card data={item} />
                <div className="img-overlay" aria-hidden>
                  <div className="overlay-icon" aria-hidden>
                    {getIcon(item.catgeory)}
                  </div>
                  <h3 className="overlay-title">{item.title}</h3>
                  <div className="overlay-sub">{item.catgeory}</div>
                  <div className="overlay-more">
                    MORE INFO <HiOutlineArrowRight />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='card links'>
       
          </div>
        </div>

        <style jsx>{`
          .hero-content { /* keep existing grid behavior */ }

          /* container that keeps Card unchanged but allows overlay */
          .card-wrap {
            position: relative;
            overflow: hidden; /* clip any card shadow/border */
            border-radius: 14px; /* keep rounded corners consistent */
          }

          /* remove card borders/shadows/background coming from the Card component */
          .card-wrap :global(.card) {
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            background-color: transparent !important;
            outline: none !important;
          }
          
          /* guard for common inner image/container classes */
          .card-wrap :global(.card .card-body),
          .card-wrap :global(.card .card-image),
          .card-wrap :global(.card .card-img),
          .card-wrap :global(.card .card-footer) {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }

          .overlay-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.28);
            border-radius: 999px;
            color: #fff;
            pointer-events: none;
          }

          .overlay-icon :global(svg) {
            display: block;
          }

          /* hide Card's original below-image headings and common metadata */
          .card-wrap :global(.card h1),
          .card-wrap :global(.card h2),
          .card-wrap :global(.card h3),
          .card-wrap :global(.card h4),
          .card-wrap :global(.card h5),
          .card-wrap :global(.card .title),
          .card-wrap :global(.card .card-title),
          .card-wrap :global(.card .card-heading),
          .card-wrap :global(.card .heading),
          .card-wrap :global(.card .subtitle),
          .card-wrap :global(.card .category),
          .card-wrap :global(.card .catgeory),
          .card-wrap :global(.card .meta),
          .card-wrap :global(.card .details),
          .card-wrap :global(.card .info),
          .card-wrap :global(.card .post),
          .card-wrap :global(.card .desc),
          .card-wrap :global(.card p) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* overlay sits over the card image - pointer-events none so underlying links still work */
          .img-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 28px;
            color: #fff;
            pointer-events: none;
          }

          .overlay-title {
            margin: 8px 12px 6px;
            font-size: 28px;
            line-height: 1.05;
            font-weight: 600;
            text-shadow: 0 6px 18px rgba(0,0,0,0.6);
          }

          /* category and more are hidden by default and appear on hover */
          .overlay-sub,
          .overlay-more {
            opacity: 0;
            transform: translateY(6px);
            transition: opacity 180ms ease, transform 180ms ease;
            pointer-events: none;
          }

          .card-wrap:hover .overlay-sub,
          .card-wrap:hover .overlay-more {
            opacity: 1;
            transform: translateY(0);
          }

          .overlay-sub {
            font-size: 12px;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            font-weight: 700;
            color: rgba(255,255,255,0.92);
            margin-bottom: 10px;
          }

          .overlay-more {
            margin-top: 6px;
            display: inline-flex;
            gap: 8px;
            align-items: center;
            font-weight: 700;
            letter-spacing: 1.6px;
            border-top: 1px solid rgba(255,255,255,0.18);
            padding-top: 10px;
          }

          /* ensure overlay text is readable depending on image - slight darken */
          .card-wrap::before {
            content: "";
            position: absolute;
            inset: 0;
            /* much lighter gradient to remove the visible dark band while keeping contrast */
            background: linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.12));
            pointer-events: none;
            border-radius: inherit;
          }

          @media (max-width: 640px) {
            .overlay-title { font-size: 18px; }
            .img-overlay { padding: 16px; }
            /* on small screens show category by default */
            .overlay-sub,
            .overlay-more { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    </>
  )
}

export default ShowCase
