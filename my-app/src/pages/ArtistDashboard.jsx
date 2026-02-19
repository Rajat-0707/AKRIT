import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiBase } from "../utils/api";
import { authFetch } from "../utils/auth";
import "../css/ArtistDashboard.css";

export default function ArtistDashboard({ showLayout = true }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditRates, setShowEditRates] = useState(false);
  const [showEditAvailability, setShowEditAvailability] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", service: "", bio: "", img: "", budget_min: "", budget_max: "", availability: "" });
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        console.log("ArtistDashboard: Fetching artist profile...");
        const res = await authFetch(`${apiBase()}/api/artist/me`);
        console.log("ArtistDashboard: API response status:", res.status);
        const raw = await res.text();
        console.log("ArtistDashboard: Raw response:", raw);
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch (e) {
          console.error("ArtistDashboard: JSON parse error:", e);
          throw new Error("Invalid server response");
        }
        console.log("ArtistDashboard: Parsed data:", data);
        if (res.status >= 400) {
          throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        if (!mounted) return;

        const artistData = data.artist || data;
        setProfile(artistData || null);
        console.log("ArtistDashboard: Profile loaded:", artistData);
        const a = artistData || {};
        setForm({
          name: a.name || "",
          city: a.city || "",
          service: a.service || "",
          bio: a.bio || "",
          img: a.img || "",
          budget_min: a.budget_min ?? "",
          budget_max: a.budget_max ?? "",
          availability: a.availability || "",
          newPhoto: null,
        });
      } catch (e) {
        console.error("ArtistDashboard: Error loading profile:", e);
        if (!mounted) return;
        setError(e.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const content = (
    <>
      <main id="artist-dashboard" style={{
        padding: "3rem 2rem",
        maxWidth: 1600,
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        minHeight: "80vh"
      }}>
        <header style={{
          marginBottom: "3rem",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "2rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1400,
            margin: "0 auto",
            gap: "2rem"
          }}>
            <div>
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                marginBottom: "0.5rem",
                color: "#1e293b",
                letterSpacing: "-0.025em"
              }}>
                Artist Dashboard
              </h1>
              {!loading && !error && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem"
                }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #8b5cf6",
                    flexShrink: 0
                  }}>
                    {profile?.img ? (
                      <img
                        src={profile.img}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        background: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        fontSize: "2rem",
                        fontWeight: "bold"
                      }}>
                        {profile?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{
                      fontSize: "1.125rem",
                      color: "#64748b",
                      fontWeight: "500"
                    }}>
                      Welcome{profile?.name ? `, ${profile.name}` : ""}
                    </div>
                    <div style={{
                      fontSize: "0.875rem",
                      color: "#94a3b8"
                    }}>
                      {profile?.service || "Artist"} • {profile?.city || "No location set"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!loading && !error && (
              <div style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap"
              }}>
            
                <Button
                  className="btn btn-purple"
                  onClick={() => { setShowEditProfile((s)=>!s); showToast('info', 'Edit Profile opened'); }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowEditRates((s)=>!s); showToast('info', 'Update Rates opened'); }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    background: "white",
                    border: "2px solid #e2e8f0",
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Update Rates
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowEditAvailability((s)=>!s); showToast('info', 'Set Availability opened'); }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    background: "white",
                    border: "2px solid #e2e8f0",
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Set Availability
                </Button>
              </div>
            )}
          </div>
          {loading && <p style={{ color: "#64748b", fontSize: "1.125rem", marginTop: "1rem" }}>Loading your profile…</p>}
          {error && <p style={{ color: "#dc2626", fontSize: "1.125rem", marginTop: "1rem" }}>{error}</p>}
        </header>

        {!loading && !error && (
          <section style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
                 Profile Summary
                </div>
                <div style={{
                  display: "grid",
                  gap: "1rem",
                  color: "#475569",
                  fontSize: "1rem"
                }}>
                  <div style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                    <strong style={{ color: "#334155" }}>Name:</strong> {profile?.name || "—"}
                  </div>
                  <div style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                    <strong style={{ color: "#334155" }}>Service:</strong> {profile?.service || "—"}
                  </div>
                  <div style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                    <strong style={{ color: "#334155" }}>City:</strong> {profile?.city || "—"}
                  </div>
                  <div style={{ padding: "0.75rem 0" }}>
                    <strong style={{ color: "#334155" }}>Availability:</strong> {profile?.availability || "—"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
                Rates
                </div>
                <div style={{ color: "#475569", fontSize: "1rem" }}>
                  {profile?.budget_min || profile?.budget_max ? (
                    <div style={{ padding: "1rem 0", fontSize: "1.125rem" }}>
                      <strong style={{ color: "#334155" }}>Range:</strong> {profile?.budget_min ? `₹${Number(profile.budget_min).toLocaleString()}` : '—'}
                      {profile?.budget_max ? ` - ₹${Number(profile.budget_max).toLocaleString()}` : ''}
                    </div>
                  ) : (
                    <div style={{
                      padding: "1rem 0",
                      color: "#94a3b8",
                      fontStyle: "italic"
                    }}>
                      No rates set yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
                  Reputation
                </div>
                <div style={{ color: "#475569", fontSize: "1rem" }}>
                  <div style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                    <strong style={{ color: "#334155" }}>Rating:</strong> {profile?.rating != null ? profile.rating.toFixed(1) : '—'}
                  </div>
                  <div style={{ padding: "0.75rem 0" }}>
                    <strong style={{ color: "#334155" }}>Reviews:</strong> {profile?.reviews != null ? profile.reviews : '—'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {!loading && !error && (
          <section style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
               About
                </div>
                <div style={{
                  color: "#475569",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  padding: "1rem 0"
                }}>
                  {profile?.bio ? profile.bio : "Tell clients more about you by adding a bio to your profile."}
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
                 Quick Actions
                </div>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById("artist-dashboard");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                      showToast('info', 'Viewing your profile');
                    }}
                    style={{
                      padding: "1rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      background: "white",
                      border: "2px solid #e2e8f0",
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    View My Profile
                  </Button>
                  <Button
                    className="btn btn-purple"
                    onClick={() => { setShowEditProfile((s)=>!s); showToast('info','Edit Profile opened'); }}
                    style={{
                      padding: "1rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Update Profile
                  </Button>
                  <Button
                    className="btn btn-purple"
                    onClick={() => { setShowEditRates((s)=>!s); showToast('info','Update Rates opened'); }}
                    style={{
                      padding: "1rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Manage Rates
                  </Button>
                  <Button
                    className="btn btn-purple"
                    onClick={() => { setShowEditAvailability((s)=>!s); showToast('info','Set Availability opened'); }}
                    style={{
                      padding: "1rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Set Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {!loading && !error && (
          <section style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem"
          }}>
            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
                Booking Requests
                </div>
                <div style={{
                  color: "#64748b",
                  fontSize: "1rem",
                  padding: "1rem 0",
                  lineHeight: "1.6"
                }}>
                  Manage booking requests from clients who want to hire you for their events.
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                  <Button
                    className="btn btn-purple"
                    onClick={() => navigate('/received-bookings')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    View Booking Requests
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "2rem"
            }}>
              <CardContent className="card-content" style={{ padding: 0 }}>
                <div style={{
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center"
                }}>
                  Insights
                </div>
                <div style={{
                  color: "#94a3b8",
                  fontSize: "1rem",
                  fontStyle: "italic",
                  padding: "1rem 0"
                }}>
                  No insights yet.
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Edit Modals */}
      {!loading && !error && (
        <>
          {showEditProfile && (
            <div className="modal-backdrop" onClick={(e)=>{ if (e.target === e.currentTarget) { setShowEditProfile(false); showToast('info','Edit cancelled'); }}}>
              <div className="modal" role="dialog" aria-modal="true">
                <Card className="dash-panel" style={{
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}>
                  <CardContent className="card-content">
                    <div className="card-title">Edit Profile</div>
                    <div className="form-grid">
                      <label>
                        <span>Name</span>
                        <input className="form-input" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} />
                      </label>
                      <label>
                        <span>City</span>
                        <input className="form-input" value={form.city} onChange={(e)=>setForm(f=>({...f, city:e.target.value}))} />
                      </label>
                      <label>
                        <span>Service (category)</span>
                        <select className="form-select" value={form.service} onChange={(e)=>setForm(f=>({...f, service:e.target.value}))}>
                          <option value="">Select…</option>
                          <option value="singer">Vocalist</option>
                          <option value="dance">Dance Group</option>
                          <option value="choreographer">Choreographer</option>
                          <option value="teacher">Vocal Coach</option>
                        </select>
                      </label>
                      <label className="full">
                        <span>Bio</span>
                        <textarea className="form-textarea" rows={4} value={form.bio} onChange={(e)=>setForm(f=>({...f, bio:e.target.value}))} />
                      </label>
                      <label className="full">
                        <span>Profile Image URL</span>
                        <input className="form-input" value={form.img} onChange={(e)=>setForm(f=>({...f, img:e.target.value}))} />
                      </label>
                      <label className="full">
                        <span>Upload New Photo</span>
                        <input type="file" accept="image/*" className="form-input" onChange={(e)=>{
                          const file = e.target.files[0];
                          if (file) {
                            setForm(f=>({...f, newPhoto: file}));
                          }
                        }} />
                        <span className="file-input-hint">Leave empty to keep current photo</span>
                      </label>
                    </div>
                    <div className="panel-actions">
                      <Button variant="outline" onClick={() => { setShowEditProfile(false); showToast('info','Edit cancelled'); }}>Cancel</Button>
                      <Button className="btn btn-purple" disabled={saving} onClick={async()=>{
                        setSaving(true);
                        try {
                          if (form.newPhoto && form.newPhoto.size > 0) {
                            // Use FormData for file upload
                            const formData = new FormData();
                            formData.append("name", form.name);
                            formData.append("city", form.city);
                            formData.append("service", form.service);
                            formData.append("bio", form.bio);
                            formData.append("img", form.img);
                            formData.append("photo", form.newPhoto);
                            
                            const res = await authFetch(`${apiBase()}/api/artist/update`, {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await res.json();
                            if (!res.ok || data.success === false) throw new Error(data.error || `Failed (${res.status})`);
                            setProfile(p=>({ ...(p||{}), name: form.name, city: form.city, service: form.service, bio: form.bio, img: data.img || form.img }));
                          } else {
                            // Use JSON for regular updates
                            const res = await authFetch(`${apiBase()}/api/artist/update`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: form.name, city: form.city, service: form.service, bio: form.bio, img: form.img }) });
                            const data = await res.json();
                            if (!res.ok || data.success === false) throw new Error(data.error || `Failed (${res.status})`);
                            setProfile(p=>({ ...(p||{}), name: form.name, city: form.city, service: form.service, bio: form.bio, img: form.img }));
                          }
                          setShowEditProfile(false);
                          showToast('success', 'Profile updated successfully');
                        } catch (e) {
                          showToast('error', e.message || 'Failed to save');
                        } finally { setSaving(false); }
                      }}>{saving? 'Saving…':'Save Changes'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {showEditRates && (
            <div className="modal-backdrop" onClick={(e)=>{ if (e.target === e.currentTarget) { setShowEditRates(false); showToast('info','Edit cancelled'); }}}>
              <div className="modal" role="dialog" aria-modal="true">
                <Card className="dash-panel" style={{
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}>
                  <CardContent className="card-content">
                    <div className="card-title">Update Rates</div>
                    <div className="form-grid">
                      <label>
                        <span>Budget Min (₹)</span>
                        <input className="form-input" type="number" min="0" value={form.budget_min} onChange={(e)=>setForm(f=>({...f, budget_min:e.target.value}))} />
                      </label>
                      <label>
                        <span>Budget Max (₹)</span>
                        <input className="form-input" type="number" min="0" value={form.budget_max} onChange={(e)=>setForm(f=>({...f, budget_max:e.target.value}))} />
                      </label>
                    </div>
                    <div className="panel-actions">
                      <Button variant="outline" onClick={() => { setShowEditRates(false); showToast('info','Edit cancelled'); }}>Cancel</Button>
                      <Button className="btn btn-purple" disabled={saving} onClick={async()=>{
                        setSaving(true);
                        try {
                          const payload = { budget_min: form.budget_min === '' ? null : Number(form.budget_min), budget_max: form.budget_max === '' ? null : Number(form.budget_max) };
                          const res = await authFetch(`${apiBase()}/api/artist/update`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                          const data = await res.json();
                          if (!res.ok || data.success === false) throw new Error(data.error || `Failed (${res.status})`);
                          setProfile(p=>({ ...(p||{}), budget_min: payload.budget_min, budget_max: payload.budget_max }));
                          setShowEditRates(false);
                          showToast('success', 'Rates updated successfully');
                        } catch (e) {
                          showToast('error', e.message || 'Failed to save');
                        } finally { setSaving(false); }
                      }}>{saving? 'Saving…':'Save Rates'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {showEditAvailability && (
            <div className="modal-backdrop" onClick={(e)=>{ if (e.target === e.currentTarget) { setShowEditAvailability(false); showToast('info','Edit cancelled'); }}}>
              <div className="modal" role="dialog" aria-modal="true">
                <Card className="dash-panel" style={{
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}>
                  <CardContent className="card-content">
                    <div className="card-title">Set Availability</div>
                    <div className="form-grid">
                      <label className="full">
                        <span>Status</span>
                        <select className="form-select" value={form.availability} onChange={(e)=>setForm(f=>({...f, availability:e.target.value}))}>
                          <option value="">Select…</option>
                          <option value="available">Available</option>
                          <option value="busy">Busy</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </label>
                    </div>
                    <div className="panel-actions">
                      <Button variant="outline" onClick={() => { setShowEditAvailability(false); showToast('info','Edit cancelled'); }}>Cancel</Button>
                      <Button className="btn btn-purple" disabled={saving} onClick={async()=>{
                        setSaving(true);
                        try {
                          const res = await authFetch(`${apiBase()}/api/artist/update`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ availability: form.availability }) });
                          const data = await res.json();
                          if (!res.ok || data.success === false) throw new Error(data.error || `Failed (${res.status})`);
                          setProfile(p=>({ ...(p||{}), availability: form.availability }));
                          setShowEditAvailability(false);
                          showToast('success', 'Availability updated successfully');
                        } catch (e) {
                          showToast('error', e.message || 'Failed to save');
                        } finally { setSaving(false); }
                      }}>{saving? 'Saving…':'Save Availability'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>
            <div className="toast-dot" />
            <div className="toast-message">{t.message}</div>
          </div>
        ))}
      </div>
    </>
  );

  if (showLayout) {
    return (
      <div className="app-container">
        <Navbar />
        {content}
        <Footer />
      </div>
    );
  }

  return content;
}
