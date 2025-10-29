import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const MyBookings = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to view your bookings.");
        return;
      }

      const token = await user.getIdToken();

      try {
        const res = await fetch(`${process.env.REACT_BACKEND_URL}/mytickets`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.log("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading)
    return (
      <div className="text-center py-5 text-secondary">
        <div className="spinner-border text-primary mb-3"></div>
        <h5>Loading your bookings...</h5>
      </div>
    );

  if (tickets.length === 0) {
    return (
      <div
        className="text-center py-5"
        style={{
          background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
          minHeight: "100vh",
        }}
      >
        <h4 className="text-muted">You haven't booked any tickets yet.</h4>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{
        background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
        minHeight: "100vh",
      }}
    >
      <h2 className="mb-5 text-center fw-bold text-primary">
        🎫 My Bookings
      </h2>

      <div className="row justify-content-center">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="col-md-6 col-lg-4 mb-4 d-flex align-items-stretch"
          >
            <div
              className="card shadow-lg border-0 p-4 w-100"
              style={{
                borderRadius: "1.5rem",
                background: "white",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="mb-3 text-center">
                <h4 className="fw-bold text-dark">{ticket.event.title}</h4>
                <small className="text-muted">
                  Ticket ID: <strong>{ticket.id}</strong>
                </small>
              </div>

              <div className="text-muted mb-3">
                <p className="mb-1">
                  <strong>Date:</strong> {ticket.event.date}
                </p>
                <p className="mb-1">
                  <strong>Time:</strong> {ticket.event.time}
                </p>
                <p className="mb-1">
                  <strong>Location:</strong> {ticket.event.location}
                </p>
              </div>

              <div className="mb-4">
                <strong>Price Paid:</strong> ₹{ticket.price}
              </div>

              <a
                href={`/ticket/${ticket.id}`}
                className="btn btn-primary w-100 py-2 fw-semibold"
                style={{ borderRadius: "1rem" }}
              >
                View Ticket
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
