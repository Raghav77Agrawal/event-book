import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/ticket/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setTicket(data);
    };
    fetchTicket();
  }, [id]);

  if (!ticket) return <div className="text-center py-5">Loading ticket...</div>;

  const isBooked = ticket.ticketType.toLowerCase() === "booked";

  return (
    <div className="container py-5 d-flex justify-content-center bg-light min-vh-100">
      <div className="ticket-card shadow-lg" style={{ maxWidth: "450px", width: "100%" }}>
        
        {/* Ticket Header */}
        <div className={`p-4 text-white text-center rounded-top ${isBooked ? 'bg-primary' : 'bg-warning'}`} 
             style={{ borderBottom: '2px dashed rgba(255,255,255,0.4)' }}>
          <h2 className="mb-0 fw-bold">EVENT PASS</h2>
          <small className="text-uppercase opacity-75">IET-DAVV Events</small>
        </div>

        {/* Ticket Body */}
        <div className="bg-white p-4 position-relative">
          {/* Decorative "Punched" Holes */}
          <div className="hole hole-left"></div>
          <div className="hole hole-right"></div>

          <h3 className="fw-bold text-dark mb-1">{ticket.event.title}</h3>
          <p className="text-muted mb-4"><i className="bi bi-geo-alt"></i> {ticket.event.location}</p>

          <div className="row mb-4">
            <div className="col-6">
              <small className="text-muted d-block text-uppercase">Date</small>
              <span className="fw-bold">{ticket.event.date}</span>
            </div>
            <div className="col-6 text-end">
              <small className="text-muted d-block text-uppercase">Time</small>
              <span className="fw-bold">{ticket.event.time}</span>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-6">
              <small className="text-muted d-block text-uppercase">Status</small>
              <span className={`badge ${isBooked ? 'bg-success' : 'bg-danger'}`}>
                {ticket.ticketType.toUpperCase()}
              </span>
            </div>
            <div className="col-6 text-end">
              <small className="text-muted d-block text-uppercase">Price</small>
              <span className="fw-bold text-primary">₹{ticket.price}</span>
            </div>
          </div>

          <div className="border-top pt-4 text-center">
             <div className="p-3 bg-white d-inline-block border rounded">
                <QRCodeSVG 
                  value={JSON.stringify({ id, event: ticket.event.title, uid:getAuth().currentUser?.uid })} 
                  size={140} 
                  level="H"
                />
             </div>
             <p className="mt-3 mb-0 text-muted small">Order ID: #{id.slice(-8)}</p>
             <small className="text-muted">Booked On: {new Date(ticket.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</small>
          </div>
        </div>
        
        {/* Ticket Footer */}
        <div className="bg-dark text-white p-2 text-center rounded-bottom">
          <small>Scan at the venue entrance</small>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;