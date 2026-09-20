import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AdminAnalytics.css";

const metrics = [
  ["events", "Total Events", "bi-calendar2-event", "indigo"],
  ["bookedTickets", "Tickets Booked", "bi-ticket-perforated", "emerald"],
  ["users", "Registered Users", "bi-people", "blue"],
  ["revenue", "Booking Revenue", "bi-currency-rupee", "violet"],
];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return navigate("/admin");
        const token = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load analytics");
        setData(result);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) return <div className="analytics-page analytics-center"><div className="spinner-border text-primary" /></div>;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;

  const totals = data?.totals || {};
  const topEvents = data?.topEvents || [];
  const maxBooked = Math.max(...topEvents.map((item) => Number(item.bookedTickets) || 0), 1);
  const breakdown = (data?.ticketBreakdown || []).reduce((result, item) => ({ ...result, [item.ticketType]: item.count }), {});

  return (
    <main className="analytics-page py-5">
      <div className="container">
        <div className="analytics-heading mb-4">
          <div><span className="analytics-eyebrow">INSIGHTS CENTER</span><h1>Analytics overview</h1><p>Track the health and growth of your EventBook platform.</p></div>
          <span className="analytics-period"><i className="bi bi-bar-chart-line me-2" />Live snapshot</span>
        </div>

        <div className="row g-3 mb-4">
          {metrics.map(([key, label, icon, tone]) => <div className="col-sm-6 col-xl-3" key={key}><div className={`analytics-metric ${tone}`}><div className="metric-icon"><i className={`bi ${icon}`} /></div><span>{label}</span><strong>{key === "revenue" ? `₹${Number(totals[key] || 0).toLocaleString("en-IN")}` : Number(totals[key] || 0).toLocaleString("en-IN")}</strong></div></div>)}
        </div>

        <div className="row g-4">
          <div className="col-lg-7"><section className="analytics-panel h-100"><div className="panel-heading"><div><h5>Top events</h5><p>Events with the most confirmed bookings</p></div><i className="bi bi-trophy text-warning fs-4" /></div>{topEvents.length ? topEvents.map((event, index) => { const booked = Number(event.bookedTickets) || 0; return <div className="top-event" key={event.id}><span className="rank">{index + 1}</span><div className="flex-grow-1"><div className="d-flex justify-content-between gap-3"><strong>{event.title}</strong><span className="small text-muted">{booked} tickets</span></div><div className="progress mt-2"><div className="progress-bar" style={{ width: `${booked / maxBooked * 100}%` }} /></div></div></div>; }) : <div className="analytics-empty">No booked tickets yet.</div>}</section></div>
          <div className="col-lg-5"><section className="analytics-panel h-100"><div className="panel-heading"><div><h5>Platform health</h5><p>Current inventory snapshot</p></div><i className="bi bi-activity text-success fs-4" /></div><div className="health-row"><span><i className="bi bi-check-circle-fill text-success" /> Approved events</span><strong>{totals.approvedEvents || 0}</strong></div><div className="health-row"><span><i className="bi bi-hourglass-split text-warning" /> Pending review</span><strong>{totals.pendingEvents || 0}</strong></div><div className="health-row"><span><i className="bi bi-ticket-detailed text-primary" /> Booked tickets</span><strong>{totals.bookedTickets || 0}</strong></div><div className="health-row"><span><i className="bi bi-x-circle text-danger" /> Cancelled tickets</span><strong>{breakdown.cancelled || 0}</strong></div></section></div>
        </div>
      </div>
    </main>
  );
};

export default AdminAnalytics;
