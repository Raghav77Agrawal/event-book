import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/view-events`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load events");
        setEvents(data);
      } catch (fetchError) { setError(fetchError.message); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  return <div className="event-listing-wrapper py-5"><div className="container">
    <div className="text-center mb-5"><span className="eyebrow">DISCOVER SOMETHING MEMORABLE</span><h1 className="display-4 fw-bold text-dark mt-2">Find your next experience</h1><p className="text-muted fs-5">Explore approved events and reserve your spot in seconds.</p></div>
    {loading && <div className="loading-panel"><div className="spinner-border text-primary" /><p>Finding upcoming events…</p></div>}
    {!loading && error && <div className="alert alert-danger">{error}</div>}
    {!loading && !error && events.length === 0 && <div className="empty-panel text-center"><div className="empty-icon">🗓️</div><h4>No events available yet</h4><p className="text-muted">Check back soon for new experiences.</p></div>}
    {!loading && !error && events.length > 0 && <div className="row g-4">{events.map((event) => <div className="col-lg-4 col-md-6" key={event.id}><article className="event-card shadow-sm h-100 position-relative"><div className="price-tag">{event.price > 0 ? `₹${event.price}` : "FREE"}</div><div className="card-body p-4 d-flex flex-column"><div className="mb-3"><span className="badge bg-soft-primary text-primary text-uppercase mb-2">{event.createdBy || "Community host"}</span><h4 className="fw-bold text-dark mb-2">{event.title}</h4><p className="text-muted small description-truncate">{event.description}</p></div><div className="mt-auto"><div className="d-flex align-items-center mb-2 text-secondary small">📅 <span className="ms-2">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {event.time}</span></div><div className="d-flex align-items-center mb-4 text-secondary small">📍 <span className="ms-2 text-truncate">{event.location}</span></div><button className="btn btn-modern-primary w-100 py-2 fw-bold" onClick={() => navigate(`/event/${event.id}`)}>View event <span className="ms-1">→</span></button></div></div></article></div>)}</div>}
  </div></div>;
};
export default EventList;
