import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminEventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAction = async (endpoint, message) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventid: id }),
      });

      if (response.ok) {
        alert(message);
        navigate(`/admin/dashboard`);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/view-event/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.log("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid py-5"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="container">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-link text-decoration-none text-secondary mb-4 p-0"
        >
          ← Back to Dashboard
        </button>

        <div
          className="card border-0 shadow-lg mx-auto overflow-hidden"
          style={{
            maxWidth: "800px",
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {/* Header Section */}
          <div className="p-4 text-center border-bottom bg-light">
            <span className="badge bg-primary-soft text-primary mb-2 px-3 py-2 rounded-pill" style={{backgroundColor: '#e7f0ff'}}>
              Pending Review
            </span>
            <h2 className="fw-bold text-dark m-0">Event Details</h2>
          </div>

          <div className="card-body p-5">
            <div className="row g-4">
              <div className="col-12">
                <h3 className="display-6 fw-bold text-primary mb-3">{event.title}</h3>
                <hr className="opacity-10" />
              </div>

              {/* Event Info Grid */}
              <div className="col-md-6">
                <label className="small text-uppercase fw-bold text-muted">Date & Time</label>
                <p className="fs-5 text-dark">📅 {event.date} at {event.time}</p>
              </div>

              <div className="col-md-6">
                <label className="small text-uppercase fw-bold text-muted">Location</label>
                <p className="fs-5 text-dark">📍 {event.location}</p>
              </div>

              <div className="col-md-6">
                <label className="small text-uppercase fw-bold text-muted">Ticket Price</label>
                <p className="fs-5 text-dark">💰 ₹{event.price}</p>
              </div>

              <div className="col-md-6">
                <label className="small text-uppercase fw-bold text-muted">Organizer</label>
                <p className="fs-5 text-dark">👤 {event.createdBy}</p>
              </div>

              <div className="col-12">
                <label className="small text-uppercase fw-bold text-muted">Description</label>
                <div 
                  className="p-3 bg-light rounded-3 mt-2" 
                  style={{ borderLeft: "4px solid #0d6efd" }}
                >
                  {event.description || "No detailed description provided for this event."}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center gap-4 mt-5">
              <button
                onClick={() => handleAction('approve', '✅ Event approved successfully!')}
                className="btn btn-lg px-5 shadow-sm text-white"
                style={{
                  background: "#22c55e",
                  borderRadius: "12px",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Approve Event
              </button>

              <button
                onClick={() => handleAction('reject', '❌ Event rejected.')}
                className="btn btn-lg px-5 shadow-sm text-white"
                style={{
                  background: "#ef4444",
                  borderRadius: "12px",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Reject Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventPage;