import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingModal from "../components/BookingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "./ArtistProfile.css";
import { apiBase, fetchJSON } from "../utils/api";
import { getUser } from "../utils/auth";
import { DEFAULT_AVATAR_SVG } from "../utils/avatar";

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [artist, setArtist] = useState(location.state?.artist || null);
  const [loading, setLoading] = useState(!location.state?.artist);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const breadcrumbs = useMemo(() => [
    { label: "Home", to: "/" },
    { label: "Find Artists", to: "/search" },
    { label: artist?.name || "Artist", to: null },
  ], [artist?.name]);

  useEffect(() => {
    let mounted = true;
    if (artist) return; // already provided via navigation state
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Fallback: fetch a reasonable batch and find by id client-side
        const data = await fetchJSON(`${apiBase()}/artists?limit=200`);
        const items = Array.isArray(data.items) ? data.items : [];
        const found = items.find((a) => String(a.id) === String(id));
        if (!mounted) return;
        if (!found) throw new Error("Artist not found");
        setArtist(found);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load artist");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, artist]);

  return (
    <div className="app-container">
      <Navbar />

      <main className="profile-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="crumb">
              {b.to ? (
                <a href={b.to} onClick={(e)=>{ e.preventDefault(); navigate(b.to); }}>{b.label}</a>
              ) : (
                <span aria-current="page">{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="sep">/</span>}
            </span>
          ))}
        </nav>

        {loading && <div className="profile-loading">Loading profile…</div>}
        {error && !loading && <div className="profile-error">{error}</div>}

        {!loading && !error && artist && (
          <section className="profile-hero">
            <div className="profile-media">
              <img
                src={artist.img || artist.img_url || '/public/avt.png'}
                alt={artist.name}
                className="profile-avatar"
              />
            </div>
            <div className="profile-summary">
              <h1 className="profile-name">{artist.name}</h1>
              {artist.role && <div className="profile-role">{artist.role}</div>}
              <div className="profile-meta">
                {(artist.location || "").trim() && <span>{artist.location}</span>}
                {(artist.service || "").trim() && <span className="dot">•</span>}
                {(artist.service || "").trim() && <span className="badge">{artist.service}</span>}
                {(artist.rating != null) && (
                  <>
                    <span className="dot">•</span>
                    <span>{Number(artist.rating).toFixed(1)} ★</span>
                    <span className="muted">({artist.reviews || 0})</span>
                  </>
                )}
              </div>
              {(artist.budget_min != null || artist.budget_max != null) && (
                <div className="profile-rates">
                  <span className="label">Typical range</span>
                  <span className="value">
                    {artist.budget_min != null ? `₹${Number(artist.budget_min).toLocaleString()}` : "—"}
                    {artist.budget_max != null ? ` - ₹${Number(artist.budget_max).toLocaleString()}` : ""}
                  </span>
                </div>
              )}
              <div className="profile-actions">
                <Button 
                  className="btn btn-purple" 
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    setShowBookingModal(true);
                  }}
                >
                  Request Booking
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && artist && (
          <section className="profile-content">
            <div className="profile-about">
              <Card>
                <CardContent className="card-content">
                  <h2 className="section-title">About</h2>
                  <p className="about-text">
                    {artist.bio || "This artist hasn’t added a bio yet."}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="profile-side">
              <Card>
                <CardContent className="card-content">
                  <h3 className="side-title">Key Details</h3>
                  <ul className="kv-list">
                    <li><span>Location</span><strong>{artist.location || "—"}</strong></li>
                    <li><span>Category</span><strong>{artist.service || "—"}</strong></li>
                    <li><span>Availability</span><strong>{artist.availability || "—"}</strong></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {showBookingModal && artist && (
        <BookingModal
          artist={artist}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            setBookingSuccess(true);
            setTimeout(() => setBookingSuccess(false), 5000);
          }}
        />
      )}

      {bookingSuccess && (
        <div className="success-toast">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span>Booking request sent successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
