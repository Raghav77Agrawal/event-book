import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) {
          navigate("/admin");
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pending-req`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Unable to load pending events");
        setEvents(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-fluid py-5" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold display-5 text-dark">Admin Dashboard</h2>
          <p className="text-secondary fs-5">Manage and review pending event submissions</p>
        </div>

        {events.length === 0 ? (
          <div className="card shadow-sm border-0 mx-auto text-center p-5" style={{ maxWidth: "600px", borderRadius: "1.5rem" }}>
            <div className="display-1 mb-3">🎉</div>
            <h4 className="fw-bold">All caught up!</h4>
            <p className="text-muted">There are no pending event requests to review.</p>
          </div>
        ) : (
          <div className="row g-4">
            {events.map((event) => (
              <div className="col-lg-4 col-md-6" key={event.id}>
                <button className="card h-100 border-0 shadow-sm w-100 text-start p-0" onClick={() => navigate(`/admin/event/${event.id}`)}>
                  <div className="bg-primary text-white text-center py-1 small fw-bold text-uppercase">Pending Review</div>
                  <div className="card-body p-4">
                    <h5 className="fw-bold text-dark mb-3">{event.title}</h5>
                    <p className="text-secondary small mb-2">📅 {event.date} • {event.time}</p>
                    <p className="text-secondary small mb-2">📍 {event.location}</p>
                    <p className="text-secondary small mb-4">👤 By: {event.createdBy}</p>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <span className="fw-bold text-primary fs-5">₹{event.price}</span>
                      <span className="btn btn-primary rounded-pill">Review</span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
