import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "./auth.css";

const AuthSelection = () => {
  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-wrapper" style={{ gridTemplateColumns: "1fr" }}>
        <section className="auth-card" style={{ maxWidth: 820, margin: "0 auto" }}>
          <div className="auth-header" style={{ textAlign: "center" }}>
            <h2 className="auth-title">Join Akrit</h2>
            <p className="auth-subtitle">Choose your account type to get started</p>
          </div>

          <div className="account-type-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Link className="account-type-card" to="/auth/client" style={{
              border: "1px solid rgba(17,24,39,0.08)", borderRadius: 16, padding: 20, textDecoration: "none", color: "inherit",
              background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.06)"
            }}>
              <div className="account-icon" style={{ fontSize: 28 }}>🎭</div>
              <h3 style={{ margin: "10px 0 6px" }}>Event Organizer</h3>
              <p style={{ color: "#4b5563", margin: 0 }}>Find and book professional talent for your events</p>
              <ul style={{ marginTop: 10, color: "#6b7280" }}>
                <li>Browse verified performers</li>
                <li>Direct booking system</li>
                <li>Event management tools</li>
              </ul>
            </Link>

            <Link className="account-type-card" to="/auth/artist" style={{
              border: "1px solid rgba(17,24,39,0.08)", borderRadius: 16, padding: 20, textDecoration: "none", color: "inherit",
              background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.06)"
            }}>
              <div className="account-icon" style={{ fontSize: 28 }}>🎤</div>
              <h3 style={{ margin: "10px 0 6px" }}>Professional Artist</h3>
              <p style={{ color: "#4b5563", margin: 0 }}>Showcase your talent and connect with clients</p>
              <ul style={{ marginTop: 10, color: "#6b7280" }}>
                <li>Professional profile</li>
                <li>Portfolio showcase</li>
                <li>Direct client connections</li>
              </ul>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AuthSelection;
