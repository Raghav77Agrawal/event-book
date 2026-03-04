import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/view-events`);
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="event-listing-wrapper py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-dark">🌟 Upcoming Events</h2>
          <p className="text-muted fs-5">Discover and book the best events at IET-DAVV</p>
        </div>

        {events.length === 0 ? (
          <div className="glass-card text-center py-5">
            <i className="bi bi-calendar2-x display-1 text-muted opacity-50"></i>
            <h4 className="mt-3 text-muted">No events found. Check back later!</h4>
          </div>
        ) : (
          <div className="row g-4">
            {events.map((event) => (
              <div className="col-lg-4 col-md-6" key={event.id}>
                <div className="event-card shadow-sm h-100 position-relative">
                  {/* Floating Price Tag */}
                  <div className="price-tag">
                    {event.price > 0 ? `₹${event.price}` : "FREE"}
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <div className="mb-3">
                      <span className="badge bg-soft-primary text-primary text-uppercase mb-2">
                        {event.organizer || "General"}
                      </span>
                      <h4 className="fw-bold text-dark mb-2">{event.title}</h4>
                      <p className="text-muted small description-truncate">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex align-items-center mb-2 text-secondary small">
                        <i className="bi bi-calendar-event me-2"></i>
                        <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="mx-2 text-light-gray">|</span>
                        <i className="bi bi-clock me-2"></i>
                        <span>{event.time}</span>
                      </div>

                      <div className="d-flex align-items-center mb-4 text-secondary small">
                        <i className="bi bi-geo-alt me-2 text-danger"></i>
                        <span className="text-truncate">{event.location}</span>
                      </div>

                      <button
                        className="btn btn-modern-primary w-100 py-2 fw-bold"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        Secure My Spot <i className="bi bi-arrow-right ms-1"></i>
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

export default EventList;