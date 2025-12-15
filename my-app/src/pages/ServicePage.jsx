import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "./ServicePage.css";
import { apiBase, fetchJSON } from "../utils/api";
import { getUser } from "../utils/auth";

// Enhanced service meta with more details
const serviceMeta = {
  singer: {
    name: 'Professional Vocalists',
    description: 'Talented singers for weddings, corporate events, and special celebrations',
    icon: '🎤',
    color: 'from-purple-500 to-pink-500'
  },
  dance: {
    name: 'Dance Performance Groups',
    description: 'Dynamic dance troupes specializing in various styles and cultural performances',
    icon: '💃',
    color: 'from-blue-500 to-teal-500'
  },
  choreographer: {
    name: 'Creative Choreographers',
    description: 'Expert choreographers who create stunning dance sequences and performances',
    icon: '🎭',
    color: 'from-green-500 to-emerald-500'
  },
  teacher: {
    name: 'Vocal Coaches & Instructors',
    description: 'Professional vocal trainers and music educators for all skill levels',
    icon: '🎼',
    color: 'from-orange-500 to-red-500'
  }
};

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
      {/* Back Navigation */}
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

      {/* Hero Section */}
      {/* <section className={`service-hero ${service.color}`}>
        <div className="container">
          <div className="hero-content">
            <div className="service-icon">{service.icon}</div>
            <h1>{service.name}</h1>
            <p>{service.description}</p>
            <div className="hero-stats">
              <span className="stat-item">
                <strong>{items.length}</strong>
                <span>Artists Available</span>
              </span>
            </div>
          </div>
        </div>
      </section> */}

      {/* Main Content */}
      <main className="service-main">
        <div className="container">
          {/* Header with Sort */}
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

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading amazing artists...</p>
            </div>
          )}

          {/* Error State */}
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

          {/* Artists Grid */}
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
                          <img
                            src={artist.img || artist.img_url || '/public/profile.png'}
                            alt={artist.name}
                            className="artist-image"
                          />
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
                            <h3 className="artist-name">{artist.name}</h3>
                            <div className={`service-badge ${serviceId}`}>
                              {service.name}
                            </div>
                          </div>

                          <div className="artist-location">
                            📍 {artist.city || artist.location || 'Location not specified'}
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

                  {/* Load More Button */}
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
