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
					{caption && (
						<Link href={href}>
							{caption} <HiOutlineArrowRight className='link-icon' />
						</Link>
					)}
					<div className='flex'>
						<span>{category}</span> {date && <span> / {date}</span>}
					</div>

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
