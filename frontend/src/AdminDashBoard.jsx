import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/pending-req", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchEvents();
  }, []);

  

  return (
    <div
      className="container py-5"
      style={{
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        minHeight: "100vh",
        maxWidth: "100vw",
      }}
    >
      <h2 className="text-center mb-5 fw-bold display-6 text-primary">
        Pending Event Requests
      </h2>

      {events.length === 0 ? (
        <div className="text-center text-muted">
          <h5>No pending event requests at the moment.</h5>
        </div>
      ) : (
        <div className="row justify-content-center">
          {events.map((event) => (
            <div className="col-md-5 mb-4" key={event.id}>
              <div
                className="card shadow-lg border-0 h-100"
                style={{
                  borderRadius: "1rem",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div className="card-body p-4">
                  <h4 className="fw-bold text-dark">{event.title}</h4>
                  <p className="text-muted mb-1">
                    <i className="bi bi-calendar-date"></i> {event.date} | {event.time}
                  </p>
                  <p className="text-muted mb-2">
                    <i className="bi bi-geo-alt"></i> {event.location}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{event.price}
                  </p>
                  <p>
                    <strong>Organizer:</strong> {event.createdBy}
                  </p>

                  

                  <button
                    className="btn btn-outline-primary w-100 mt-3"
                    onClick={() => navigate(`/admin/event/${event.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
