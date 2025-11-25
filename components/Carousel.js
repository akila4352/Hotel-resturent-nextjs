import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Carousel({ items = [] }) {
	const router = useRouter();
	const sliderRef = useRef(null);
	const [mounted, setMounted] = useState(false);
	// track image load status per slide: 'loading' | 'loaded' | 'error'
	const [imgStatus, setImgStatus] = useState({});

	// control autoplay so carousel won't slide during the caption entrance
	const [autoplayEnabled, setAutoplayEnabled] = useState(false);
	// track active slide to trigger caption animation
	const [activeIndex, setActiveIndex] = useState(0);
	// quick toggle to restart caption animation on slide change
	const [captionKey, setCaptionKey] = useState(0);

	// default slides (use public/ folder paths)
	const defaultSlides = [
		{
			img: "/images/b2.jpg",
			title: "Hotel Amore",
			subtitle: "Relax, Dine & Rejuvenate",
			btn1: "Book Now",
			btn2: "Learn More",
			navigatePath: "/",
		},
		{
			img: "/images/b3.jpg",	
			title: "Seaside Dining",
			subtitle: "Fresh local flavors",
			btn1: "Reserve",
			btn2: "View Menu",
			navigatePath: "/menu",
		},
	];

	const slides = items && items.length ? items : defaultSlides;

	// preload images client-side and update status
	useEffect(() => {
		if (!mounted) return;
		slides.forEach((s, idx) => {
			if (!s || !s.img) {
				setImgStatus((prev) => ({ ...prev, [idx]: "error" }));
				return;
			}
			const img = new window.Image();
			img.src = s.img;
			setImgStatus((prev) => ({ ...prev, [idx]: "loading" }));
			img.onload = () => setImgStatus((prev) => ({ ...prev, [idx]: "loaded" }));
			img.onerror = () => setImgStatus((prev) => ({ ...prev, [idx]: "error" }));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mounted, JSON.stringify(slides.map((s) => s.img))]);

	useEffect(() => {
		// mark mounted so we only require slick on client
		setMounted(true);
		// load slick css on client
		if (typeof window !== "undefined") {
			require("slick-carousel/slick/slick.css");
			require("slick-carousel/slick/slick-theme.css");
		}
		// start autoplay enabled after mount
		const t = setTimeout(() => setAutoplayEnabled(true), 500);
		return () => clearTimeout(t);
	}, []);

	// pause autoplay briefly when component first shows (avoid jump)
	useEffect(() => {
		if (!mounted) return;
		// ensure autoplay controlled state applied
		setAutoplayEnabled((v) => v);
	}, [mounted]);

	// react-slick navigation guards
	const next = () => {
		if (sliderRef.current && sliderRef.current.slickNext) sliderRef.current.slickNext();
	};
	const previous = () => {
		if (sliderRef.current && sliderRef.current.slickPrev) sliderRef.current.slickPrev();
	};

	// settings include callbacks to manage caption animations
	const settings = {
		dots: false,
		infinite: true,
		speed: 900,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: autoplayEnabled,
		autoplaySpeed: 6000,
		arrows: false,
		beforeChange: (_, next) => {
			// disable autoplay while transitioning captions
			setAutoplayEnabled(false);
			// prepare caption restart
			setCaptionKey((k) => k + 1);
		},
		afterChange: (index) => {
			setActiveIndex(index);
			// small delay then re-enable autoplay
			setTimeout(() => setAutoplayEnabled(true), 600);
		},
		responsive: [
			{ breakpoint: 1024, settings: { slidesToShow: 1 } },
			{ breakpoint: 768, settings: { slidesToShow: 1 } },
			{ breakpoint: 480, settings: { slidesToShow: 1 } },
		],
	};

	// small inline SVG fallback (data URI) to use when img fails
	const svgFallback = encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='#0f1720'/><text x='50%' y='50%' font-size='36' fill='#ffffff' text-anchor='middle' dominant-baseline='middle'>Image unavailable</text></svg>`
	);
	const fallbackDataUri = `data:image/svg+xml;charset=utf-8,${svgFallback}`;

	// SSR fallback: render first slide statically with overlay
	if (!mounted) {
		const first = slides[0] || {};
		return (
			<div
				className="carousel-wrapper"
				style={{ position: "relative", top: 0, left: 0, width: "100%", height: "min(100vh, 720px)", zIndex: 0 }}
			>
				<div className="slide-item" style={{ position: "relative", width: "100%", height: "min(100vh, 720px)" }}>
					{first.img && (
						<div
							style={{
								width: "100%",
								height: "100%",
								backgroundImage: `url(${first.img})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								filter: "brightness(1.02)",
							}}
						/>
					)}
					<div className="hero-overlay hero-overlay-ssr" aria-hidden>
						<h1 className="hero-title">{first.title || "Welcome to Amore Hotel"}</h1>
						<p className="hero-sub">{first.subtitle || "Relax, Dine & Rejuvenate"}</p>
					</div>
				</div>
			</div>
		);
	}

	// client-side: require react-slick after mount
	/* eslint-disable global-require */
	const Slider = require("react-slick").default;
	/* eslint-enable global-require */

	// parallax handler: set CSS custom properties for child transforms
	function handleMouseMove(e) {
		const el = e.currentTarget;
		const rect = el.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
		const py = (e.clientY - rect.top) / rect.height - 0.5;
		el.style.setProperty("--tx", `${px * 10}px`); // image translate
		el.style.setProperty("--ty", `${py * 8}px`);
		el.style.setProperty("--ox", `${-px * 6}px`); // overlay parallax
		el.style.setProperty("--oy", `${-py * 6}px`);
	}

	function handleMouseLeave(e) {
		const el = e.currentTarget;
		el.style.setProperty("--tx", `0px`);
		el.style.setProperty("--ty", `0px`);
		el.style.setProperty("--ox", `0px`);
		el.style.setProperty("--oy", `0px`);
	}

	// open modal for specific slide
	// function openBookingForSlide(slide) {
	// 	setBookingForm((prev) => ({
	// 		...prev,
	// 		destination: slide?.title || "Hotel Amore",
	// 		// reset other fields but keep dates
	// 		name: "",
	// 		email: "",
	// 		contact: "",
	// 	}));
	// 	setShowBookingModal(true);
	// }

	// const handleBookingChange = (e) => {
	// 	const { name, value } = e.target;
	// 	setBookingForm((prev) => ({ ...prev, [name]: value }));
	// };

	// const handleBookingSubmit = async (e) => {
	// 	e.preventDefault();
	// 	setSubmittingBooking(true);
	// 	try {
	// 		// push to Realtime DB
	// 		await push(dbRef(rtdb, "hotelBookings"), {
	// 			...bookingForm,
	// 			createdAt: new Date().toISOString(),
	// 			timestamp: Date.now(),
	// 		});

	// 		alert("Booking request received. Our team will contact you soon.");
	// 		setShowBookingModal(false);
	// 		setSubmittingBooking(false);
	// 	} catch (err) {
	// 		console.error(err);
	// 		alert("Failed to submit booking. Please try again.");
	// 		setSubmittingBooking(false);
	// 	}
	// };

	// settings include callbacks to manage caption animations
	const sliderSettings = {
		dots: false,
		infinite: true,
		speed: 900,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: autoplayEnabled,
		autoplaySpeed: 6000,
		arrows: false,
		beforeChange: (_, next) => {
			// disable autoplay while transitioning captions
			setAutoplayEnabled(false);
			// prepare caption restart
			setCaptionKey((k) => k + 1);
		},
		afterChange: (index) => {
			setActiveIndex(index);
			// small delay then re-enable autoplay
			setTimeout(() => setAutoplayEnabled(true), 600);
		},
		responsive: [
			{ breakpoint: 1024, settings: { slidesToShow: 1 } },
			{ breakpoint: 768, settings: { slidesToShow: 1 } },
			{ breakpoint: 480, settings: { slidesToShow: 1 } },
		],
	};

	return (
		<div
			className="carousel-wrapper"
			style={{ position: "relative", top: 0, left: 0, width: "100%", height: "min(100vh, 720px)", zIndex: 0 }}
		>
			<div id="header-carousel" className="carousel slide" style={{ height: "min(100vh, 720px)", width: "100%" }}>
				<div className="carousel-inner" style={{ height: "100%" }}>
					<Slider ref={sliderRef} {...sliderSettings}>
						{slides.map((val, index) => {
							const status = imgStatus[index];
							const bgUrl = status === "error" ? fallbackDataUri : val.img;
							const isActive = index === activeIndex;
							return (
								<div
									className="slide-item"
									key={index}
									onMouseMove={handleMouseMove}
									onMouseLeave={handleMouseLeave}
									style={{ position: "relative", width: "100%", height: "min(100vh, 720px)" }}
								>
									{/* invisible preloader img */}
									<img
										src={val.img}
										alt={val.title || "Hotel Amore"}
										style={{ display: "none" }}
										onLoad={() => setImgStatus((prev) => ({ ...prev, [index]: "loaded" }))}
										onError={() => setImgStatus((prev) => ({ ...prev, [index]: "error" }))}
									/>

									{/* Visible image element with Ken Burns + parallax */}
									<div className={`slide-bg ${isActive ? "active" : ""}`}>
										<img
											src={bgUrl}
											alt={val.title || ""}
											onError={(e) => {
												if (e && e.currentTarget) e.currentTarget.src = fallbackDataUri;
												setImgStatus((prev) => ({ ...prev, [index]: "error" }));
											}}
											style={{
												width: "110%", // larger to allow parallax + zoom edges
												height: "110%" /* changed from fixed vh to % so it scales with container */,
												objectFit: "cover",
												display: "block",
												position: "absolute",
												left: "50%",
												top: "50%",
												transform: `translate(-50%, -50%) translate(var(--tx, 0), var(--ty, 0)) scale(${isActive ? 1.08 : 1.02})`,
												transition: "transform 1.2s ease-out",
												filter: "brightness(1.02)",
											}}
										/>
										{/* animated decorative shapes */}
										<div className="shape shape-1" aria-hidden />
										<div className="shape shape-2" aria-hidden />
									</div>

									{/* overlay caption (animated entrance on slide change) */}
									<div
										className={`hero-overlay ${isActive ? "visible" : ""}`}
										style={{
											transform: `translate(var(--ox, 0), var(--oy, 0))`,
										}}
										aria-hidden
										key={captionKey + "-" + index}
									>
										<h1 className="hero-title">{val.title}</h1>
										<p className="hero-sub">{val.subtitle}</p>
									</div>
								</div>
							);
						})}
					</Slider>
				</div>

				{/* Prev / Next (disabled while autoplay toggled off) */}
				<button
					onClick={() => previous()}
					aria-label="Previous slide"
					style={{
						position: "absolute",
						top: "50%",
						left: 20,
						transform: "translateY(-50%)",
						zIndex: 10,
						background: "rgba(0,0,0,0.45)",
						border: "none",
						borderRadius: "50%",
						width: 44,
						height: 44,
						color: "#fff",
						cursor: "pointer",
					}}
				>
					&#10094;
				</button>

				<button
					onClick={() => next()}
					aria-label="Next slide"
					style={{
						position: "absolute",
						top: "50%",
						right: 20,
						transform: "translateY(-50%)",
						zIndex: 10,
						background: "rgba(0,0,0,0.45)",
						border: "none",
						borderRadius: "50%",
						width: 44,
						height: 44,
						color: "#fff",
						cursor: "pointer",
					}}
				>
					&#10095;
				</button>
			</div>

			{/* scoped styles for animation, Ken-Burns, parallax and caption */}
			<style jsx>{`
				.carousel-wrapper { overflow: hidden; }
				.slide-item { --tx: 0px; --ty: 0px; --ox: 0px; --oy: 0px; height: 100vh; position: relative; overflow: hidden; }
				.slide-bg { position: absolute; inset: 0; overflow: hidden; }
				.slide-bg img { will-change: transform; }
 
				/* decorative floating shapes */
				.shape { position: absolute; border-radius: 50%; opacity: 0.12; filter: blur(6px); pointer-events: none; }
				.shape-1 { width: 220px; height: 220px; background: radial-gradient(circle at 30% 30%, #ff7a59, transparent 40%); left: -60px; top: 10%; animation: floatSlow 8s ease-in-out infinite; transform: translateZ(0); }
				.shape-2 { width: 160px; height: 160px; background: radial-gradient(circle at 60% 60%, #2fb0ff, transparent 40%); right: -50px; bottom: 12%; animation: floatSlow 10s ease-in-out infinite reverse; transform: translateZ(0); }
				@keyframes floatSlow { 0% { transform: translateY(0); } 50% { transform: translateY(18px); } 100% { transform: translateY(0); } }

				/* overlay caption */
				/* center overlay, constrain width and add horizontal padding so text always wraps */
				.hero-overlay {
					position: absolute;
					left: 40%;
					top: 45%; /* moved up from 50% to 45% to raise the text slightly */
					transform: translate(-50%, -50%);
					text-align: center;
					color: #fff;
					z-index: 6;
					width: min(980px, 80%); /* smaller max width so text doesn't reach edges */
					padding: 0 20px;       /* ensure breathing room on narrow viewports */
					box-sizing: border-box;
					pointer-events: none;
					opacity: 0;
					transition: opacity 600ms ease, transform 600ms ease;
				}
				.hero-overlay.visible { 
					opacity: 1; 
					pointer-events: auto; /* <- keep so overlay remains interactive if needed */
				}
				/* responsive, clamped font size so it scales and wraps nicely */
				.hero-title {
					font-size: clamp(28px, 5.5vw, 56px);
					line-height: 1.02;
					margin: 0 0 10px;
					font-weight: 800;
					text-shadow: 0 18px 48px rgba(0,0,0,0.6);
					transform: translateY(6px);
					transition: transform 650ms cubic-bezier(.2,.9,.3,1), opacity 600ms;
					opacity: 0;
					white-space: normal;       /* ensure wrapping */
					word-break: break-word;    /* break long words if needed */
				}
				.hero-overlay.visible .hero-title { opacity: 1; transform: translateY(0); }
				.hero-sub { margin: 0 auto 18px; color: rgba(255,255,255,0.92); font-size: 16px; letter-spacing: 0.6px; opacity: 0; transform: translateY(6px); transition: transform 700ms 80ms, opacity 700ms 80ms; }
				.hero-overlay.visible .hero-sub { opacity: 1; transform: translateY(0); }

				.hero-cta { display: inline-flex; gap: 12px; margin-top: 12px; opacity: 0; transform: translateY(6px); transition: opacity 800ms 160ms, transform 800ms 160ms; }
				.hero-overlay.visible .hero-cta { opacity: 1; transform: translateY(0); }

				.btn-primary { background: linear-gradient(90deg,#ff7a59,#ffbf69); color: #0b1220; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; pointer-events: auto; }
				.btn-ghost { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 8px; cursor: pointer; pointer-events: auto; }

				/* responsive */
				@media (max-width: 900px) {
					/* Fix typo and update styles for small screens:
					   - make title wrap and allow explicit <br/>
					   - move overlay to left, align text left, and reduce width for better layout */
					.hero-title { font-size: clamp(20px, 6.5vw, 34px); padding: 12px 16px; white-space: normal; word-break: break-word; }
					.hero-title br { display: block; line-height: 1.05; } /* if markup includes <br/> it will act as a break */
					.hero-sub { font-size: 14px; text-align: left; margin-left: 0; }
					.shape-1, .shape-2 { display: none; }
					.hero-overlay { top: 42%; left: 12%; transform: translate(0, -50%); text-align: left; width: 76%; padding: 0 8px; }
				}
			`}</style>
		</div>
	);
}
