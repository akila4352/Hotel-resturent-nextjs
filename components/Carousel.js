"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Carousel({ items = [] }) {
	const router = useRouter();
	const sliderRef = useRef(null);
	const [mounted, setMounted] = useState(false);
	const [imgStatus, setImgStatus] = useState({});
	const [activeIndex, setActiveIndex] = useState(0);
	const [captionKey, setCaptionKey] = useState(0); 

	// default slides
	const defaultSlides = [
		{ img: "/images/b3.jpg", title: "Hotel Amore", subtitle: "Relax, Dine & Rejuvenate", btn1: "Book Now", btn2: "Learn More", navigatePath: "/" },
		{ img: "/images/b1.jpg", title: "Elegant Lobby", subtitle: "Warm welcome", btn1: "Explore", btn2: "Details", navigatePath: "/" },
		{ img: "/images/b4.jpeg", title: "Sea View", subtitle: "Breathtaking ocean vistas", btn1: "Reserve", btn2: "Menu", navigatePath: "/menu" },
		{ img: "/images/b5.jpg", title: "Cozy Rooms", subtitle: "Restful nights", btn1: "Book", btn2: "Rooms", navigatePath: "/rooms" },
		{ img: "/images/b6.jpg", title: "Lakeside", subtitle: "Relax & unwind", btn1: "Reserve", btn2: "Gallery", navigatePath: "/amenities" },
		{ img: "/images/b7.jpg", title: "Attractions", subtitle: "Explore the area", btn1: "Discover", btn2: "Map", navigatePath: "/showcase" },
	];

	const slides = items && items.length ? items : defaultSlides;

	// preload images
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
	}, [mounted, JSON.stringify(slides.map((s) => s.img))]);

	useEffect(() => {
		setMounted(true);
		if (typeof window !== "undefined") {
			require("slick-carousel/slick/slick.css");
			require("slick-carousel/slick/slick-theme.css");
		}
	}, []);

	// navigation
	const next = () => {
		if (sliderRef.current && sliderRef.current.slickNext) return sliderRef.current.slickNext();
		if (sliderRef.current && sliderRef.current.innerSlider && sliderRef.current.innerSlider.slickNext) return sliderRef.current.innerSlider.slickNext();
	};
	const previous = () => {
		if (sliderRef.current && sliderRef.current.slickPrev) return sliderRef.current.slickPrev();
		if (sliderRef.current && sliderRef.current.innerSlider && sliderRef.current.innerSlider.slickPrev) return sliderRef.current.innerSlider.slickPrev();
	};

	// slider settings - 1 second autoplay, no pausing
	const sliderSettings = {
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 2500, // 1 second
		arrows: false,
		pauseOnHover: false,
		pauseOnFocus: false,
		beforeChange: (_, next) => {
			setCaptionKey((k) => k + 1);
		},
		afterChange: (index) => {
			setActiveIndex(index);
		},
		responsive: [
			{ breakpoint: 1024, settings: { slidesToShow: 1 } },
			{ breakpoint: 768, settings: { slidesToShow: 1 } },
			{ breakpoint: 480, settings: { slidesToShow: 1 } },
		],
	};

	// fallback image
	const svgFallback = encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='#0f1720'/><text x='50%' y='50%' font-size='36' fill='#ffffff' text-anchor='middle' dominant-baseline='middle'>Image unavailable</text></svg>`
	);
	const fallbackDataUri = `data:image/svg+xml;charset=utf-8,${svgFallback}`;

	// SSR fallback
	if (!mounted) {
		const first = slides[0] || {};
		return (
			<div
				className="carousel-wrapper"
				suppressHydrationWarning={true}
				style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 0 }}
			>
				<div className="slide-item" style={{ position: "relative", width: "100%", height: "100vh" }}>
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

	const Slider = require("react-slick").default;

	// parallax handler
	function handleMouseMove(e) {
		const el = e.currentTarget;
		const rect = el.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width - 0.5;
		const py = (e.clientY - rect.top) / rect.height - 0.5;
		el.style.setProperty("--tx", `${px * 10}px`);
		el.style.setProperty("--ty", `${py * 8}px`);
		el.style.setProperty("--ox", `${-px * 6}px`);
		el.style.setProperty("--oy", `${-py * 6}px`);
	}

	function handleMouseLeave(e) {
		const el = e.currentTarget;
		el.style.setProperty("--tx", `0px`);
		el.style.setProperty("--ty", `0px`);
		el.style.setProperty("--ox", `0px`);
		el.style.setProperty("--oy", `0px`);
	}

	return (
		<div
			className="carousel-wrapper"
			suppressHydrationWarning={true}
			style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 0 }}
		>
			<div id="header-carousel" className="carousel slide" style={{ height: "100vh", width: "100%" }}>
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
									style={{ position: "relative", width: "100%", height: "100vh" }}
								>
									<img
										src={val.img}
										alt={val.title || "Hotel Amore"}
										style={{ display: "none" }}
										onLoad={() => setImgStatus((prev) => ({ ...prev, [index]: "loaded" }))}
										onError={() => setImgStatus((prev) => ({ ...prev, [index]: "error" }))}
									/>

									<div className={`slide-bg ${isActive ? "active" : ""}`}>
										<img
											src={bgUrl}
											alt={val.title || ""}
											onError={(e) => {
												if (e && e.currentTarget) e.currentTarget.src = fallbackDataUri;
												setImgStatus((prev) => ({ ...prev, [index]: "error" }));
											}}
											style={{
												width: "110%",
												height: "110%",
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
										<div className="shape shape-1" aria-hidden></div>
										<div className="shape shape-2" aria-hidden></div>
									</div>

									<div
										className={`hero-overlay ${isActive ? "visible" : ""}`}
										style={{
											transform: `translate(-50%, -50%) translate(var(--ox, 0), var(--oy, 0))`,
										}}
										aria-hidden
										key={captionKey + "-" + index}
									>
										{val.brand && <div className="hero-brand">{val.brand}</div>}
										<h1 className="hero-title">{val.title}</h1>
										<p className="hero-sub">{val.subtitle}</p>
									</div>
								</div>
							);
						})}
					</Slider>
				</div>

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

			<style jsx>{`
				@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Lora:wght@400;600&family=Playfair+Display:wght@600;800&display=swap');

 				.carousel-wrapper { overflow: hidden; }
				.slide-item { --tx: 0px; --ty: 0px; --ox: 0px; --oy: 0px; height: 100vh; position: relative; overflow: hidden; }
				.slide-bg { position: absolute; inset: 0; overflow: hidden; box-shadow: inset 0 28px 40px -24px rgba(0,0,0,0.35); }
				.slide-bg::before {
					content: "";
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					height: 14%;
					background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 100%);
					pointer-events: none;
					z-index: 3;
				}
				.slide-bg img { will-change: transform; z-index: 1; }
				.shape { position: absolute; border-radius: 50%; opacity: 0.12; filter: blur(6px); pointer-events: none; z-index: 4; }
 				.shape-1 { width: 220px; height: 220px; background: radial-gradient(circle at 30% 30%, #ff7a59, transparent 40%); left: -60px; top: 10%; animation: floatSlow 8s ease-in-out infinite; transform: translateZ(0); }
 				.shape-2 { width: 160px; height: 160px; background: radial-gradient(circle at 60% 60%, #2fb0ff, transparent 40%); right: -50px; bottom: 12%; animation: floatSlow 10s ease-in-out infinite reverse; transform: translateZ(0); }
 				@keyframes floatSlow { 0% { transform: translateY(0); } 50% { transform: translateY(18px); } 100% { transform: translateY(0); } }
 
				.hero-overlay {
					position: absolute;
					left: 50%;
					top: 50%;
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

				.hero-title {
					font-family: "Playfair Display", "Dancing Script", "Great Vibes", serif;
					font-size: clamp(42px, 8vw, 64px);
					line-height: 1.12;         
					overflow: visible;
					white-space: normal;
					margin: 0 0 12px;
					font-weight: 700;
					letter-spacing: -0.02em;
					color: #fff;
					text-shadow: 
						1px 1px 0 rgba(0,0,0,0.2),
						2px 2px 0 rgba(0,0,0,0.18),
						3px 3px 0 rgba(0,0,0,0.16),
						4px 4px 0 rgba(0,0,0,0.14),
						5px 5px 0 rgba(0,0,0,0.12),
						6px 6px 0 rgba(0,0,0,0.1),
						7px 7px 8px rgba(0,0,0,0.35),
						0 8px 20px rgba(0,0,0,0.4),
						0 12px 40px rgba(0,0,0,0.3);
					-webkit-text-stroke: 0.5px rgba(255,255,255,0.1);
					transform: translateY(6px);
					transition: transform 520ms cubic-bezier(.2,.9,.3,1), opacity 500ms;
					opacity: 0;
				}

				.hero-overlay.visible .hero-title {
					opacity: 1;
					transform: translateY(0);
				}

				.hero-sub {
					font-family: "Lora", serif;
					display: inline-block;
					position: relative;
					margin: 0;
					color: rgba(255,255,255,0.95);
					font-size: clamp(14px, 1.8vw, 20px);
					letter-spacing: 8px;
					text-transform: uppercase;
					text-shadow: 
						1px 1px 0 rgba(0,0,0,0.25),
						2px 2px 0 rgba(0,0,0,0.2),
						3px 3px 0 rgba(0,0,0,0.15),
						4px 4px 5px rgba(0,0,0,0.3),
						0 5px 15px rgba(0,0,0,0.35);
					opacity: 0;
					transform: translateY(6px);
					transition: transform 520ms 80ms, opacity 520ms 80ms;
					padding: 0 2px;
				}

				.hero-sub::before,
				.hero-sub::after {
					content: "";
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					width: 80px;
					height: 2px;
					background: rgba(255,255,255,0.7);
				}

				.hero-sub::before { left: -100px; }
				.hero-sub::after  { right: -100px; }

				.hero-overlay.visible .hero-sub {
					opacity: 1;
					transform: translateY(0);
				}

				@media (max-width: 900px) {
					.hero-title {
						font-size: clamp(32px, 7vw, 60px);
						line-height: 1.12;
					}

					.hero-sub {
						font-size: clamp(12px, 2.2vw, 16px);
						letter-spacing: 6px;
					}

					.hero-sub::before,
					.hero-sub::after {
						width: 50px;
					}
					
					.hero-sub::before { left: -65px; }
					.hero-sub::after  { right: -65px; }

					.hero-overlay {
						width: 92%;
						padding: 0 12px;
					}
				}

				@media (max-width: 480px) {
					.hero-title {
						font-size: clamp(24px, 8vw, 36px);
						line-height: 1.15;
						text-shadow: 
							1px 1px 0 rgba(0,0,0,0.2),
							2px 2px 0 rgba(0,0,0,0.15),
							3px 3px 5px rgba(0,0,0,0.3),
							0 4px 12px rgba(0,0,0,0.35);
					}

					.hero-sub {
						font-size: 12px;
						letter-spacing: 4px;
						padding: 0 10px;
						text-shadow: 
							1px 1px 0 rgba(0,0,0,0.2),
							2px 2px 3px rgba(0,0,0,0.25),
							0 3px 10px rgba(0,0,0,0.3);
					}
					
					.hero-sub::before,
					.hero-sub::after {
						width: 30px;
					}
					
					.hero-sub::before { left: -45px; }
					.hero-sub::after  { right: -45px; }
				}
 			`}</style>
		</div>
	);
} 