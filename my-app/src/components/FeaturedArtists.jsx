import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { apiBase, fetchJSON } from "../utils/api";
import { getAvatarSrc, getInitialsAvatarSVG } from "../utils/avatar";

const FeaturedArtists = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const url = `${apiBase()}/api/artists?limit=8`;
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
  }, []);

  return (
    <section className="artists-section">
      <div className="section-header">
        <h2 className="section-title">Featured Professional Talent</h2>
        <p className="section-description">
          Verified performers and industry professionals ready for your next event
        </p>
      </div>

      {loading && (
        <div className="featured-loading">
          <div className="featured-spinner"></div>
          <span>Loading artists…</span>
        </div>
      )}

      {error && !loading && (
        <div className="featured-error">{error}</div>
      )}

      {!loading && !error && (
        <div className="artists-grid featured-grid">
          {items.length === 0 ? (
            <div className="featured-empty">No artists found.</div>
          ) : (
            items.map((artist) => (
              <FeaturedCard
                key={artist.id}
                artist={artist}
                onViewProfile={() => navigate(`/artists/${artist.id}`, { state: { artist } })}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
};

/* ── Compact Featured Card ── */
function FeaturedCard({ artist, onViewProfile }) {
  const [imgErr, setImgErr] = useState(false);
  const src = getAvatarSrc(artist);
  const fallback = getInitialsAvatarSVG(artist.name);

  return (
    <article className="featured-card" onClick={onViewProfile}>
      <div className="featured-card-header">
        <img
          src={imgErr ? fallback : src}
          alt={artist.name}
          className="featured-avatar"
          onError={() => !imgErr && setImgErr(true)}
          loading="lazy"
        />
        <div className="featured-card-info">
          <h3 className="featured-card-name">{artist.name}</h3>
          {artist.service && (
            <span className="featured-category-badge">{artist.service}</span>
          )}
        </div>
      </div>

      {artist.location && (
        <div className="featured-card-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>{artist.location}</span>
        </div>
      )}

      <Button
        className="btn btn-purple btn-full featured-cta"
        onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
      >
        View Profile
      </Button>
    </article>
  );
}

export default FeaturedArtists;
