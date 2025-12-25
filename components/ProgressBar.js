import React from "react"

const steps = ["Choose Room", "Guest Details"]

export default function ProgressBar({ currentStep = 1 }) {
  const clamped = Math.min(Math.max(currentStep, 1), steps.length)
  const progressPct = ((clamped - 1) / (steps.length - 1)) * 100

  return (
    <div className="pb-root">
      <div className="pb-track">
        <div className="pb-fill" style={{ width: `${progressPct}%` }} />
        {steps.map((label, idx) => {
          const stepNum = idx + 1
          const done = clamped > stepNum
          const active = clamped === stepNum
          return (
            <div key={label} className="pb-stop" style={{ left: `${(idx / (steps.length - 1)) * 100}%` }}>
              <div className={`pb-dot ${done ? "done" : ""} ${active ? "active" : ""}`}>{done ? "✓" : stepNum}</div>
              <div className="pb-label">{label}</div>
            </div>
          )
        })} 
      </div>
      <style jsx>{`
        .pb-root {
          margin: 24px 0 32px;
          padding: 0 48px; /* keep edge labels inside view */
        }
        .pb-track {
          position: relative;
          height: 6px;
          background: #e5e7eb;
          border-radius: 999px;
        }
        .pb-fill {
          position: absolute;
          height: 100%;
          background: linear-gradient(135deg, #667eea, #10b981);
          border-radius: 999px;
          transition: width 0.35s ease;
        }
        .pb-stop {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          width: 90px;
        }
        .pb-dot {
          width: 38px;
          height: 38px;
          margin: 0 auto 8px;
          border-radius: 50%;
          border: 3px solid #d1d5db;
          background: #fff;
          display: grid;
          place-items: center;
          font-weight: 700;
          color: #9ca3af;
          transition: all 0.3s ease;
        }
        .pb-dot.active {
          border-color: #667eea;
          color: #667eea;
          box-shadow: 0 8px 18px rgba(102, 126, 234, 0.25);
        }
        .pb-dot.done {
          border-color: #10b981;
          background: #10b981;
          color: #fff;
          box-shadow: 0 8px 18px rgba(16, 185, 129, 0.25);
        }
        .pb-label {
          font-size: 13px;
          color: #4b5563;
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .pb-root {
            padding: 0 24px; /* tighter padding on small screens */
          }
          .pb-stop {
            width: 70px;
          }
          .pb-dot {
            width: 34px;
            height: 34px;
            font-size: 13px;
          }
          .pb-label {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
