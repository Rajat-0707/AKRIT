import React from 'react';
import { Link } from 'react-router-dom';
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <section className="aboutus-section">
      <div className="aboutus-container">
        <div className="aboutus-left">
          <div className="aboutus-card aboutus-card--tall">
            <img src="/public/bgmain.png" alt="Showcase 1" />
          </div>
          <div className="aboutus-card aboutus-card--wide">
            <img src="/public/bgmain.png" alt="Showcase 2" />
          </div>
          <div className="aboutus-badge">
            
            <div className="badge-sub">connecting artists and organizers</div>
          </div>
        </div>
        <div className="aboutus-right">
          <span className="aboutus-eyebrow">A BIT</span>
          <h2 className="aboutus-title">About Us</h2>
          <p className="aboutus-text">
            We connect verified professional artists with organizers who value quality and reliability.
            Discover profiles, portfolios, and seamless booking tailored for exceptional events.
          </p>
          <Link className="btn btn-purple aboutus-cta" to="/about">Explore More</Link>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
