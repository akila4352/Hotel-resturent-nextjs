"use client";

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
		{ img: "/images/b4.jpeg", title: "Sea View", subtitle: "Breathtaking ocean vistas", btn1: "Reserve", btn2: "Menu", navigatePath: "/menu" },
		{ img: "/images/b5.jpg", title: "Cozy Rooms", subtitle: "Restful nights", btn1: "Book", btn2: "Rooms", navigatePath: "/rooms" },
		{ img: "/images/b6.jpg", title: "Lakeside", subtitle: "Relax & unwind", btn1: "Reserve", btn2: "Gallery", navigatePath: "/amenities" },
		{ img: "/images/b7.jpg", title: "Attractions", subtitle: "Explore the area", btn1: "Discover", btn2: "Map", navigatePath: "/showcase" },
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
		// start autoplay enabled after mount (reduced delay)
		const t = setTimeout(() => setAutoplayEnabled(true), 200); // was 500
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
		if (sliderRef.current && sliderRef.current.slickNext) return sliderRef.current.slickNext();
		if (sliderRef.current && sliderRef.current.innerSlider && sliderRef.current.innerSlider.slickNext) return sliderRef.current.innerSlider.slickNext();
	};
	const previous = () => {
		if (sliderRef.current && sliderRef.current.slickPrev) return sliderRef.current.slickPrev();
		if (sliderRef.current && sliderRef.current.innerSlider && sliderRef.current.innerSlider.slickPrev) return sliderRef.current.innerSlider.slickPrev();
	};

	// Ensure react-slick autoplay actually starts/stops — call instance methods when flag changes
	useEffect(() => {
		if (!sliderRef.current) {
			// slider instance may not be mounted yet; retry once shortly
			const retry = setTimeout(() => {
				try {
					if (!sliderRef.current) return;
					if (autoplayEnabled) {
						if (typeof sliderRef.current.slickPlay === "function") sliderRef.current.slickPlay();
						else if (sliderRef.current.innerSlider && typeof sliderRef.current.innerSlider.slickPlay === "function") sliderRef.current.innerSlider.slickPlay();
					} else {
						if (typeof sliderRef.current.slickPause === "function") sliderRef.current.slickPause();
						else if (sliderRef.current.innerSlider && typeof sliderRef.current.innerSlider.slickPause === "function") sliderRef.current.innerSlider.slickPause();
					}
				} catch (e) {
					// ignore
				}
			}, 250);
			return () => clearTimeout(retry);
		}

		// helper to call method if present on either the ref or innerSlider
		const callMethod = (name) => {
			try {
				if (typeof sliderRef.current[name] === "function") {
					sliderRef.current[name]();
					return;
				}
				// some versions expose methods under innerSlider
				if (sliderRef.current.innerSlider && typeof sliderRef.current.innerSlider[name] === "function") {
					sliderRef.current.innerSlider[name]();
					return;
				}
			} catch (e) {
				// silent failure
			}
		};

		if (autoplayEnabled) {
			callMethod("slickPlay");
		} else {
			callMethod("slickPause");
		}
	}, [autoplayEnabled, mounted]);

	// settings include callbacks to manage caption animations
	const settings = {
		dots: false,
		infinite: true,
		speed: 700,            // was 900
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: autoplayEnabled,
		autoplaySpeed: 3000,  // was 6000
		arrows: false,
		beforeChange: (_, next) => {
			// disable autoplay while transitioning captions
			setAutoplayEnabled(false);
			// prepare caption restart
			setCaptionKey((k) => k + 1);
		},
		afterChange: (index) => {
			setActiveIndex(index);
			// small delay then re-enable autoplay (reduced)
			setTimeout(() => setAutoplayEnabled(true), 60); // was 600
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
				suppressHydrationWarning={true}
				style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 0 }} // changed to full viewport
			>
				<div className="slide-item" style={{ position: "relative", width: "100%", height: "100vh" }}> {/* changed to full viewport */}
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
		speed: 700,            // was 900
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: autoplayEnabled,
		autoplaySpeed: 3000,  // was 6000
		arrows: false,
		beforeChange: (_, next) => {
			// disable autoplay while transitioning captions
			setAutoplayEnabled(false);
			// prepare caption restart
			setCaptionKey((k) => k + 1);
		},
		afterChange: (index) => {
			setActiveIndex(index);
			// small delay then re-enable autoplay (reduced)
			setTimeout(() => setAutoplayEnabled(true), 300); // was 600
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
			suppressHydrationWarning={true}
			style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 0 }} // changed to full viewport
		>
			<div id="header-carousel" className="carousel slide" style={{ height: "100vh", width: "100%" }}> {/* changed to full viewport */}
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
									style={{ position: "relative", width: "100%", height: "100vh" }} // changed to full viewport
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
										<div className="shape shape-1" aria-hidden></div>
										<div className="shape shape-2" aria-hidden></div>
									</div>

									{/* overlay caption (animated entrance on slide change) */}
									<div
										className={`hero-overlay ${isActive ? "visible" : ""}`}
										style={{
											// keep overlay centered, then apply small parallax offsets
											transform: `translate(-50%, -50%) translate(var(--ox, 0), var(--oy, 0))`,
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
				.slide-item { --tx: 0px; --ty: 0px; --ox: 0px; --oy: 0px; height: 100vh; position: relative; overflow: hidden; } /* use full viewport height; mobile overrides still apply */
				/* slide background: position and subtle inset shadow */
				.slide-bg { position: absolute; inset: 0; overflow: hidden; box-shadow: inset 0 28px 40px -24px rgba(0,0,0,0.35); }
				/* top darkness gradient overlay (above image, below shapes/overlay) */
				.slide-bg::before {
					content: "";
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					height: 14%; /* adjust % to control vertical extent of the shade */
					background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 100%);
					pointer-events: none;
					z-index: 3;
				}
				.slide-bg img { will-change: transform; z-index: 1; }
				/* ensure decorative shapes sit above the gradient but below captions */
				.shape { position: absolute; border-radius: 50%; opacity: 0.12; filter: blur(6px); pointer-events: none; z-index: 4; }
 
				/* decorative floating shapes */
-				.shape { position: absolute; border-radius: 50%; opacity: 0.12; filter: blur(6px); pointer-events: none; }
 				.shape-1 { width: 220px; height: 220px; background: radial-gradient(circle at 30% 30%, #ff7a59, transparent 40%); left: -60px; top: 10%; animation: floatSlow 8s ease-in-out infinite; transform: translateZ(0); }
 				.shape-2 { width: 160px; height: 160px; background: radial-gradient(circle at 60% 60%, #2fb0ff, transparent 40%); right: -50px; bottom: 12%; animation: floatSlow 10s ease-in-out infinite reverse; transform: translateZ(0); }
 				@keyframes floatSlow { 0% { transform: translateY(0); } 50% { transform: translateY(18px); } 100% { transform: translateY(0); } }
 
				/* overlay caption - centered on the page */
				.hero-overlay {
					position: absolute;
					left: 50%;
					top: 50%;
					/* base centering; inline transform adds parallax translate after this */
					transform: translate(-50%, -50%);
					text-align: center;
					color: #fff;
					z-index: 6;
					width: min(980px, 80%);
					padding: 0 20px;
					box-sizing: border-box;
					pointer-events: none;
					opacity: 0;
					transition: opacity 600ms ease, transform 600ms ease;
				}
				.hero-overlay.visible { 
					opacity: 1; 
					pointer-events: auto;
				}

				/* Title: large elegant serif (Playfair) similar to the reference image */
.hero-title {
    font-family: "Playfair Display", "Dancing Script", "Great Vibes", serif;
    font-size: clamp(56px, 10vw, 80px);
    
    /* FIX: allow full letters like y/p/g (no clipping) */
    line-height: 1.12;         
    overflow: visible;          /* FIX */
    white-space: normal;        /* FIX */
    
    margin: 0 0 12px;
    font-weight: 700;
    letter-spacing: -0.02em;

    -webkit-text-stroke: 0.6px rgba(0,0,0,0.35);
    text-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.4);

    transform: translateY(6px);
    transition: transform 520ms cubic-bezier(.2,.9,.3,1), opacity 500ms;

    opacity: 0;
    color: #fff;
}

.hero-overlay.visible .hero-title {
    opacity: 1;
    transform: translateY(0);
}

/* Subtitle */
.hero-sub {
    font-family: "Lora", serif;
    display: inline-block;
    position: relative;
    margin: 0;
    color: rgba(255,255,255,0.95);
    font-size: clamp(14px, 1.8vw, 20px);
    letter-spacing: 8px;
    text-transform: uppercase;

    opacity: 0;
    transform: translateY(6px);
    transition: transform 520ms 80ms, opacity 520ms 80ms;

    padding: 0 26px;
}

.hero-sub::before,
.hero-sub::after {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 160px;
    height: 2px;
    background: rgba(255,255,255,0.7);
}

.hero-sub::before { left: -190px; }
.hero-sub::after  { right: -190px; }

.hero-overlay.visible .hero-sub {
    opacity: 1;
    transform: translateY(0);
}

/* Responsive fixes */
@media (max-width: 900px) {
    .hero-title {
        font-size: clamp(36px, 9vw, 76px);
        line-height: 1.12;     /* FIX descenders */
    }

    .hero-sub {
        font-size: clamp(12px, 2.2vw, 16px);
        letter-spacing: 6px;
    }

    .hero-sub::before,
    .hero-sub::after {
        width: 90px;
        left: -110px;
        right: -110px;
    }

    .hero-overlay {
        width: 92%;
        padding: 0 12px;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: clamp(20px, 10vw, 36px);
        line-height: 1.15;     /* FIX small screen clipping */
    }

    .hero-sub {
        font-size: 12px;
        letter-spacing: 4px;
        padding: 0 10px;
    }

    .hero-sub::before,
    .hero-sub::after {
        width: 60px;
        left: -80px;
        right: -80px;
    }
}

				/* ...existing styles below... */
 			`}</style>
		</div>
	);
}
