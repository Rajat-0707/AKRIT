import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiBase } from "../utils/api";
import { authFetch, getUser } from "../utils/auth";
import "../css/ReceivedBookings.css";

export default function ReceivedBookings() {
  const navigate = useNavigate();
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (!user || user.role !== 'artist') {
      navigate("/login");
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${apiBase()}/api/bookings/received`);
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to fetch bookings");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await authFetch(`${apiBase()}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          artist_response: responseText || undefined 
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to update booking");
      }

      setRespondingTo(null);
      setResponseText("");
      fetchBookings();
    } catch (err) {
      console.error("Error updating booking:", err);
      alert(err.message || "Failed to update booking");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pending", className: "status-pending" },
      accepted: { label: "Accepted", className: "status-accepted" },
      rejected: { label: "Rejected", className: "status-rejected" },
      completed: { label: "Completed", className: "status-completed" },
      cancelled: { label: "Cancelled", className: "status-cancelled" },
    };
    return badges[status] || badges.pending;
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  return (
    <div className="app-container">
      <Navbar />

      <main className="received-bookings-page">
        <div className="page-header">
          <div className="header-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h1 className="page-title">Booking Requests</h1>
                <p className="page-subtitle">
                  Manage booking requests from clients who want to hire you
                </p>
              </div>
              <Button
                onClick={fetchBookings}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  background: loading ? '#f1f5f9' : '#334155',
                  color: loading ? '#94a3b8' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </Button>
            </div>
          </div>
        </div>

        <div className="page-content">
          <div className="filter-bar">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({bookings.length})
              </button>
              <button
                className={`filter-btn ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pending ({bookings.filter((b) => b.status === "pending").length})
              </button>
              <button
                className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
                onClick={() => setFilter("accepted")}
              >
                Accepted ({bookings.filter((b) => b.status === "accepted").length})
              </button>
              <button
                className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
                onClick={() => setFilter("rejected")}
              >
                Rejected ({bookings.filter((b) => b.status === "rejected").length})
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading booking requests...</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <p>{error}</p>
              <Button onClick={fetchBookings}>Try Again</Button>
            </div>
          )}

          {!loading && !error && filteredBookings.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No booking requests yet</h3>
              <p>
                {filter === "all"
                  ? "You haven't received any booking requests yet. Make sure your profile is complete and visible to clients to start getting bookings!"
                  : `No ${filter} requests found`}
              </p>
              <div style={{ marginTop: '1rem' }}>
                <Button
                  className="btn-primary"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}
                >
                  Update Profile
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="booking-card">
                  <CardContent className="booking-content">
                    <div className="booking-header">
                      <div className="client-info">
                        <div className="client-avatar">
                          {booking.client_name?.charAt(0)?.toUpperCase() || 
                           booking.client_id?.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <h3 className="client-name">
                            {booking.client_name || booking.client_id?.name || "Client"}
                          </h3>
                          <p className="client-email">
                            {booking.client_email || booking.client_id?.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`status-badge ${
                          getStatusBadge(booking.status).className
                        }`}
                      >
                        {getStatusBadge(booking.status).label}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="detail-label">Event Type:</span>
                        <span className="detail-value">
                          {booking.event_type.charAt(0).toUpperCase() +
                            booking.event_type.slice(1)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Event Date:</span>
                        <span className="detail-value">
                          {new Date(booking.event_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{booking.event_location}</span>
                      </div>
                      {booking.budget && (
                        <div className="detail-row">
                          <span className="detail-label">Budget:</span>
                          <span className="detail-value">
                            ₹{Number(booking.budget).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {booking.client_phone && (
                        <div className="detail-row">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{booking.client_phone}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Received:</span>
                        <span className="detail-value">
                          {new Date(booking.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="client-message">
                      <strong>Client Message:</strong>
                      <p>{booking.message}</p>
                    </div>

                    {booking.artist_response && (
                      <div className="your-response">
                        <strong>Your Response:</strong>
                        <p>{booking.artist_response}</p>
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <>
                        {respondingTo === booking._id ? (
                          <div className="response-form">
                            <textarea
                              className="response-textarea"
                              placeholder="Add a message to your response (optional)..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows="3"
                            />
                            <div className="response-actions">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setRespondingTo(null);
                                  setResponseText("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="accept-btn"
                                onClick={() => updateBookingStatus(booking._id, "accepted")}
                              >
                                Accept Booking
                              </Button>
                              <Button
                                className="reject-btn"
                                onClick={() => updateBookingStatus(booking._id, "rejected")}
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="booking-actions">
                            <Button
                              className="respond-btn"
                              onClick={() => setRespondingTo(booking._id)}
                            >
                              Respond to Request
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {booking.status === "accepted" && (
                      <div className="booking-actions">
                        <Button
                          className="complete-btn"
                          onClick={() => updateBookingStatus(booking._id, "completed")}
                        >
                          Mark as Completed
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
