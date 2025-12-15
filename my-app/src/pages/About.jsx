import React from "react";

const About = () => {
  return (
    <section className="about-section">
      <div className="section-container">
         <img src="/logo.png" alt="Akrit logo" style={{ height: 48, width: 48, objectFit: "contain", marginBottom: 12 }} />
        <h2>About Akrit</h2>
        <div className="about-content">
          <div className="about-image">
            <img src="/logo.png" alt="Akrit showcase" />
          </div>
          <div className="about-text">
            <h3>Our Mission</h3>
            <p>
              Akrit was founded with a simple yet powerful vision: to create a seamless
              platform where professional artists can showcase their talents and connect
              with clients who value quality performances. We believe that every event
              deserves exceptional artistry, and every talented performer deserves
              meaningful opportunities.
            </p>

            <h3>What We Offer</h3>
            <p>
              For event organizers: Access to verified professional performers, an easy
              booking system, and quality assurance for your events.
            </p>
            <p>
              For artists: Professional profile showcase, direct client connections, and
              opportunities to grow your artistic career.
            </p>

            <h3>Our Values</h3>
            <p>
              We are committed to excellence, authenticity, and fostering genuine
              connections within the artistic community. Every artist on our platform is
              carefully verified to ensure the highest standards of professionalism and
              talent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
