import React, { useState, useEffect } from "react"
import { Title } from "./common/Title"
import { auth, googleProvider, rtdb } from "../lib/firebase"
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth"
import { ref, push, onValue } from "firebase/database"
import { HiOutlineStar, HiStar } from "react-icons/hi"
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

function SampleNextArrow({ onClick }) {
  return (
    <div className='slick-arrow'>
      <button className='next' onClick={onClick}><RiArrowRightSLine size={25} /></button>
    </div>
  )
}

function SamplePrevArrow({ onClick }) {
  return (
    <div className='slick-arrow'>
      <button className='prev' onClick={onClick}><RiArrowLeftSLine size={25} /></button>
    </div>
  )
}

const StarRating = ({ rating, setRating, readonly = false }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button 
        key={star} 
        type="button" 
        onClick={() => !readonly && setRating && setRating(star)}
        disabled={readonly}
        className={readonly ? 'readonly' : ''}
      >
        {star <= rating
          ? <HiStar size={22} color="#f59e0b" />
          : <HiOutlineStar size={22} color="#f59e0b" />
        }
      </button>
    ))}
  </div>
)

const Testimonial = () => {
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [signingIn, setSigningIn] = useState(false)

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setSigningIn(false)
    })
    return () => unsub()
  }, [])

  // Check for redirect result on mount
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect error:", err)
      setError("Sign-in failed. Please try again.")
    })
  }, [])

  // Load reviews from Firebase
  useEffect(() => {
    const reviewsRef = ref(rtdb, "reviews")
    const unsub = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const loaded = Object.entries(data).map(([id, val]) => ({ id, ...val }))
        setReviews(loaded.reverse()) // newest first
      }
    })
    return () => unsub()
  }, [])

  const handleGoogleSignIn = async () => {
    setError("")
    setSigningIn(true)
    try {
      // Try popup first
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error("Sign-in error:", err)
      
      // Provide helpful error messages
      let errorMessage = "Sign-in failed. Please try again."
      
      if (err.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase Authentication is not properly configured. Please check your Firebase Console settings and ensure Google Sign-in is enabled."
      } else if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider)
          return
        } catch (redirectErr) {
          console.error("Redirect error:", redirectErr)
          errorMessage = "Sign-in failed. Please allow popups or try again."
        }
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized. Please add localhost to Firebase authorized domains."
      } else if (err.message) {
        errorMessage = `Sign-in failed: ${err.message}`
      }
      
      setError(errorMessage)
      setSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setShowForm(false)
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return
    setSubmitting(true)
    try {
      await push(ref(rtdb, "reviews"), {
        name: user.displayName,
        photo: user.photoURL,
        email: user.email,
        uid: user.uid,
        rating,
        text: reviewText.trim(),
        createdAt: new Date().toISOString(),
      })
      setReviewText("")
      setRating(5)
      setShowForm(false)
    } catch (err) {
      console.error("Submit error:", err)
    }
    setSubmitting(false)
  }

  const settings = {
    dots: false,
    infinite: reviews.length > 2,
    speed: 500,
    autoplay: reviews.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [{ breakpoint: 800, settings: { slidesToShow: 1, dots: true } }],
  }

  return (
    <section className='testimonial'>
      <div className='container'>
        <div className='heading-title'>
          <Title title='Guest Reviews' className="title-underline" />
          <p className="section-subtitle">Share your experience and read what others have to say</p>
        </div>

        {/* Auth + Review Form */}
        <div className="review-actions">
          {!user ? (
            <div className="signin-container">
              <p className="signin-prompt">Sign in with Google to leave a review and help other guests</p>
              {error && <div className="error-message">{error}</div>}
              <button 
                className="google-signin-btn" 
                onClick={handleGoogleSignIn}
                disabled={signingIn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {signingIn ? "Signing in..." : "Sign in with Google"}
              </button>
            </div>
          ) : (
            <div className="user-panel">
              <div className="user-info-header">
                <div className="user-profile">
                  <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                  <div className="user-details">
                    <h4>{user.displayName}</h4>
                    <span>{user.email}</span>
                  </div>
                </div>
                <button className="signout-btn" onClick={handleSignOut}>
                  <span>Sign Out</span>
                </button>
              </div>
              
              {!showForm ? (
                <button className="write-review-btn" onClick={() => setShowForm(true)}>
                  <span className="btn-icon">✍️</span>
                  <span>Write a Review</span>
                </button>
              ) : (
                <div className="review-form">
                  <div className="form-header">
                    <h3>Share Your Experience</h3>
                    <p>Tell us about your stay</p>
                  </div>
                  
                  <div className="rating-section">
                    <label>Your Rating</label>
                    <StarRating rating={rating} setRating={setRating} />
                  </div>
                  
                  <div className="text-section">
                    <label>Your Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell us about your experience... What did you like? What could be improved?"
                      rows={5}
                      maxLength={500}
                    />
                    <span className="char-count">{reviewText.length}/500</span>
                  </div>
                  
                  <div className="form-actions">
                    <button onClick={() => setShowForm(false)} className="cancel-btn">
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting || !reviewText.trim()}
                      className="submit-btn"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews Slider */}
        {reviews.length > 0 ? (
          <div className='cards'>
            <Slider {...settings}>
              {reviews.map((review) => (
                <div key={review.id}>
                  <div className='card review-card'>
                    <div className='review-header'>
                      <div className='reviewer-info'>
                        <div className='reviewer-avatar'>
                          <img src={review.photo || "/default-avatar.png"} alt={review.name} />
                        </div>
                        <div className='reviewer-details'>
                          <h3>{review.name}</h3>
                          <StarRating rating={review.rating} readonly={true} />
                          <span className='review-date'>
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='review-content'>
                      <p>"{review.text}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Testimonial