import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "../css/ServicePage.css";
import { apiBase, fetchJSON } from "../utils/api";
import { getUser } from "../utils/auth";
import { getAvatarSrc, getInitialsAvatarSVG } from "../utils/avatar";

const serviceMeta = {
  singer: {
    name: 'Professional Vocalists',
    description: 'Talented singers for weddings, corporate events, and special celebrations',
    icon: '🎤',
  },
  dance: {
    name: 'Dance Performance Groups',
    description: 'Dynamic dance troupes specializing in various styles and cultural performances',
    icon: '💃',
  },
  choreographer: {
    name: 'Creative Choreographers',
    description: 'Expert choreographers who create stunning dance sequences and performances',
    icon: '🎭',
  },
  teacher: {
    name: 'Vocal Coaches & Instructors',
    description: 'Professional vocal trainers and music educators for all skill levels',
    icon: '🎼',
  }
};

function ArtistAvatar({ artist, size = 48 }) {
  const [err, setErr] = useState(false);
  const src = getAvatarSrc(artist);
  const fallback = getInitialsAvatarSVG(artist.name);
  return (
    <img
      src={err ? fallback : src}
      alt={artist.name}
      className="artist-avatar-img"
      style={{ width: size, height: size }}
      onError={() => !err && setErr(true)}
      loading="lazy"
    />
  );
}

export default function ServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = serviceMeta[serviceId];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const user = getUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("service", serviceId);
        params.set("limit", "30");
        if (sortBy !== "featured") {
          params.set("sort", sortBy);
        }
        const url = `${apiBase()}/api/artists?${params.toString()}`;
        const data = await fetchJSON(url);
        if (!mounted) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load artists");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [serviceId, sortBy]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  if (!service) {
    return (
      <div className="service-not-found">
        <div className="container">
          <h1>Service Not Found</h1>
          <p>The requested service could not be found.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="service-page">
      <div className="back-nav">
        <div className="container">
          <Link to="/" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Services</span>
          </Link>
        </div>
      </div>

      <main className="service-main">
        <div className="container">
          <div className="content-header">
            <div className="header-info">
              <h2>Available Artists</h2>
              <p>Browse and connect with talented professionals in your area</p>
            </div>
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="budget_asc">Price: Low to High</option>
                <option value="budget_desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading amazing artists...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="btn btn-primary">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {items.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h3>No artists found</h3>
                  <p>There are currently no {service.name.toLowerCase()} available in your area.</p>
                  <p>Check back later or try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="artists-grid">
                    {items.map((artist) => (
                      <article key={artist.id} className="artist-card">
                        <div className="card-image-container">
                          <ArtistAvatar artist={artist} size={220} />
                          <div className="card-overlay">
                            <Button
                              className="quick-view-btn"
                              onClick={() => navigate(`/artists/${artist.id}`, { state: { artist } })}
                            >
                              Quick View
                            </Button>
                          </div>
                        </div>

                        <CardContent className="card-content">
                          <div className="artist-header">
                            <div className="artist-header-left">
                              <ArtistAvatar artist={artist} size={40} />
                              <h3 className="artist-name">{artist.name}</h3>
                            </div>
                            <div className={`service-badge ${serviceId}`}>
                              {service.name}
                            </div>
                          </div>

                          <div className="artist-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {artist.city || artist.location || 'Location not specified'}
                          </div>

                          <div className="pricing-section">
                            <div className="price-label">Starting from</div>
                            <div className="price-value">
                              {(() => {
                                const minB = artist.budget_min != null ? Number(artist.budget_min) : null;
                                const maxB = artist.budget_max != null ? Number(artist.budget_max) : null;
                                if (minB != null && maxB != null) return `₹${minB.toLocaleString()} - ₹${maxB.toLocaleString()}`;
                                if (minB != null) return `₹${minB.toLocaleString()}`;
                                if (maxB != null) return `₹${maxB.toLocaleString()}`;
                                return 'Contact for pricing';
                              })()}
                            </div>
                          </div>

                          {(artist.rating != null || artist.reviews != null) && (
                            <div className="rating-section">
                              {artist.rating != null && (
                                <div className="rating">
                                  ⭐ {artist.rating.toFixed(1)}
                                </div>
                              )}
                              {artist.reviews != null && (
                                <div className="reviews">
                                  ({artist.reviews} review{artist.reviews !== 1 ? 's' : ''})
                                </div>
                              )}
                            </div>
                          )}

                          <div className="card-actions">
                            <Button
                              variant="outline"
                              className="action-btn secondary"
                              onClick={() => navigate(`/artists/${artist.id}`, { state: { artist } })}
                            >
                              View Profile
                            </Button>
                            <Button
                              className="action-btn primary"
                              onClick={() => {
                                if (!user) {
                                  navigate('/login');
                                  return;
                                }
                                navigate(`/artists/${artist.id}`, { state: { artist } });
                              }}
                            >
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </article>
                    ))}
                  </div>

                  <div className="load-more-container">
                    <Button className="load-more-btn">
                      Load More Artists
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
