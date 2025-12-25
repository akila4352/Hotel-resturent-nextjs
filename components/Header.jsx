import { 
  faBed,
  faCalendarDays,
  faCar,
  faPerson,
  faPlane,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";
import { DateRange } from "react-date-range";
import { useState, useEffect, useRef } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { rtdb } from '../../firebase/firebase';
import { ref, push } from "firebase/database";

const Header = ({ type, selectedProperties = [], triggerBookNow }) => {
  const [destination, setDestination] = useState("");
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [openOptions, setOpenOptions] = useState(false);
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    gmail: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [calendarRef, setCalendarRef] = useState(null);
  const optionsRef = useRef(null);
  const [openDestination, setOpenDestination] = useState(false);
  const destinationRef = useRef(null);
  const [editRoom, setEditRoom] = useState(false);

  const navigate = useNavigate();

  const handleOption = (name, operation) => {
    setOptions((prev) => {
      return {
        ...prev,
        [name]: operation === "i" ? options[name] + 1 : options[name] - 1,
      };
    });
  };

  const handleSearch = () => {
    navigate("/hotels", { state: { destination, date, options } });
  };

  const handleBookNow = () => {
    if (selectedProperties.length === 0) {
      alert("Please select at least one property type before booking.");
      return;
    }
    setShowBookingPopup(true);
  };

  const handleClosePopup = () => {
    setShowBookingPopup(false);
    setBookingForm({ name: "", gmail: "", contact: "" });
    setSubmitting(false);
  };

  const handleFormChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Push booking details to Firebase
      await push(ref(rtdb, "hotelBookings"), {
        ...bookingForm,
        destination,
        date: {
          startDate: date[0].startDate.toLocaleDateString(),
          endDate: date[0].endDate.toLocaleDateString()
        },
        options,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });

      alert("Thank you! Our team will contact you soon.");
      handleClosePopup();
    } catch (err) {
      alert("Failed to submit booking. Please try again.");
      setSubmitting(false);
    }
  };

  // Open booking popup when triggerBookNow changes
  useEffect(() => {
    if (triggerBookNow) {
      if (selectedProperties.length > 0) {
        setShowBookingPopup(true);
      }
    }
  }, [triggerBookNow, selectedProperties]);

  // Add effect to close calendar when clicking outside
  useEffect(() => {
    if (!openDate) return;
    function handleClickOutside(event) {
      const target = event.target;
      // ignore clicks inside the calendar DOM
      if (calendarRef && calendarRef.contains && calendarRef.contains(target)) return;
      if (target && target.closest && target.closest(".rdrCalendarWrapper")) return;
      setOpenDate(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDate, calendarRef]);

  // Add effect to close options when clicking outside
  useEffect(() => {
    if (!openOptions) return;
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setOpenOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openOptions]);
 
  // Add effect to close destination input when clicking outside
  useEffect(() => {
    if (!openDestination) return;
    function handleClickOutside(event) {
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setOpenDestination(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDestination]);

  return (
    <div className="header">
      <div
        className={
          type === "list" ? "headerContainer listMode" : "headerContainer"
        }
      > 
        {type !== "list" && (
          <>
            <h1
              className="headerTitle"
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "2rem",
                color: "#FEA116",
                marginBottom: "18px",
                letterSpacing: "1px"
              }}
            >
              &nbsp;
            </h1>
            <div className="headerSearch"
              style={{
                padding: "30px 20px",
                fontSize: "1.2rem",
                minHeight: "80px",
              }}
            >
              <div className="headerSearchItem" ref={destinationRef}>
                <FontAwesomeIcon icon={faBed} className="headerIcon" />
                {!openDestination ? (
                  <span
                    className="headerSearchText"
                    style={{ fontWeight: "bold", color: "#ff7f27", cursor: "pointer" }}
                    onClick={() => setOpenDestination(true)}
                  >
                    {destination ? destination : "Where are you going?"}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="headerSearchInput"
                    value={destination}
                    autoFocus
                    onChange={(e) => setDestination(e.target.value)}
                    onBlur={() => setOpenDestination(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setOpenDestination(false);
                    }}
                    style={{
                      width: "90%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "1rem",
                    }}
                  />
                )}
              </div>
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faCalendarDays} className="headerIcon" />
                <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
                  <span
                    onClick={() => setOpenDate(!openDate)}
                    className="headerSearchText"
                    style={{ fontWeight: "bold", color: "#ff7f27" }}
                  >{`${format(date[0].startDate, "MM/dd/yyyy")} to ${format(
                    date[0].endDate,
                    "MM/dd/yyyy"
                  )}`}</span>
                  {openDate && (
                    <div
                      ref={setCalendarRef}
                      style={{
                        position: "static",
                        marginTop: "8px",
                        width: "100%",
                        zIndex: 10,
                        pointerEvents: "auto", // <- ensure calendar can receive pointer events
                        // compute mobile layout safely (guard window for SSR)
                        ...(typeof window !== "undefined" && window.innerWidth <= 900
                          ? { maxWidth: "100vw" }
                          : { position: "absolute", top: "50px", zIndex: 2 }),
                      }}
                    >
                      <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setDate([item.selection])}
                        moveRangeOnFirstSelection={false} // <- keep picker open to select end date
                        ranges={date}
                        className="date"
                        minDate={new Date()}
                        months={2}
                        direction="horizontal"
                        showSelectionPreview={true}
                        showMonthAndYearPickers={true}
                        rangeColors={["#3b82f6"]}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faPerson} className="headerIcon" />
                <span
                  onClick={() => setOpenOptions(!openOptions)}
                  className="headerSearchText"
                  style={{ fontWeight: "bold", color: "#ff7f27" }}
                >{`${options.adult} adult · ${options.children} children · ${options.room} room`}</span>
                {openOptions && (
                  <div className="options" ref={optionsRef}>
                    <div className="optionItem">
                      <span className="optionText">Adult</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.adult <= 1}
                          className="optionCounterButton"
                          onClick={() => handleOption("adult", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.adult}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("adult", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="optionItem">
                      <span className="optionText">Children</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.children <= 0}
                          className="optionCounterButton"
                          onClick={() => handleOption("children", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.children}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="optionItem">
                      <span className="optionText">Room</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.room <= 1}
                          className="optionCounterButton"
                          onClick={() => handleOption("room", "d")}
                        >
                          -
                        </button>
                        {editRoom ? (
                          <input
                            type="number"
                            min={1}
                            value={options.room}
                            style={{
                              width: "40px",
                              textAlign: "center",
                              fontSize: "1rem",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                              margin: "0 4px"
                            }}
                            autoFocus
                            onChange={e => {
                              let val = Math.max(1, parseInt(e.target.value) || 1);
                              setOptions(prev => ({ ...prev, room: val }));
                            }}
                            onBlur={() => setEditRoom(false)}
                            onKeyDown={e => {
                              if (e.key === "Enter") setEditRoom(false);
                            }}
                          />
                        ) : (
                          <span
                            className="optionCounterNumber"
                            style={{ cursor: "pointer" }}
                            onClick={() => setEditRoom(true)}
                            title="Click to enter room count"
                          >
                            {options.room}
                          </span>
                        )}
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("room", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="headerSearchItem">
                <button
                  className="headerBtn"
                  onClick={handleBookNow}
                  style={{
                    // Remove opacity and cursor logic so button is always clickable
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
            {showBookingPopup && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    padding: "32px 24px",
                    minWidth: "320px",
                    maxWidth: "90vw",
                    textAlign: "center",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <h2 style={{marginBottom: "16px", color: "#FEA116"}}>Booking Quotation</h2>
                  <p style={{marginBottom: "24px", color: "#222"}}>
                    Your booking details will be processed.<br />
                    Destination: <b>{destination || "N/A"}</b><br />
                    Dates: <b>{format(date[0].startDate, "MM/dd/yyyy")} to {format(date[0].endDate, "MM/dd/yyyy")}</b><br />
                    Guests: <b>{options.adult} adult, {options.children} children, {options.room} room</b>
                    <br />
                    Property Types: <b>{selectedProperties.length ? selectedProperties.join(", ") : "N/A"}</b>
                  </p>
                  <form onSubmit={handleBookingSubmit} style={{marginBottom: "16px"}}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={bookingForm.name}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: "90%",
                        marginBottom: "10px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                      }}
                    />
                    <input
                      type="email"
                      name="gmail"
                      placeholder="Your Gmail"
                      value={bookingForm.gmail}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: "90%",
                        marginBottom: "10px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                      }}
                    />
                    <input
                      type="tel"
                      name="contact"
                      placeholder="Contact Number"
                      value={bookingForm.contact}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: "90%",
                        marginBottom: "16px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: "#FEA116",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 24px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "1rem",
                        marginRight: "10px",
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={handleClosePopup}
                      style={{
                        background: "#eee",
                        color: "#333",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 24px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "1rem",
                      }}
                    >
                      Close
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`
        .rdrCalendarWrapper { pointer-events: auto; } /* ensure calendar clickable on all viewports */
        @media (max-width: 900px) {
          .headerSearch {
            flex-direction: column !important;
            padding: 10px 2vw !important;
            font-size: 0.95rem !important;
            min-height: 0 !important;
            background: transparent !important;
           
          }
         /* DateRange overrides for header */
         .rdrCalendarWrapper { border-radius: 10px; overflow: hidden; box-shadow: 0 12px 30px rgba(8,20,40,0.25); }
         .rdrDayInRange, .rdrDaySelected, .rdrStartEdge, .rdrEndEdge, .rdrDayStartPreview, .rdrDayEndPreview {
           background: #3b82f6 !important;
           color: #fff !important;
           border-radius: 18px !important;
         }
         .rdrDayNumber span { font-weight: 600; }
         .rdrDayDisabled { opacity: 0.35; }
         .rdrMonth { padding: 12px; }
          .headerSearchItem {
            margin-bottom: 8px !important;
            width: 100% !important;
           
          }
          .headerBtn {
            width: 100% !important;
            font-size: 0.95rem !important;
            padding: 8px 0 !important;
          }
          .headerTitle {
            font-size: 1rem !important;
            text-align: center !important;
          }
          .headerDesc {
            font-size: 0.95rem !important;
            text-align: center !important;  
          }
          .options {
            min-width: 90vw !important;
            font-size: 0.95rem !important;
          }
        }
        @media (max-width: 600px) {
          .headerSearch {
            font-size: 0.9rem !important;
          }
          .headerTitle {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Header;

