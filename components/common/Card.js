import Link from "next/link"
import { TitleSm } from "./Title"
import { HiOutlineArrowRight } from "react-icons/hi"
 
export const Card = ({ data = {}, caption, show, path }) => {
	// safe extraction with defaults
	const id = data?.id
	const href = path && id ? `${path}/${id}` : "#"
	const title = data?.title ?? ""
	const cover = data?.cover ?? ""
	// support both 'category' and misspelled 'catgeory'
	const category = data?.category ?? data?.catgeory ?? ""
	const date = data?.date ?? ""
	const desc = Array.isArray(data?.desc) ? data.desc : []

	// --- NEW: derive occupancy / AC metadata if present ---
	const hasOccupancy =
		typeof data?.minAdults !== "undefined" ||
		typeof data?.maxAdults !== "undefined" ||
		typeof data?.maxChildren !== "undefined" ||
		typeof data?.oneAdultRequiresChild !== "undefined" ||
		typeof data?.ac !== "undefined"

	let occupancyText = ""
	if (hasOccupancy) {
		// adults part
		const minA = Number.isFinite(data?.minAdults) ? data.minAdults : null
		const maxA = Number.isFinite(data?.maxAdults) ? data.maxAdults : null
		let adultsPart = ""
		if (minA != null && maxA != null) {
			adultsPart = minA === maxA ? `${minA} adult${minA > 1 ? "s" : ""}` : `${minA}–${maxA} adults`
		} else if (minA != null) {
			adultsPart = `${minA}+ adults`
		} else if (maxA != null) {
			adultsPart = `Up to ${maxA} adults`
		}

		// children part
		const maxC = Number.isFinite(data?.maxChildren) ? data.maxChildren : null
		let childrenPart = ""
		if (maxC != null) {
			childrenPart = maxC === 0 ? "no children" : `up to ${maxC} child${maxC > 1 ? "ren" : ""}`
		}

		// special rule
		const special = data?.oneAdultRequiresChild ? "1 adult requires 1 child" : ""

		// AC/Non-AC
		const acPart = typeof data?.ac === "boolean" ? (data.ac ? "AC" : "Non-AC") : ""

		// join parts, skip empty
		occupancyText = [adultsPart, childrenPart, special, acPart].filter(Boolean).join(" · ")
	}
	// --- END NEW ---

	return (
		<>
			<div className='card'>
				<div className='card-img'>
					{cover ? (
						<img src={cover} alt={title || "cover image"} />
					) : (
						<img src='/placeholder.png' alt={title || "placeholder"} />
					)}
				</div>
				<div className='card-details'>
					<Link href={href} className='title-link'>
						<TitleSm title={title} />
					</Link>

					{/* --- NEW: render occupancy metadata when available --- */}
					{occupancyText && (
						<div className="card-meta" style={{ marginTop: 6, color: "#555", fontSize: 13, fontWeight: 600 }}>
							{occupancyText}
						</div>
					)}
					{/* --- END NEW --- */}

					{show && desc.length > 0 && (
						<ul>
							{desc.map((text, i) => (
								<li key={i}> - {text?.text ?? text}</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</>
	)
}
