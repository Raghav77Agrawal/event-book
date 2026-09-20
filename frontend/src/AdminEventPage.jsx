import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

const AdminEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/view-event/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Event not found");
        setEvent(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAction = async (endpoint) => {
    setActionLoading(true);
    setError("");

    try {
      const user = getAuth().currentUser;
      if (!user) return navigate("/admin");

      const token = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventid: id }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Action failed");
      navigate("/admin/dashboard");
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>;
  if (error && !event) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-5">
      <button onClick={() => navigate("/admin/dashboard")} className="btn btn-link mb-4">← Back to Dashboard</button>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card border-0 shadow-lg mx-auto" style={{ maxWidth: "800px" }}>
        <div className="card-header text-center bg-light py-4">
          <span className="badge bg-primary mb-2">Pending Review</span>
          <h2 className="fw-bold mb-0">{event.title}</h2>
        </div>
        <div className="card-body p-4 p-md-5">
          <p className="text-muted">{event.description || "No description provided."}</p>
          <div className="row g-3 mt-3">
            <div className="col-md-6"><strong>Date and time</strong><p>📅 {event.date} at {event.time}</p></div>
            <div className="col-md-6"><strong>Location</strong><p>📍 {event.location}</p></div>
            <div className="col-md-6"><strong>Organizer</strong><p>👤 {event.createdBy}</p></div>
            <div className="col-md-6"><strong>Price</strong><p>₹{event.price}</p></div>
          </div>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <button className="btn btn-success px-4" disabled={actionLoading} onClick={() => handleAction("approve")}>Approve</button>
            <button className="btn btn-danger px-4" disabled={actionLoading} onClick={() => handleAction("reject")}>Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventPage;
