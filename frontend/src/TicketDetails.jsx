import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {QRCodeSVG} from "qrcode.react";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  
  const ticketRef = useRef();
  useEffect(() => {
    const fetchTicket = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return alert("Please login to view ticket");

      const token = await user.getIdToken();

      const res = await fetch(`http://localhost:5000/ticket/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials:'include',
      });

      const data = await res.json();
      if (res.ok) {
        setTicket(data);
      } else {
        console.error(data.error);
        alert("Ticket not found");
      }
    };

    fetchTicket();
  }, [id]);

  if (!ticket) return <div className="text-center py-5">Loading ticket...</div>;

  return (
     <div className="container py-5 d-flex justify-content-center">
      <div className="w-100" style={{ maxWidth: "500px" }}>
        <div ref={ticketRef} className="p-4 border rounded shadow bg-light position-relative">
          <h3 className="mb-4 text-center text-primary">🎟 Your Ticket</h3>

          <div className="mb-3">
            <strong>Event:</strong> <span className="text-dark">{ticket.event.title}</span>
          </div>
          <div className="mb-2 d-flex justify-content-between">
            <span><strong>Date:</strong> {ticket.event.date}</span>
            <span><strong>Time:</strong> {ticket.event.time}</span>
          </div>
          <div className="mb-3">
            <strong>Location:</strong> <span>{ticket.event.location}</span>
          </div>
          <div className="mb-2">
            <strong>Ticket ID:</strong> {id}
          </div>
          <div className="mb-4">
            <strong>Price:</strong> ₹{ticket.price}
          </div>

          <hr />

          <div className="text-center">
            <QRCodeSVG value={JSON.stringify({ id: id, event: ticket.event.title })} size={150} />
            <p className="mt-2 text-muted">Scan to verify</p>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default TicketDetails;

