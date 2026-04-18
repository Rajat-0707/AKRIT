import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../css/auth.css";

const AuthSelection = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const options = [
    {
      id: "client",
      to: "/auth/client",
      title: "Event Organizer",
      description: "Find and book professional talent for your events",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      benefits: [
        "Browse verified performers",
        "Direct booking system",
        "Event management tools",
      ],
    },
    {
      id: "artist",
      to: "/auth/artist",
      title: "Professional Artist",
      description: "Showcase your talent and connect with clients",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      ),
      benefits: [
        "Professional profile",
        "Portfolio showcase",
        "Direct client connections",
      ],
    },
  ];

  const handleContinue = () => {
    if (!selected) return;
    const option = options.find((o) => o.id === selected);
    if (option) navigate(option.to);
  };

  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-selection-wrapper">
        <div className="auth-selection-container">
          <div className="auth-selection-header">
            <h2 className="auth-title">Join Akrit</h2>
            <p className="auth-subtitle">Choose your account type to get started</p>
          </div>

          <div className="account-type-cards">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`account-type-card${selected === opt.id ? " selected" : ""}`}
                onClick={() => setSelected(opt.id)}
                aria-pressed={selected === opt.id}
              >
                <div className="account-icon-wrap">{opt.icon}</div>
                <h3 className="account-card-title">{opt.title}</h3>
                <p className="account-card-desc">{opt.description}</p>
                <ul className="card-benefits">
                  {opt.benefits.map((b, i) => (
                    <li key={i}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                <div className="selection-indicator">
                  {selected === opt.id ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary-purple)" stroke="none"><circle cx="12" cy="12" r="12"/><polyline points="17 8 10 16 7 13" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <div className="selection-circle" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`continue-btn btn btn-purple btn-lg${!selected ? " disabled" : ""}`}
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthSelection;
