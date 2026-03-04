import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      if (res.ok) {
        navigate("/events"); // Smooth redirect after login
      } else {
        alert("Login failed. Please check credentials.");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/events");
    } catch (err) {
      alert("Google Login failed");
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background Elements */}
      <div className="bg-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <div className="container d-flex justify-content-center align-items-center vh-100 position-relative">
        <div className="glass-login-card p-4 p-md-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark login-title">Welcome Back</h2>
            <p className="text-muted">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="small fw-bold text-muted mb-2 ms-1">EMAIL ADDRESS</label>
              <input
                type="email"
                className="custom-input shadow-none"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group mb-5">
              <div className="d-flex justify-content-between">
                <label className="small fw-bold text-muted mb-2 ms-1">PASSWORD</label>
                <a href="/" className="small text-decoration-none text-primary fw-bold">Forgot?</a>
              </div>
              <input
                type="password"
                className="custom-input shadow-none"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-modern-primary w-100 py-3 mb-4 d-flex align-items-center justify-content-center" disabled={loading}>
              {loading ? <div className="spinner-border spinner-border-sm me-2"></div> : "Sign In"}
            </button>
          </form>

          <div className="separator mb-4">
            <span>or continue with</span>
          </div>

          <button onClick={handleGoogleLogin} className="google-social-btn w-100 mb-4">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            <span>Google Account</span>
          </button>

          <p className="text-center small text-muted mb-0">
            New here? <Link to="/" className="text-primary fw-bold text-decoration-none">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;