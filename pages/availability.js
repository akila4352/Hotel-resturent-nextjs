import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { parseISO, format, differenceInDays } from "date-fns"
import { rtdb } from "../lib/firebase"
import { ref as dbRef, onValue } from "firebase/database"
import { rooms as roomOptions } from "@/sections/Rooms"

const iCalMap = {
  room3: "https://ical.booking.com/v1/export?t=73ce2feb-f14e-4dcf-9b5a-fc1a8ab77e93",
  room2: "https://ical.booking.com/v1/export?t=81738c6a-5b4b-4bd5-88ae-4db019416af1",
  room5: "https://ical.booking.com/v1/export?t=5ebac038-e813-4086-88ed-a4bec6ad89c6",
  room1: "https://ical.booking.com/v1/export?t=b181e944-f97c-4ae6-a55c-a21b22503943",
  room4: "https://ical.booking.com/v1/export?t=1a3b1864-b158-4d8f-966a-5b29a29fecd3",
  room6: "https://ical.booking.com/v1/export?t=6267f28f-da20-436e-8d42-7f6d1fce4623",
}

function parseICal(text) {
  const lines = text.split(/\r?\n/)
  const events = []
  let inEvent = false
  let cur = {}

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line === "BEGIN:VEVENT") { inEvent = true; cur = { status: "CONFIRMED" }; continue }
    if (line === "END:VEVENT") {
      inEvent = false
      if (String(cur.status || "").toUpperCase() !== "CANCELLED" && cur.dtstart) {
        events.push({ dtstart: cur.dtstart, dtend: cur.dtend || cur.dtstart })
      }
      cur = {}
      continue
    }
    if (!inEvent) continue
    if (line.toUpperCase().startsWith("DTSTART")) { const i = line.indexOf(":"); if (i !== -1) cur.dtstart = line.slice(i + 1); continue }
    if (line.toUpperCase().startsWith("DTEND")) { const i = line.indexOf(":"); if (i !== -1) cur.dtend = line.slice(i + 1); continue }
    if (line.toUpperCase().startsWith("STATUS")) { const i = line.indexOf(":"); if (i !== -1) cur.status = line.slice(i + 1); continue }
  }

  const toDate = (val) => {
    if (!val) return null
    const m = val.match(/^(\d{4})(\d{2})(\d{2})/)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }

  const out = new Set()
  for (const ev of events) {
    const s = toDate(ev.dtstart)
    let e = toDate(ev.dtend)
    if (!s) continue
    if (e) e = new Date(e.getFullYear(), e.getMonth(), e.getDate() - 1)
    else e = s
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      out.add(new Date(d).toISOString().slice(0, 10))
    }
  }
  return out
}

function isRangeBlocked(blockedSet, checkIn, checkOut) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    if (blockedSet.has(d.toISOString().slice(0, 10))) return true
  }
  return false
}

