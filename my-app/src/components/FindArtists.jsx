import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { apiBase, fetchJSON } from "../utils/api";
import "./css/FindArtists.css";

const categories = [
  { id: "singer", name: "Vocalists" },
  { id: "dance", name: "Dance Groups" },
  { id: "choreographer", name: "Choreographers" },
  { id: "teacher", name: "Vocal Coaches" },
];

const FindArtists = () => {
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
    // Search is handled by useEffect, no need for additional logic
  };

  return (
    <section className="find-artists-section" id="find-artists">
      <header className="find-artists-header">
        <h2>Find Artists for Your Event</h2>
        <p>Browse verified performers, manage inquiries, and book with confidence.</p>
      </header>

      <div className="search-and-filters">
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

        {/* Collapsible Filters Section */}
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
      </div>

      <div className="results">
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
          <div className="artists-grid">
            {!loading && results.length === 0 ? (
              <div className="no-results">
                <p>No artists found matching your criteria.</p>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              results.map((artist) => (
                <div key={artist.id} className="artist-card">
                  <Card className="card">
                    <img
                      src={artist.img || `https://source.unsplash.com/200x200/?artist`}
                      alt={artist.name}
                      className="card-image"
                    />
                    <CardContent className="card-content">
                      <h3 className="card-title">{artist.name}</h3>
                      {artist.role && <p className="card-role">{artist.role}</p>}
                      <p className="card-subtext">
                        {(artist.location || "")} {(() => {
                          const minB = artist.budget_min != null ? Number(artist.budget_min) : null;
                          const maxB = artist.budget_max != null ? Number(artist.budget_max) : null;
                          if (minB != null && maxB != null) return ` • ₹${minB.toLocaleString()} - ₹${maxB.toLocaleString()}`;
                          if (minB != null) return ` • from ₹${minB.toLocaleString()}`;
                          if (maxB != null) return ` • up to ₹${maxB.toLocaleString()}`;
                          return "";
                        })()} {artist.service ? ` • ${categories.find(c => c.id === artist.service)?.name || artist.service}` : ""}
                      </p>
                      <Button
                        className="btn btn-purple btn-full"
                        onClick={() => navigate(`/artists/${artist.id}`, { state: { artist } })}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FindArtists;
