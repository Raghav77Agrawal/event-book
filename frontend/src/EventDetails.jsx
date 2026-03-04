import { useEffect, useState } from "react";
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
        alert("Please login to reserve your spot!");
        navigate("/login");
      }

      const token = await user.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/bookticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventid: id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/view-event/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.log("Error:", err);
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) return (
    <div className="loader-container">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="event-details-wrapper">
      {/* Animated Background Shapes */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>

      <div className="container py-5 d-flex justify-content-center align-items-center position-relative">
        <div className="glass-event-card shadow-lg overflow-hidden">
          
          {/* Top Banner Section */}
          <div className="event-header-banner p-5 text-center text-white">
            <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-bold">
              UPCOMING EVENT
            </span>
            <h1 className="display-5 fw-bold mb-2">{event.title}</h1>
            <p className="opacity-75 fs-5">Hosted by {event.createdBy}</p>
          </div>

          <div className="p-4 p-md-5 bg-white">
            <div className="row g-4">
              {/* Left Column: Description */}
              <div className="col-md-7">
                <h5 className="fw-bold text-primary mb-3">About the Event</h5>
                <p className="text-muted leading-relaxed">
                  {event.description || "Join us for an unforgettable experience filled with learning and networking opportunities."}
                </p>
              </div>

              {/* Right Column: Key Details */}
              <div className="col-md-5">
                <div className="info-box p-3 rounded-3 mb-3 d-flex align-items-center">
                  <div className="icon-circle bg-primary-light me-3">📅</div>
                  <div>
                    <small className="text-muted d-block">DATE</small>
                    <span className="fw-bold">{event.date}</span>
                  </div>
                </div>

                <div className="info-box p-3 rounded-3 mb-3 d-flex align-items-center">
                  <div className="icon-circle bg-primary-light me-3">📍</div>
                  <div>
                    <small className="text-muted d-block">LOCATION</small>
                    <span className="fw-bold">{event.location}</span>
                  </div>
                </div>

                <div className="info-box p-3 rounded-3 mb-3 d-flex align-items-center border-success-subtle">
                  <div className="icon-circle bg-success-light me-3">💰</div>
                  <div>
                    <small className="text-muted d-block">ENTRY FEE</small>
                    <span className="fw-bold text-success fs-5">₹{event.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <button onClick={handleBookTicket} className="btn-premium-book">
                Confirm Booking & Pay
              </button>
              <p className="mt-3 text-muted small">
                * Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;