export default function AvailabilityPage() {
  const router = useRouter()
  const { checkIn, checkOut, adults = "1", children = "0" } = router.query

  const [roomStatus, setRoomStatus] = useState({})
  const [firebaseData, setFirebaseData] = useState(null)

  const ci = checkIn ? parseISO(String(checkIn)) : null
  const co = checkOut ? parseISO(String(checkOut)) : null
  const nights = ci && co ? Math.max(1, differenceInDays(co, ci)) : 0

  // Load Firebase reservations once
  useEffect(() => {
    const bookingsRef = dbRef(rtdb, "reservations")
    const unsub = onValue(bookingsRef, (snap) => {
      setFirebaseData(snap.val() || {})
    }, () => setFirebaseData({}))
    return () => unsub()
  }, [])

  // Run availability checks when dates + firebase data are ready
  useEffect(() => {
    if (!checkIn || !checkOut || firebaseData === null) return

    // Set all to loading
    const initial = {}
    roomOptions.forEach((r) => { initial[r.type] = "loading" })
    setRoomStatus(initial)

    roomOptions.forEach(async (room) => {
      const type = room.type.toLowerCase()
      try {
        // 1. iCal blocked dates
        let iCalBlocked = new Set()
        const url = iCalMap[type]
        if (url) {
          try {
            const res = await fetch(`/api/fetch-ical?url=${encodeURIComponent(url)}`)
            if (res.ok) iCalBlocked = parseICal(await res.text())
          } catch (_) {}
        }

        // 2. Firebase blocked dates for this room
        const firebaseBlocked = new Set()
        const typeNumber = type.replace("room", "")
        Object.values(firebaseData).forEach((booking) => {
          if (!booking.selectedRooms || !Array.isArray(booking.selectedRooms)) return
          const hasRoom = booking.selectedRooms.some((r) => {
            const id = String(r.id || "")
            return id === typeNumber || id === type
          })
          if (!hasRoom || !booking.checkIn || !booking.checkOut) return
          const start = new Date(booking.checkIn)
          const end = new Date(booking.checkOut)
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            firebaseBlocked.add(d.toISOString().slice(0, 10))
          }
        })

        // 3. Check if requested range is blocked
        const combined = new Set([...iCalBlocked, ...firebaseBlocked])
        const blocked = isRangeBlocked(combined, checkIn, checkOut)
        setRoomStatus((prev) => ({ ...prev, [type]: blocked ? "unavailable" : "available" }))
      } catch (_) {
        setRoomStatus((prev) => ({ ...prev, [room.type]: "available" }))
      }
    })
  }, [checkIn, checkOut, firebaseData])

  const handleSelectRoom = (room) => {
    router.push({
      pathname: "/reservation",
      query: { checkIn, checkOut, adults, children, roomType: room.type },
    })
  }

  const allDone = roomOptions.length > 0 && roomOptions.every((r) => roomStatus[r.type] && roomStatus[r.type] !== "loading")
  const availableRooms = roomOptions.filter((r) => roomStatus[r.type] === "available")
  const unavailableRooms = roomOptions.filter((r) => roomStatus[r.type] === "unavailable")

  const roomMeta = (r) => {
    const parts = []
    if (r.maxAdults) parts.push(`Up to ${r.maxAdults} adults`)
    if (r.maxChildren != null) parts.push(r.maxChildren === 0 ? "No children" : `Up to ${r.maxChildren} children`)
    if (typeof r.ac === "boolean") parts.push(r.ac ? "Air conditioned" : "Fan only")
    return parts.join(" · ")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6", paddingTop: 80 }}>
      {/* Header bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(11,18,32,0.08)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#555", marginBottom: 10, padding: 0, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}
          >
            ← Back
          </button>
          <h1 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#0b1220" }}>
            Available Rooms
          </h1>
          {ci && co && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ background: "#f1f5f9", padding: "4px 12px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                {format(ci, "EEE, MMM dd yyyy")} → {format(co, "EEE, MMM dd yyyy")}
              </span>
              <span style={{ background: "#f1f5f9", padding: "4px 12px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                {nights} night{nights !== 1 ? "s" : ""}
              </span>
              <span style={{ background: "#f1f5f9", padding: "4px 12px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                {adults} adult{Number(adults) !== 1 ? "s" : ""}
                {Number(children) > 0 ? `, ${children} child${Number(children) !== 1 ? "ren" : ""}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>

        {/* Loading state */}
        {!allDone && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#666" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Checking availability for all rooms...</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {roomOptions.map((r) => (
                <span
                  key={r.type}
                  style={{
                    padding: "4px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 20,
                    background:
                      roomStatus[r.type] === "available" ? "#dcfce7" :
                      roomStatus[r.type] === "unavailable" ? "#fee2e2" :
                      "#f1f5f9",
                    color:
                      roomStatus[r.type] === "available" ? "#166534" :
                      roomStatus[r.type] === "unavailable" ? "#991b1b" :
                      "#64748b",
                  }}
                >
                  {roomStatus[r.type] === "loading" || !roomStatus[r.type]
                    ? `Checking ROOM-${r.roomNumber}...`
                    : `ROOM-${r.roomNumber} ${roomStatus[r.type]}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {allDone && (
          <>
            {availableRooms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
                <h2 style={{ fontWeight: 700, color: "#0b1220", marginBottom: 8 }}>No rooms available</h2>
                <p style={{ color: "#666", marginBottom: 24 }}>All rooms are booked for your selected dates. Please try different dates.</p>
                <button
                  onClick={() => router.back()}
                  style={{ background: "linear-gradient(90deg,#ff7a59,#ffbf69)", border: "none", padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  ← Change Dates
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 20 }}>
                  {availableRooms.length} room{availableRooms.length !== 1 ? "s" : ""} available for your dates
                </h2>

                {/* Available rooms */}
                <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
                  {availableRooms.map((r) => (
                    <div
                      key={r.type}
                      style={{
                        background: "#fff",
                        border: "1px solid rgba(11,18,32,0.08)",
                        display: "flex",
                        flexWrap: "wrap",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(11,18,32,0.04)",
                      }}
                    >
                      {/* Room image */}
                      <div
                        style={{
                          width: 220,
                          minHeight: 150,
                          flexShrink: 0,
                          backgroundImage: `url(${r.img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />

                      {/* Room details */}
                      <div style={{ flex: 1, padding: "18px 22px", minWidth: 200, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10 }}>
                              AVAILABLE
                            </span>
                          </div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: "#0b1220", marginBottom: 4 }}>
                            ROOM-{r.roomNumber}. {r.title}
                          </div>
                          <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
                            {roomMeta(r)}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#ff7a59" }}>
                            ${r.price}
                            <span style={{ fontWeight: 400, fontSize: 12, color: "#888", marginLeft: 4 }}>/ night</span>
                            {nights > 0 && (
                              <span style={{ marginLeft: 14, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                                Total: ${(r.price * nights).toFixed(2)} for {nights} night{nights !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <button
                            onClick={() => handleSelectRoom(r)}
                            style={{
                              background: "linear-gradient(90deg,#ff7a59,#ffbf69)",
                              border: "none",
                              padding: "10px 28px",
                              fontWeight: 700,
                              fontSize: 14,
                              cursor: "pointer",
                              color: "#000",
                            }}
                          >
                            Select This Room →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Unavailable rooms */}
                {unavailableRooms.length > 0 && (
                  <>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", marginBottom: 12 }}>
                      {unavailableRooms.length} room{unavailableRooms.length !== 1 ? "s" : ""} unavailable for your dates
                    </h3>
                    <div style={{ display: "grid", gap: 10 }}>
                      {unavailableRooms.map((r) => (
                        <div
                          key={r.type}
                          style={{
                            background: "#fafafa",
                            border: "1px solid rgba(11,18,32,0.06)",
                            display: "flex",
                            flexWrap: "wrap",
                            overflow: "hidden",
                            opacity: 0.65,
                          }}
                        >
                          <div
                            style={{
                              width: 120,
                              minHeight: 80,
                              flexShrink: 0,
                              backgroundImage: `url(${r.img})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              filter: "grayscale(70%)",
                            }}
                          />
                          <div style={{ flex: 1, padding: "12px 16px", minWidth: 160 }}>
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10 }}>
                                UNAVAILABLE
                              </span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>
                              ROOM-{r.roomNumber}. {r.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#888" }}>{roomMeta(r)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          div[style*="width: 220px"] {
            width: 100% !important;
            min-height: 180px !important;
          }
        }
      `}</style>
    </div>
  )
}
