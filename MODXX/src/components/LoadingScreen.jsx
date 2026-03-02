import React, { useEffect, useState } from "react";
import "./LoadingScreen.css";

export default function LoadingScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // After 1.8s start fade-out, then call onDone to unmount
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const doneTimer = setTimeout(() => onDone && onDone(), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`modx-loader-overlay${fadeOut ? " modx-loader-fade-out" : ""}`}>
      <div className="modx-loader-content">
        <img
          src="/modx_logo.jpeg"
          alt="MODX Logo"
          className="modx-loader-logo"
        />
        <div className="modx-loader-bar-track">
          <div className="modx-loader-bar-fill" />
        </div>
        <p className="modx-loader-tagline">Loading the future of collaboration…</p>
      </div>
    </div>
  );
}
