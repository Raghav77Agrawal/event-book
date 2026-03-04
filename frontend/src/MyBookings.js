import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/mytickets`, {
          headers: { Authorization: `Bearer ${token}` },
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

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-grow text-primary" role="status"></div>
      <h5 className="mt-3 text-muted">Retrieving your passes...</h5>
    </div>
  );

  if (tickets.length === 0) return (
    <div className="container py-5 text-center vh-100 d-flex flex-column justify-content-center">
      <div className="mb-4">
        <i className="bi bi-ticket-perforated text-muted" style={{ fontSize: "5rem" }}></i>
      </div>
      <h3 className="fw-bold">No bookings found</h3>
      <p className="text-muted">Looks like you haven't reserved your spot for any events yet.</p>
      <Link to="/" className="btn btn-primary btn-lg px-4 mt-3 rounded-pill">Browse Events</Link>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h2 className="fw-bold mb-0">My Bookings</h2>
          <span className="badge bg-white text-primary border px-3 py-2 rounded-pill shadow-sm">
            {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
          </span>
        </div>

        <div className="row g-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm ticket-item-card">
                {/* Visual Status Bar */}
                <div className={`status-bar ${ticket.ticketType === 'booked' ? 'bg-success' : 'bg-warning'}`}></div>
                
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title fw-bold text-dark mb-0">{ticket.event.title}</h5>
                    <div className="text-primary fw-bold">₹{ticket.price}</div>
                  </div>

                  <div className="ticket-info-grid mb-4">
                    <div className="mb-2">
                      <i className="bi bi-calendar3 me-2 text-muted"></i>
                      <span className="small">{ticket.event.date} at {ticket.event.time}</span>
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-geo-alt me-2 text-muted"></i>
                      <span className="small text-truncate d-inline-block" style={{maxWidth: '200px'}}>
                        {ticket.event.location}
                      </span>
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-clock-history me-2 text-muted"></i>
                      <span className="small text-muted">
                        Booked {new Date(ticket.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
                    <div>
                      <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>TICKET ID</small>
                   <span className="fw-mono small text-uppercase">#{ticket.id}</span> 
                    </div>
                    <Link 
                      to={`/ticket/${ticket.id}`} 
                      className="btn btn-outline-primary btn-sm rounded-pill px-4"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;