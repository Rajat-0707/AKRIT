import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../utils/auth";

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const serviceCategories = [
    { id: "singer", name: "Vocalists", description: "Professional singers for events" },
    { id: "dance", name: "Dance Groups", description: "Choreographed performances" },
    { id: "choreographer", name: "Choreographers", description: "Creative movement directors" },
    { id: "teacher", name: "Vocal Coaches", description: "Professional training services" }
  ];

  // Helper to synchronize auth state from localStorage
  const syncAuth = () => {
    const token = getToken();
    const userRaw = (() => { try { return localStorage.getItem("ac_user"); } catch { return null; } })();
    setIsAuthed(!!token);
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        setUserName(u?.name || "");
        setUserRole(u?.role || "");
      } catch {
        setUserName("");
        setUserRole("");
      }
    } else {
      setUserName("");
      setUserRole("");
    }
  };

  // Load auth state on mount and when storage changes (cross-tab)
  useEffect(() => {
    syncAuth();
    const onStorage = (e) => {
      if (e.key === "ac_jwt" || e.key === "ac_user") {
        syncAuth();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also resync on route changes (same-tab login flow)
  useEffect(() => {
    syncAuth();
  }, [location.pathname]);

  const doLogout = () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (!ok) return;
    clearToken();
    try { localStorage.removeItem("ac_user"); } catch {}
    setIsAuthed(false);
    setUserName("");
    setUserRole("");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-title" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
 <img src="/logo.png" alt="Akrit logo" style={{ height: 36, width: 36, objectFit: "contain", marginRight: 8 , display: "inline-block", backgroundColor: "transparent"}} />        Akrit
      </Link>

      <div className="navbar-menu desktop-menu">
        {isAuthed && userRole !== 'artist' ? (
          <>
            <button
              className={`nav-item ${isHome && document.getElementById('find-artists') ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => {
                    const el = document.getElementById("find-artists");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                } else {
                  const el = document.getElementById("find-artists");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Find Artists
            </button>
            <Link 
              to="/my-requests"
              className={`nav-item ${location.pathname === '/my-requests' ? 'active' : ''}`}
            >
              My Requests
            </Link>
          </>
        ) : !isAuthed ? (
          <Link 
            to="/"
            className={`nav-item ${isHome ? "active" : ""}`}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Home
          </Link>
        ) : null}
        {isAuthed && userRole === 'artist' && (
          <>
            <button
              className={`nav-item ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("artist-dashboard");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Dashboard
            </button>
            <Link
              to="/received-bookings"
              className={`nav-item ${location.pathname === '/received-bookings' ? 'active' : ''}`}
            >
              View Bookings
            </Link>
          </>
        )}

        {/* About Us and Contact Us for all users */}
        {isHome ? (
          <>
            <a
              href="#about"
              className={`nav-item ${false ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              About Us
            </a>
            <a
              href="#contact"
              className={`nav-item ${false ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Contact Us
            </a>
          </>
        ) : (
          <>
            <Link to="/" className="nav-item">About Us</Link>
            <Link to="/" className="nav-item">Contact Us</Link>
          </>
        )}

        <div className="dropdown"
             onMouseLeave={() => setShowServicesDropdown(false)}>
          <button
            className={`nav-item ${location.pathname.startsWith('/services') ? 'active' : ''} flex items-center`}
            onClick={() => setShowServicesDropdown((s) => !s)}
            onMouseEnter={() => setShowServicesDropdown(true)}
            aria-expanded={showServicesDropdown}
            aria-haspopup="true"
            aria-controls="services-dropdown"
            style={{ display: isAuthed && userRole === 'artist' ? 'none' : 'flex' }}
          >
            Services
            <span className="dropdown-arrow ml-1">▼</span>
          </button>
          <div
            id="services-dropdown"
            className={`dropdown-menu ${showServicesDropdown ? 'show' : ''}`}
            role="menu"
          >
            {serviceCategories.map((category) => (
              <Link
                key={category.id}
                to={`/services/${category.id}`}
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowServicesDropdown(false);
                }}
                role="menuitem"
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-muted">{category.description}</div>
              </Link>
            ))}
          </div>
        </div>

        {isAuthed ? (
          <>
            {userName && userRole !== 'artist' && <span className="nav-item" style={{ opacity: 0.8 }}>Hi, {userName}</span>}
            <button className="nav-item" onClick={doLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-item">Login</Link>
        )}
      </div>

      <button
        className="mobile-menu-button"
        onClick={() => setShowMobileMenu((s) => !s)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${showMobileMenu ? "active" : ""}`}></span>
        <span className={`hamburger-line ${showMobileMenu ? "active" : ""}`}></span>
        <span className={`hamburger-line ${showMobileMenu ? "active" : ""}`}></span>
      </button>

      {showMobileMenu && (
        <div className="mobile-menu">
          {isAuthed ? (
            <>
              {userRole !== 'artist' && (
                <>
                  <button
                    className="mobile-nav-item"
                    onClick={() => {
                      setShowMobileMenu(false);
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => {
                          const el = document.getElementById("find-artists");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      } else {
                        const el = document.getElementById("find-artists");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                  >
                    Find Artists
                  </button>
                  <Link 
                    className="mobile-nav-item" 
                    to="/my-requests" 
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Requests
                  </Link>
                </>
              )}
              {userRole === 'artist' && (
                <>
                  <button
                    className="mobile-nav-item"
                    onClick={() => {
                      setShowMobileMenu(false);
                      const el = document.getElementById("artist-dashboard");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                  >
                    Dashboard
                  </button>
                  <Link
                    className="mobile-nav-item"
                    to="/received-bookings"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    View Bookings
                  </Link>
                </>
              )}
            </>
          ) : (
            <Link className="mobile-nav-item" to="/" onClick={() => setShowMobileMenu(false)}>Home</Link>
          )}
          <Link className="mobile-nav-item" to="/services/singer" onClick={() => setShowMobileMenu(false)} style={{ display: isAuthed && userRole === 'artist' ? 'none' : 'block' }}>Services</Link>
          {/* About Us and Contact Us for all users in mobile */}
          <button
            className="mobile-nav-item"
            onClick={() => {
              setShowMobileMenu(false);
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById("about");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              } else {
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            About Us
          </button>
          <button
            className="mobile-nav-item"
            onClick={() => {
              setShowMobileMenu(false);
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById("contact");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              } else {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            Contact Us
          </button>
          {isAuthed ? (
            <button className="mobile-nav-item" onClick={() => { setShowMobileMenu(false); doLogout(); }}>Logout</button>
          ) : (
            <Link className="mobile-nav-item" to="/login" onClick={() => setShowMobileMenu(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
