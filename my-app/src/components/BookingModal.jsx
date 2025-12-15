import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiBase } from "../utils/api";
import { DEFAULT_AVATAR_SVG } from "../utils/avatar";
import { authFetch } from "../utils/auth";
import "./BookingModal.css";

export default function BookingModal({ artist, onClose, onSuccess }) {
  const [form, setForm] = useState({
    event_type: "",
    event_date: "",
    event_location: "",
    budget: "",
    message: "",
    client_name: "",
    client_email: "",
    client_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await authFetch(`${apiBase()}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_id: artist.id || artist._id,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to send booking request");
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to send booking request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal booking-modal" role="dialog" aria-modal="true">
        <Card className="booking-card">
          <CardContent className="card-content">
            <div className="modal-header">
              <h2 className="modal-title">Request Booking</h2>
              <button className="modal-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="booking-artist-info">
              <img
                src={artist.img || artist.img_url || '/public/avt.png'}
                alt={artist.name}
                className="booking-artist-avatar"
              />
              <div>
                <div className="booking-artist-name">{artist.name}</div>
                <div className="booking-artist-service">{artist.service || artist.category}</div>
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="event_type">
                  Event Type <span className="required">*</span>
                </label>
                <select
                  id="event_type"
                  required
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select event type</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="concert">Concert</option>
                  <option value="festival">Festival</option>
                  <option value="private">Private Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="event_date">
                    Event Date <span className="required">*</span>
                  </label>
                  <input
                    id="event_date"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget (₹)</label>
                  <input
                    id="budget"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="event_location">
                  Event Location <span className="required">*</span>
                </label>
                <input
                  id="event_location"
                  type="text"
                  required
                  placeholder="City, Venue"
                  value={form.event_location}
                  onChange={(e) => setForm({ ...form, event_location: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows="4"
                  placeholder="Tell the artist about your event and any specific requirements..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-section-title">Your Contact Information</div>

              <div className="form-group">
                <label htmlFor="client_name">Your Name</label>
                <input
                  id="client_name"
                  type="text"
                  placeholder="Optional - uses your profile name"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="client_email">Email</label>
                  <input
                    id="client_email"
                    type="email"
                    placeholder="Optional - uses your profile email"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client_phone">Phone</label>
                  <input
                    id="client_phone"
                    type="tel"
                    placeholder="Optional"
                    value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
