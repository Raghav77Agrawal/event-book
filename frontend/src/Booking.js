import React, { useState } from "react";

const EventBooking = () => {
  const [formData, setFormData] = useState({ name: "", email: "", tickets: 1 });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Booking successful!");
    // API call to register booking
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "450px", borderRadius: "1rem", border: "none" }}
      >
        <h3 className="text-center mb-4 fw-bold">Book Your Spot</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
            <label>Full Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <label>Email</label>
          </div>

          <div className="form-floating mb-4">
            <input
              type="number"
              className="form-control"
              name="tickets"
              value={formData.tickets}
              onChange={handleChange}
              min="1"
              max="10"
              placeholder="Number of Tickets"
              required
            />
            <label>Tickets</label>
          </div>

          <button className="btn btn-primary w-100 py-2" style={{ borderRadius: "2rem" }}>
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventBooking;
