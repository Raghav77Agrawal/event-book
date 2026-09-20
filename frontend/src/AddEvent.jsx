import React, { useState } from "react";
import { getAuth } from "firebase/auth";

const AddEvent = () => {
  const [formData, setFormData] = useState({ name: "", description: "", date: "", time: "", venue: "", price: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("Please sign in before submitting an event.");
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Event submission failed");
      setMessage("Event submitted for admin review.");
      setFormData({ name: "", description: "", date: "", time: "", venue: "", price: 0 });
    } catch (submitError) { setError(submitError.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="add-event-page py-5"><div className="container d-flex justify-content-center"><div className="glass-form shadow-lg p-4 p-md-5">
      <div className="text-center mb-4"><span className="badge bg-soft-primary text-primary px-3 py-2 rounded-pill mb-2">ADMIN REVIEW REQUIRED</span><h2 className="fw-bold text-dark">Host an Event</h2></div>
      {message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}><div className="row g-4">
        <div className="col-12"><label className="form-label fw-bold">EVENT TITLE</label><input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} minLength="3" maxLength="120" required /></div>
        <div className="col-12"><label className="form-label fw-bold">DESCRIPTION</label><textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} minLength="10" maxLength="5000" required /></div>
        <div className="col-md-6"><label className="form-label fw-bold">DATE</label><input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} required /></div>
        <div className="col-md-6"><label className="form-label fw-bold">TIME</label><input type="time" className="form-control" name="time" value={formData.time} onChange={handleChange} required /></div>
        <div className="col-md-6"><label className="form-label fw-bold">VENUE</label><input type="text" className="form-control" name="venue" value={formData.venue} onChange={handleChange} maxLength="255" required /></div>
        <div className="col-md-6"><label className="form-label fw-bold">TICKET PRICE (₹)</label><input type="number" className="form-control" name="price" min="0" max="10000000" step="0.01" value={formData.price} onChange={handleChange} required /></div>
      </div><button type="submit" disabled={loading} className="btn btn-primary-gradient w-100 mt-5 py-3 fw-bold">{loading ? "Submitting…" : "Submit Event Proposal"}</button></form>
    </div></div></div>
  );
};
export default AddEvent;
