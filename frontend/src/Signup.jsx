import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendTokenToBackend = async (user) => {
    const token = await user.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });
    return res.ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const isOk = await sendTokenToBackend(auth.currentUser);
      if (isOk) navigate("/events");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      const isOk = await sendTokenToBackend(auth.currentUser);
      if (isOk) navigate("/events");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Animated Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="container d-flex justify-content-center align-items-center vh-100 position-relative">
        <div className="glass-auth-card p-4 p-md-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark tracking-tight">Create Account</h2>
            <p className="text-muted small">Join our community and explore events</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="auth-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="auth-input"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="auth-label">PASSWORD</label>
              <input
                type="password"
                className="auth-input"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="password-hint mt-2">Must be at least 6 characters</div>
            </div>

            <button type="submit" className="btn-auth-primary w-100 py-3 mb-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : "Get Started"}
            </button>
          </form>

          <div className="auth-divider mb-4">
            <span>or sign up with</span>
          </div>

          <button onClick={handleGoogleSignup} className="btn-google-social w-100 mb-4">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <p className="text-center small text-muted mb-0">
            Already have an account? <Link to="/login" className="text-indigo fw-bold text-decoration-none">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;