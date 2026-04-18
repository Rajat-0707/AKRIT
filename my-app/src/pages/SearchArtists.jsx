import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import "../css/SearchArtists.css";
import { apiBase, fetchJSON } from "../utils/api";
import { getAvatarSrc, getInitialsAvatarSVG } from "../utils/avatar";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";

const categories = [
  { id: "singer", name: "Vocalists" },
  { id: "dance", name: "Dance Groups" },
  { id: "choreographer", name: "Choreographers" },
  { id: "teacher", name: "Vocal Coaches" },
];

function ArtistCardCompact({ artist, navigate }) {
  const [imgErr, setImgErr] = useState(false);
  const src = getAvatarSrc(artist);
  const fallback = getInitialsAvatarSVG(artist.name);

  return (
    <article className="compact-artist-card" onClick={() => navigate(`/artists/${artist.id}`, { state: { artist } })}>
      <div className="compact-card-top">
        <img
          src={imgErr ? fallback : src}
          alt={artist.name}
          className="compact-card-avatar"
          onError={() => !imgErr && setImgErr(true)}
          loading="lazy"
        />
        <div className="compact-card-info">
          <h3 className="compact-card-name">{artist.name}</h3>
          {artist.service && (
            <span className="compact-card-category">
              {categories.find(c => c.id === artist.service)?.name || artist.service}
            </span>
          )}
        </div>
      </div>

      {((artist.location || "") || artist.budget_min != null || artist.budget_max != null) && (
        <p className="compact-card-meta">
          {(artist.location || "").trim() && (
            <span className="compact-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {artist.location}
            </span>
          )}
          {(() => {
            const minB = artist.budget_min != null ? Number(artist.budget_min) : null;
            const maxB = artist.budget_max != null ? Number(artist.budget_max) : null;
            if (minB != null && maxB != null) return <span className="compact-meta-item">₹{minB.toLocaleString()} - ₹{maxB.toLocaleString()}</span>;
            if (minB != null) return <span className="compact-meta-item">from ₹{minB.toLocaleString()}</span>;
            if (maxB != null) return <span className="compact-meta-item">up to ₹{maxB.toLocaleString()}</span>;
            return null;
          })()}
        </p>
      )}

      <Button
        className="btn btn-purple btn-full compact-card-cta"
        onClick={(e) => { e.stopPropagation(); navigate(`/artists/${artist.id}`, { state: { artist } }); }}
      >
        View Profile
      </Button>
    </article>
  );
}

const SearchArtists = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [service, setService] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchArtists = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (service) params.set("service", service);
        if (location.trim()) params.set("location", location.trim());
        if (minBudget !== "") params.set("minBudget", String(Number(minBudget) || 0));
        if (maxBudget !== "") params.set("maxBudget", String(Number(maxBudget) || 0));
        const url = `${apiBase()}/api/artists?${params.toString()}`;
        const data = await fetchJSON(url);
        if (!mounted) return;
        setResults(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load artists");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchArtists();
    return () => { mounted = false; };
  }, [query, service, minBudget, maxBudget, location]);

  const clearFilters = () => {
    setQuery("");
    setService("");
    setMinBudget("");
    setMaxBudget("");
    setLocation("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="search-page">
        <header className="search-header">
          <h1>{isLoggedIn ? "Find Artists for Your Event" : "Discover Amazing Artists"}</h1>
          <p>
            {isLoggedIn
              ? "Browse verified performers, manage inquiries, and book with confidence."
              : "Search by name, service category, budget range, and location."
            }
          </p>
        </header>

        {isLoggedIn && (
          <section className="search-and-filters">
            <div className="search-container">
              <form onSubmit={handleSearchSubmit} className="search-form-inline">
                <input
                  className="search-input-inline"
                  type="text"
                  placeholder="Search by name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" className="search-btn-inline">
                  Search
                </Button>
                <Button
                  type="button"
                  className={`filter-toggle-btn-inline ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Use Filter'}
                </Button>
              </form>
            </div>

            {showFilters && (
              <div className="filters-container-inline">
                <select
                  className="form-select-inline"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">All Services</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="budget-inputs-inline">
                  <input
                    className="form-input-inline"
                    type="number"
                    min="0"
                    placeholder="Min ₹"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                  />
                  <input
                    className="form-input-inline"
                    type="number"
                    min="0"
                    placeholder="Max ₹"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                  />
                </div>

                <input
                  className="form-input-inline"
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <Button className="btn btn-outline clear-btn" onClick={clearFilters} type="button">
                  Clear
                </Button>
              </div>
            )}
          </section>
        )}

        {!isLoggedIn && (
          <section className="filter-controls">
            <Button
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              type="button"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </section>
        )}

        {showFilters && (
          <section className="filters">
            {!isLoggedIn && (
              <div className="search-row">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Search by artist name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            )}

            <div className="filters-grid">
              <select
                className="form-select"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">All Services</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="budget-inputs">
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="Min Budget (₹)"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="Max Budget (₹)"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              <input
                className="form-input"
                type="text"
                placeholder="Location (e.g., Mumbai)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <Button className="btn btn-outline" onClick={clearFilters} type="button">
                Clear All Filters
              </Button>
            </div>
          </section>
        )}

        <section className="results">
          <div className="results-meta">
            {loading ? (
              <span>Loading artists...</span>
            ) : (
              <span>
                {results.length} artist{results.length !== 1 ? 's' : ''} found
                {query && ` for "${query}"`}
                {service && ` in ${categories.find(c => c.id === service)?.name}`}
              </span>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {!error && (
            <div className="artists-grid search-results-grid">
              {!loading && results.length === 0 ? (
                <div className="no-results">
                  <p>No artists found matching your criteria.</p>
                  <p>Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                results.map((artist) => (
                  <ArtistCardCompact key={artist.id} artist={artist} navigate={navigate} />
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SearchArtists;
