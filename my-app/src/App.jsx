import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
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
import "./App.css";
import { getToken, clearToken } from "./utils/auth";

const App = () => {
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${apiBase()}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error("Invalid token");
        // Cache lightweight user profile for UI usage
        try { localStorage.setItem("ac_user", JSON.stringify(data.user)); } catch {}
      })
      .catch(() => {
        clearToken();
        try { localStorage.removeItem("ac_user"); } catch {}
      });
  }, []);
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
