import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiBase } from "./utils/api";
import Home from "./pages/Home";
import About from "./pages/About";
import AuthSelection from "./pages/AuthSelection";
import ClientAuth from "./pages/ClientAuth";
import ArtistAuth from "./pages/ArtistAuth";
import ServicePage from "./pages/ServicePage";
import SearchArtists from "./pages/SearchArtists";
import Login from "./pages/Login";
import ArtistProfile from "./pages/ArtistProfile";
import ArtistDashboard from "./pages/ArtistDashboard";
import MyRequests from "./pages/MyRequests";
import ReceivedBookings from "./pages/ReceivedBookings";
import "./css/App.css";
import { getToken, clearToken } from "./utils/auth";

const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const globalObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

    const selectors = [
      '.card', '.featured-card', '.compact-artist-card',
      '.hero-title', '.hero-description', '.hero-buttons',
      '.service-header', '.service-hero h1', '.service-hero p',
      '.section-header', '.filter-bar', '.footer', '.aboutus-card',
      '.booking-card', '.pricing-section', '.artist-info',
      '.booking-details', '.client-message', '.your-response',
      '.booking-message', '.artist-response', '.dash-panel',
      '.account-type-card', '.login-form-container'
    ].join(', ');
    
    const observeElements = () => {
      document.querySelectorAll(selectors).forEach(el => {
        if (!el.classList.contains('is-visible')) {
          globalObserver.observe(el);
        }
      });
    };

    const mutObserver = new MutationObserver(() => {
      observeElements();
    });
    
    mutObserver.observe(document.body, { childList: true, subtree: true });
    observeElements();
    
    return () => {
      mutObserver.disconnect();
      globalObserver.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setAuthChecked(true);
      return;
    }

    fetch(`${apiBase()}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error("Invalid token");
        try {
          localStorage.setItem("ac_user", JSON.stringify(data.user));
        } catch {}
      })
      .catch(() => {
        clearToken();
        try {
          localStorage.removeItem("ac_user");
        } catch {}
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);
  if (!authChecked) {
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthSelection />} />
      <Route path="/auth/client" element={<ClientAuth />} />
      <Route path="/auth/artist" element={<ArtistAuth />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ArtistDashboard />} />
      <Route path="/my-requests" element={<MyRequests />} />
      <Route path="/received-bookings" element={<ReceivedBookings />} />
      <Route path="/services/:serviceId" element={<ServicePage />} />
      <Route path="/search" element={<SearchArtists />} />
      <Route path="/artists/:id" element={<ArtistProfile />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default App;
