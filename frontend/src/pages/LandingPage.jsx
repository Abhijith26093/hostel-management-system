import React from "react";
import "./LandingPage.css";
import logo from "../assets/logo.png";

function LandingPage({ onJoin }) {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <button className="join-community-btn" onClick={onJoin}>
          Join Community
        </button>
      </header>
      <main className="landing-main">
        <div className="logo">
          <img src={logo} alt="StayMate Logo" />
        </div>
        <h1>
          Join the Future of Hostel Living. <span className="highlight">Together.</span>
        </h1>
        <p>
          StayMate is a thriving ecosystem for students and hostel management to connect, resolve issues, and stay updated.
        </p>
        <button className="join-us-btn" onClick={onJoin}>
          JOIN US ➔
        </button>
      </main>
    </div>
  );
}

export default LandingPage;