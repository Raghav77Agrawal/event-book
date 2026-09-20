import React, { useCallback, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const statusMeta = {
  pending: { label: "Payment pending", className: "status-pending" },
  booked: { label: "Confirmed", className: "status-confirmed" },
  failed: { label: "Payment failed", className: "status-failed" },
  cancelled: { label: "Cancelled", className: "status-cancelled" },
};

const MyBookings = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("Please sign in to view your bookings.");
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/mytickets`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load bookings");
      setTickets(data);
    } catch (fetchError) { setError(fetchError.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  if (loading) return <div className="bookings-page page-shell"><div className="loading-panel"><div className="spinner-border text-primary" /><p>Loading your bookings…</p></div></div>;
  if (error) return <div className="bookings-page page-shell"><div className="container py-5"><div className="alert alert-danger">{error}</div><button className="btn btn-primary" onClick={fetchTickets}>Try again</button></div></div>;

  return <div className="bookings-page page-shell"><div className="container py-5">
    <div className="page-heading d-flex justify-content-between align-items-end mb-5"><div><span className="eyebrow">YOUR EVENT JOURNEY</span><h1>My bookings</h1><p>Keep your passes ready for the experiences you choose.</p></div><button className="btn btn-light rounded-pill refresh-button" onClick={fetchTickets}>↻ Refresh</button></div>
    {tickets.length === 0 ? <div className="empty-panel text-center"><div className="empty-icon">🎟️</div><h3>No bookings yet</h3><p>Discover an event and reserve your spot to see your ticket here.</p><Link to="/" className="btn btn-primary rounded-pill px-4">Explore events</Link></div> : <div className="row g-4">{tickets.map((ticket) => { const status = statusMeta[ticket.ticketType] || statusMeta.pending; return <div className="col-12 col-md-6 col-xl-4" key={ticket.id}><article className="booking-card h-100"><div className={`booking-accent ${status.className}`} /><div className="p-4 d-flex flex-column h-100"><div className="d-flex justify-content-between gap-3 mb-3"><span className={`status-pill ${status.className}`}>{status.label}</span><strong className="booking-price">₹{ticket.price}</strong></div><h3>{ticket.event.title}</h3><p className="booking-meta">📅 {ticket.event.date} · {ticket.event.time}</p><p className="booking-meta">📍 {ticket.event.location}</p><div className="mt-auto pt-4 d-flex justify-content-between align-items-center"><small className="ticket-number">Ticket #{ticket.id}</small>{ticket.ticketType === "booked" ? <Link to={`/ticket/${ticket.id}`} className="btn btn-primary rounded-pill px-3">View pass</Link> : <span className="small text-muted">Complete payment to activate</span>}</div></div></article></div>; })}</div>}
  </div></div>;
};
export default MyBookings;
