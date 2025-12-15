import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { DEFAULT_AVATAR_SVG } from "../utils/avatar";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiBase, fetchJSON } from "../utils/api";

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
        const url = `${apiBase()}/artists?limit=8`;
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
      {loading && <div style={{ padding: 12 }}>Loading artists…</div>}
      {error && !loading && <div style={{ color: "#b91c1c", padding: 12 }}>{error}</div>}
      {!loading && !error && (
        <div className="artists-grid">
          {items.length === 0 ? (
            <div style={{ padding: 12, opacity: 0.8 }}>No artists found.</div>
          ) : (
            items.map((artist) => (
              <div key={artist.id} className="artist-card">
                <Card className="card">
                  <img src={artist.img || artist.img_url || '/public/avt.png'}
                       alt={artist.name}
                       className="card-image" />
                  <CardContent className="card-content">
                    <h3 className="card-title">{artist.name}</h3>
                    {artist.role && <p className="card-role">{artist.role}</p>}
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
    </section>
  );
};

export default FeaturedArtists;
