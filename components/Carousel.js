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
		{ img: "/images/b1.jpg", title: "Hotel Amore", subtitle: "Relax, Dine & Rejuvenate", btn1: "Book Now", btn2: "Learn More", navigatePath: "/" },
		{ img: "/images/b3.jpg", title: "Elegant Lobby", subtitle: "Warm welcome", btn1: "Explore", btn2: "Details", navigatePath: "/" },
		{ img: "/images/b4.jpeg", title: "Fine Dining", subtitle: "Fresh local flavors", btn1: "Reserve", btn2: "Menu", navigatePath: "/menu" },
		{ img: "/images/b5.jpg", title: "Cozy Rooms", subtitle: "Restful nights", btn1: "Book", btn2: "Rooms", navigatePath: "/rooms" },
		{ img: "/images/b6.jpg", title: "Poolside", subtitle: "Relax & unwind", btn1: "Reserve", btn2: "Gallery", navigatePath: "/amenities" },
		{ img: "/images/b7.jpg", title: "Nearby Attractions", subtitle: "Explore the area", btn1: "Discover", btn2: "Map", navigatePath: "/showcase" },
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
										{/* optional small script / brand line (provide val.brand in slide objects to show) */}
										{val.brand && <div className="hero-brand">{val.brand}</div>}
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
				/* import display + script fonts to match the example */
				@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Lora:wght@400;600&family=Playfair+Display:wght@600;800&display=swap');

 				.carousel-wrapper { overflow: hidden; }
				/* keep slides responsive and clamp height instead of forcing full viewport */
				.slide-item { --tx: 0px; --ty: 0px; --ox: 0px; --oy: 0px; height: min(100vh, 720px); position: relative; overflow: hidden; }
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
				/* Title: elegant high-contrast serif similar to the example */
				.hero-title {
					/* use a handwritten/script display first, keep Playfair as fallback */
					font-family: "Dancing Script", "Great Vibes", "Playfair Display", serif;
					font-size: clamp(34px, 6.0vw, 78px);
					line-height: 1.02;
					margin: 6px 0 12px;
					font-weight: 800;
					letter-spacing: -0.02em;
					text-shadow: 0 18px 48px rgba(0,0,0,0.6);
					transform: translateY(6px);
					transition: transform 650ms cubic-bezier(.2,.9,.3,1), opacity 600ms;
					opacity: 0;
					white-space: normal;       /* ensure wrapping */
					word-break: break-word;    /* break long words if needed */
				}
				.hero-overlay.visible .hero-title { opacity: 1; transform: translateY(0); }
				/* Subtitle: classic readable serif to pair with Playfair */
				.hero-sub { 
					/* apply a lighter script/handwriting feel while keeping Lora as fallback for readability */
					font-family: "Dancing Script", "Lora", serif;
					margin: 0 auto 18px;
					color: rgba(255,255,255,0.92);
					font-size: clamp(14px, 1.8vw, 18px);
					letter-spacing: 0.2px;
					opacity: 0;
					transform: translateY(6px);
					transition: transform 700ms 80ms, opacity 700ms 80ms;
				}
				.hero-overlay.visible .hero-sub { opacity: 1; transform: translateY(0); }

				/* optional small script / brand above the title */
				.hero-brand {
					font-family: "Great Vibes", cursive;
					font-size: clamp(16px, 2.6vw, 34px);
					color: rgba(255,255,255,0.95);
					opacity: 0.95;
					margin-bottom: 6px;
					letter-spacing: 0.6px;
					text-shadow: 0 6px 18px rgba(0,0,0,0.45);
				}

				.hero-cta { display: inline-flex; gap: 12px; margin-top: 12px; opacity: 0; transform: translateY(6px); transition: opacity 800ms 160ms, transform 800ms 160ms; }
				.hero-overlay.visible .hero-cta { opacity: 1; transform: translateY(0); }

				.btn-primary { background: linear-gradient(90deg,#ff7a59,#ffbf69); color: #0b1220; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; pointer-events: auto; }
				.btn-ghost { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 8px; cursor: pointer; pointer-events: auto; }

				/* responsive */
				@media (max-width: 900px) {
					/* larger responsive title/subtitle */
					.hero-title {
						font-size: clamp(24px, 7.5vw, 40px);
						padding: 12px 16px;
						white-space: normal;
						word-break: break-word;
						font-family: "Dancing Script", "Great Vibes", "Playfair Display", serif;
					}
					.hero-title br { display: block; line-height: 1.05; } /* if markup includes <br/> it will act as a break */
					.hero-sub {
						font-size: 16px;
						text-align: left;
						margin-left: 0;
						font-family: "Dancing Script", "Lora", serif;
					}
					.shape-1, .shape-2 { display: none; }
					/* shift overlay left so user sees text immediately on smaller viewports */
					.hero-overlay { top: 42%; left: 8%; transform: translate(0, -50%); text-align: left; width: 78%; padding: 0 8px; }
				}

				@media (max-width: 760px) {
					/* slightly larger mobile sizes to improve legibility */
					.carousel-wrapper,
					.slide-item {
						height: 320px !important;
					}
					.slide-bg img {
						width: 120%;
						height: 120%;
						transform: translate(-50%, -50%) translate(var(--tx, 0), var(--ty, 0)) scale(1.06);
					}
					/* keep overlay left-aligned and readable on compact heights */
					.hero-overlay { top: 40%; left: 6%; transform: translate(0, -50%); text-align: left; width: 84%; padding: 0 10px; z-index: 9; }
					.hero-title { font-size: clamp(22px, 7.2vw, 36px); }
					.hero-sub { font-size: 16px; }
				}

				@media (max-width: 480px) {
					/* compact phones — keep text larger for readability */
					.carousel-wrapper,
					.slide-item {
						height: 280px !important;
					}
					.shape-1, .shape-2 { display: none; }

					.hero-overlay {
						top: 44%;
						left: 6%;
						transform: translate(0, -50%);
						text-align: left;
						width: 88%;
						padding: 0 10px;
						z-index: 10;
						pointer-events: auto;
					}
					.hero-title {
						font-size: clamp(20px, 8.0vw, 32px);
						line-height: 1.04;
						text-shadow: 0 12px 36px rgba(0,0,0,0.55);
					}
					.hero-sub {
						font-size: 15px;
						color: rgba(255,255,255,0.95);
						text-align: left;
						font-family: "Dancing Script", "Lora", serif;
					}
					.hero-brand { font-size: clamp(12px, 3.6vw, 20px); }

					/* ensure prev/next controls sit inside the hero and remain tappable */
					button[aria-label="Previous slide"],
					button[aria-label="Next slide"] {
						top: auto;
						bottom: 10px;
						transform: none;
						width: 40px;
						height: 40px;
						opacity: 0.95;
					}
					button[aria-label="Previous slide"] { left: 12px; }
					button[aria-label="Next slide"] { right: 12px; }
				}
 			`}</style>
		</div>
	);
}
