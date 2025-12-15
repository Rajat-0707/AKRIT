import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiBase } from "../utils/api";
import { DEFAULT_AVATAR_SVG } from "../utils/avatar";
import { authFetch, getUser } from "../utils/auth";
import "./MyRequests.css";

export default function MyRequests() {
  const navigate = useNavigate();
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) {
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
      const res = await authFetch(`${apiBase()}/bookings/my-requests`);
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

  const cancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    try {
      const res = await authFetch(`${apiBase()}/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(err.message || "Failed to cancel booking");
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

      <main className="my-requests-page">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">My Booking Requests</h1>
            <p className="page-subtitle">
              View and manage all your booking requests to artists
            </p>
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
              <p>Loading your requests...</p>
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
              <div className="empty-icon">📬</div>
              <h3>No booking requests yet</h3>
              <p>
                {filter === "all"
                  ? "Start by browsing artists and sending booking requests"
                  : `No ${filter} requests found`}
              </p>
              <Button
                className="btn-primary"
                onClick={() => navigate("/search")}
              >
                Browse Artists
              </Button>
            </div>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="booking-card">
                  <CardContent className="booking-content">
                    <div className="booking-header">
                      <div className="artist-info">
                        <img
                          src={
                            booking.artist_id?.img_url ||
                            booking.artist_id?.img ||
                            '/public/avt.png'
                          }
                          alt={booking.artist_id?.name}
                          className="artist-avatar"
                        />
                        <div>
                          <h3 className="artist-name">
                            {booking.artist_id?.name || "Unknown Artist"}
                          </h3>
                          <p className="artist-category">
                            {booking.artist_id?.category || booking.artist_id?.service}
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
                      <div className="detail-row">
                        <span className="detail-label">Requested:</span>
                        <span className="detail-value">
                          {new Date(booking.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="booking-message">
                      <strong>Your Message:</strong>
                      <p>{booking.message}</p>
                    </div>

                    {booking.artist_response && (
                      <div className="artist-response">
                        <strong>Artist Response:</strong>
                        <p>{booking.artist_response}</p>
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <div className="booking-actions">
                        <Button
                          variant="outline"
                          className="cancel-btn"
                          onClick={() => cancelBooking(booking._id)}
                        >
                          Cancel Request
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
