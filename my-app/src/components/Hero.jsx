import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { getUser } from "../utils/auth";

const Hero = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  return (
    <section className="hero-section">
      <h2 className="hero-title">
        {user?.role === 'artist' ? "Manage Your Artist Profile" : "Find Artists Near You"}
      </h2>
      <p className="hero-description">
        {user?.role === 'artist'
          ? "Update your profile, manage bookings, and grow your artistic career with our platform."
          : "Connect with professional performers, choreographers, and vocal coaches. Elevate your events with verified industry talent or advance your artistic career."
        }
      </p>
      <div className="hero-buttons">
        {!user ? (
          <>
            <Link to="/auth">
              <Button size="lg" className="btn-btn-lg">Find Artist</Button>
            </Link>
            <Link to="/auth/artist">
              <Button size="lg" className="btn-btn-ghost btn-lg">Join as Artist</Button>
            </Link>
          </>
        ) : user?.role === 'artist' ? (
          <button
            className="btn-btn-lg"
            onClick={() => {
              const el = document.getElementById("artist-dashboard");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            style={{
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              border: "none",
              color: "white",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            View My Profile
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default Hero;
