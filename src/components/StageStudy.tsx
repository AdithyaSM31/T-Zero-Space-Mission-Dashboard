"use client";
import { useState } from "react";
export function StageStudy() {
  const [stage, setStage] = useState(0);
  return (
    <section className="stage-study">
      <div>
        <span className="eyebrow">SATURN V / HOW STAGING WORKS</span>
        <h2>Go further by letting go.</h2>
        <p>
          As propellant is used, a launch vehicle sheds stages to reduce the
          mass its remaining engines must accelerate.
        </p>
        <div className="stage-buttons">
          {[
            "Assembled",
            "First stage separation",
            "Second stage separation",
          ].map((label, index) => (
            <button
              key={label}
              className={stage === index ? "active" : ""}
              aria-pressed={stage === index}
              onClick={() => setStage(index)}
            >
              {String(index + 1).padStart(2, "0")} {label}
            </button>
          ))}
        </div>
        <p className="method-note">
          Educational schematic. Distances, timing, and component proportions
          are illustrative. Apollo spacecraft remains above the third stage.
        </p>
      </div>
      <div
        className={`stage-diagram step-${stage}`}
        role="img"
        aria-label={
          [
            "Three Saturn V stages assembled below the Apollo spacecraft.",
            "The first stage falls away while the second and third stages continue upward.",
            "The second stage separates, leaving the third stage and spacecraft.",
          ][stage]
        }
      >
        <div className="schematic-spacecraft">
          <span>APOLLO</span>
        </div>
        <div className="schematic-third">
          <span>S-IVB / THIRD STAGE</span>
        </div>
        <div className="schematic-second">
          <span>S-II / SECOND STAGE</span>
        </div>
        <div className="schematic-first">
          <span>S-IC / FIRST STAGE</span>
        </div>
      </div>
    </section>
  );
}
