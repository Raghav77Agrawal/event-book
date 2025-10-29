import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  const handleBookTicket = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to book a ticket.");
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("http://localhost:5000/bookticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ eventid: id }),
      });

      const data = await res.json();
      navigate(`/ticket/${data.ticketid}`);
      alert("Ticket booked successfully!");
    } catch (e) {
      console.log(e);
      alert("Something went wrong while booking.");
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/view-event/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.log("Failed to fetch event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) {
    return <div className="text-center py-5 fw-bold fs-4">Loading event...</div>;
  }

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center py-5"
      style={{
        background: "linear-gradient(135deg, #f8fafc, #dbeafe)",
        minHeight: "100vh",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          borderRadius: "1.2rem",
          maxWidth: "750px",
          width: "100%",
          background: "white",
          border: "none",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">{event.title}</h2>
          <p className="text-muted">{event.description || "No details provided."}</p>
        </div>

        <div className="mb-3">
          <p className="mb-1">
            <strong>Date:</strong> {event.date}
          </p>
          <p className="mb-1">
            <strong>Time:</strong> {event.time}
          </p>
          <p className="mb-1">
            <strong>Location:</strong> {event.location}
          </p>
          <p className="mb-1">
            <strong>Price:</strong> ₹{event.price}
          </p>
          <p className="mb-1">
            <strong>Organiser:</strong> {event.createdBy}
          </p>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={handleBookTicket}
            className="btn px-5 py-2 fw-semibold"
            style={{
              background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
              color: "white",
              borderRadius: "0.5rem",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #2563eb, #1e3a8a)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #1e3a8a, #2563eb)")
            }
          >
            🎟️ Book Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
