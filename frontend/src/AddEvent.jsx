import React, { useState } from "react";

const AddEvent = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    organizer: "",
    price: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✨ Request Sent! Your event will be listed once approved by admin.");
        setFormData({ name: "", description: "", date: "", time: "", venue: "", organizer: "", price: 0 });
      }
    } catch (e) {
      alert("Something went wrong!");
    }
  };

  return (
    <div className="add-event-page py-5">
      <div className="container d-flex justify-content-center">
        <div className="glass-form shadow-lg p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="badge bg-soft-primary text-primary px-3 py-2 rounded-pill mb-2">ADMIN REVIEW REQUIRED</span>
            <h2 className="fw-bold text-dark">Host an Event</h2>
            <p className="text-muted small">Fill in the details below to submit your event proposal.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Event Name */}
              <div className="col-12">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">EVENT TITLE</label>
                  <input type="text" className="form-control" name="name" placeholder="e.g. Annual Tech Symposium" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              {/* Description */}
              <div className="col-12">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">DESCRIPTION</label>
                  <textarea className="form-control" name="description" rows="3" placeholder="Tell us more about the event..." value={formData.description} onChange={handleChange} required />
                </div>
              </div>

              {/* Date & Time */}
              <div className="col-md-6">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">DATE</label>
                  <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">TIME</label>
                  <input type="time" className="form-control" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>

              {/* Venue */}
              <div className="col-md-6">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">VENUE</label>
                  <input type="text" className="form-control" name="venue" placeholder="Hall/Room Number" value={formData.venue} onChange={handleChange} required />
                </div>
              </div>

              {/* Organizer */}
              <div className="col-md-6">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">ORGANIZER</label>
                  <input type="text" className="form-control" name="organizer" placeholder="Club or Dept Name" value={formData.organizer} onChange={handleChange} required />
                </div>
              </div>

              {/* Price */}
              <div className="col-12">
                <div className="custom-input-group">
                  <label className="form-label small fw-bold">TICKET PRICE (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">₹</span>
                    <input type="number" className="form-control border-start-0" name="price" placeholder="0.00" value={formData.price} onChange={handleChange} required />
                  </div>
                  <small className="text-muted mt-1 d-block">Set to 0 if the event is free.</small>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary-gradient w-100 mt-5 py-3 fw-bold shadow">
              🚀 SUBMIT EVENT PROPOSAL
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;