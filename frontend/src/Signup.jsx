import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Signup = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = auth.currentUser;

const token = await user.getIdToken();
const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
   headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",  
  },
  method:'POST',
  credentials:'include',
});
if(res.ok){
   alert("Signup successful");
}
   else{
    alert("Signup failed");
   }
      setFormData({ email: "", password: "" });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      const user = auth.currentUser;

const token = await user.getIdToken();

const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",  // 🔴 Missing earlier
  },
  method:'POST',
  credentials:'include',
  
});
if(res.ok){
      alert("Google Signup successful");
}
else{
  alert("Signup failed");
}
    } catch (err) {
      console.log(err);
     
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "1rem", border: "none" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: "#333" }}>
            Create an account
          </h2>
          <p className="text-muted small">Join our platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Email address</label>
          </div>

          <div className="form-floating mb-4">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            style={{ borderRadius: "2rem", fontWeight: "500" }}
          >
            Sign Up
          </button>
        </form>

        <div className="text-center my-3 text-muted">or</div>

        <div className="text-center mb-3">
  <button
    onClick={handleGoogleSignup}
    className="google-btn"
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google"
      className="google-icon"
    />
    <span>Sign up with Google</span>
  </button>
</div>

      </div>
    </div>
  );
};

export default Signup;

