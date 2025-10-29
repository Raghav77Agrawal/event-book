import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/view-events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div
      className="container py-5"
      style={{
        background: "linear-gradient(135deg, #eef2f3, #8e9eab)",
        minHeight: "100vh",
      }}
    >
      <h2 className="text-center mb-5 fw-bold text-dark display-5">
        🌟 Upcoming Events
      </h2>

      {events.length === 0 ? (
        <div className="text-center text-muted">
          <h5>No upcoming events right now. Stay tuned!</h5>
        </div>
      ) : (
        <div className="row justify-content-center">
          {events.map((event) => (
            <div className="col-lg-4 col-md-6 col-sm-10 mb-4" key={event.id}>
              <div
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "1rem",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div className="card-body p-4">
                  <h4 className="card-title fw-bold text-primary">
                    {event.title}
                  </h4>
                  <p className="card-text text-muted mb-2">
                    📅 {event.date} | ⏰ {event.time}
                  </p>
                  <p className="card-text text-muted mb-3">
                    📍 {event.location}
                  </p>
                  <p className="fw-semibold mb-1 text-dark">
                    💰 Price: <span className="text-success">₹{event.price}</span>
                  </p>
                  <p className="fw-semibold text-secondary">
                    👤 Organiser: {event.createdBy}
                  </p>

                  <button
                    className="btn btn-primary w-100 mt-3 fw-semibold"
                    style={{
                      borderRadius: "0.75rem",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0056d2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0d6efd")
                    }
                    onClick={() => navigate(`/event/${event.id}`)}
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

export default EventList;
