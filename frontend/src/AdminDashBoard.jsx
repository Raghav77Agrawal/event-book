import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pending-req`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.log("Error fetching events:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "#f8f9fa" }}>
        <div className="spinner-border text-primary" role="status">
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
        {/* Header Section */}
        <div className="text-center mb-5">
          <h2 className="fw-bold display-5 text-dark">Admin Dashboard</h2>
          <p className="text-secondary fs-5">Manage and review pending event submissions</p>
          <div 
            className="mx-auto mt-2" 
            style={{ width: "60px", height: "4px", background: "#0d6efd", borderRadius: "2px" }}
          ></div>
        </div>

        {events.length === 0 ? (
          <div 
            className="card shadow-sm border-0 mx-auto text-center p-5" 
            style={{ maxWidth: "600px", borderRadius: "1.5rem" }}
          >
            <div className="display-1 mb-3">🎉</div>
            <h4 className="fw-bold">All caught up!</h4>
            <p className="text-muted">There are no pending event requests to review at this time.</p>
          </div>
        ) : (
          <div className="row g-4">
            {events.map((event) => (
              <div className="col-lg-4 col-md-6" key={event.id}>
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: "1.25rem",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.shadow = "0 1rem 3rem rgba(0,0,0,0.175)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onClick={() => navigate(`/admin/event/${event.id}`)}
                >
                  {/* Status Ribbon */}
                  <div className="bg-primary text-white text-center py-1 small fw-bold text-uppercase">
                    Pending Review
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="fw-bold text-dark mb-3 line-clamp-2">{event.title}</h5>
                    
                    <div className="mb-3 flex-grow-1">
                      <div className="d-flex align-items-center mb-2 text-secondary small">
                        <span className="me-2">📅</span>
                        {event.date} • {event.time}
                      </div>
                      <div className="d-flex align-items-center mb-2 text-secondary small">
                        <span className="me-2">📍</span>
                        {event.location}
                      </div>
                      <div className="d-flex align-items-center mb-2 text-secondary small">
                        <span className="me-2">👤</span>
                        By: {event.createdBy}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                      <div>
                        <span className="text-muted small d-block">Price</span>
                        <span className="fw-bold text-primary fs-5">₹{event.price}</span>
                      </div>
                      <button 
                        className="btn btn-primary px-4 rounded-pill shadow-sm"
                        style={{ transition: "0.3s" }}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;