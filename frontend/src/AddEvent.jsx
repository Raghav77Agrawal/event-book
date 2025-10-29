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
    poster: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
     alert("Your event will be listed in 1hour in upcoming events if approved by admin");
      }
    } catch (e) {
      console.error("Error adding event:", e);
      alert("Something went wrong!");
    }

    setFormData({
      name: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      organizer: "",
      price: 0,
      poster: null,
    });
  };

  return (
    <div
      className="container py-5 d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #D8B4FE 0%, #818CF8 100%)",
      }}
    >
      <div
        className="card shadow-lg p-4 w-100"
        style={{
          maxWidth: "700px",
          borderRadius: "1.5rem",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2 className="text-center mb-4 fw-bold text-primary">
          🎪 Request to Add your Event
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold">Event Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write something about your event..."
                required
              ></textarea>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Date</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Time</label>
              <input
                type="time"
                className="form-control"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Venue</label>
              <input
                type="text"
                className="form-control"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Where is it happening?"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Organizer</label>
              <input
                type="text"
                className="form-control"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="Organizer name"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ticket price"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Event Poster</label>
              <input
                type="file"
                className="form-control"
                name="poster"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn px-5 py-2 fw-semibold shadow-sm"
          
              style={{
                borderRadius: "2rem",
                fontSize: "1.1rem",
                background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
                color: "white",
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background =
                  "linear-gradient(90deg, #7C3AED, #4F46E5)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background =
                  "linear-gradient(90deg, #4F46E5, #7C3AED)")
              }
            >
              🚀 Submit Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
