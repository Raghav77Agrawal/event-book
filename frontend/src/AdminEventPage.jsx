import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminEventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  const handleApprove = async () => {
    try {
      await fetch(`${process.env.REACT_BACKEND_URL}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ eventid: id }),
      });
      alert("✅ Event approved successfully!");
      navigate(`/admin/dashboard`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    try {
      await fetch(`${process.env.REACT_BACKEND_URL}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ eventid: id }),
      });
      alert("❌ Event rejected.");
      navigate(`/admin/dashboard`);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_BACKEND_URL}/view-event/${id}`, {
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
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)",
        minHeight: "100vh",
      }}
    >
      <div
        className="card shadow-lg mx-auto p-5"
        style={{
          maxWidth: "700px",
          borderRadius: "1.5rem",
          background: "white",
        }}
      >
        <h2 className="text-center mb-4 fw-bold text-primary">
          📝 Review Event
        </h2>

        <div className="mb-3">
          <h3 className="fw-bold text-dark mb-3">{event.title}</h3>
          <p className="text-secondary mb-1">
            <strong>Date:</strong> {event.date}
          </p>
          <p className="text-secondary mb-1">
            <strong>Time:</strong> {event.time}
          </p>
          <p className="text-secondary mb-1">
            <strong>Location:</strong> {event.location}
          </p>
          <p className="text-secondary mb-1">
            <strong>Price:</strong> ₹{event.price}
          </p>
          <p className="text-secondary mb-1">
            <strong>Organizer:</strong> {event.createdBy}
          </p>
          <p className="mt-3">
            <strong>Description:</strong> {event.description || "No details provided."}
          </p>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            onClick={handleApprove}
            className="btn px-4 py-2 text-white shadow"
            style={{
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              borderRadius: "0.75rem",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #16a34a, #22c55e)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #22c55e, #16a34a)")
            }
          >
            ✅ Approve
          </button>

          <button
            onClick={handleReject}
            className="btn px-4 py-2 text-white shadow"
            style={{
              background: "linear-gradient(90deg, #ef4444, #dc2626)",
              borderRadius: "0.75rem",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #dc2626, #ef4444)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "linear-gradient(90deg, #ef4444, #dc2626)")
            }
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventPage;
