import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminLogin = ({ setIsAdmin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const completeAdminLogin = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok || data.user?.role !== "admin") {
      throw new Error("This account does not have administrator access.");
    }

    setIsAdmin(true);
    navigate("/admin/dashboard");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await completeAdminLogin(result.user);
    } catch (loginError) {
      setError(loginError.message || "Administrator authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await completeAdminLogin(result.user);
    } catch (loginError) {
      setError(loginError.message || "Administrator authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-bg-blur" />
      <div className="container d-flex justify-content-center align-items-center vh-100 position-relative">
        <div className="glass-admin-card p-5 shadow-2xl">
          <div className="text-center mb-5">
            <div className="admin-icon-circle mb-3">
              <i className="bi bi-shield-lock-fill" />
            </div>
            <h2 className="fw-bold text-white mb-1">Admin Portal</h2>
            <p className="text-light-muted small">Sign in with an authorized Firebase account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="admin-label" htmlFor="admin-email">EMAIL ADDRESS</label>
              <input
                id="admin-email"
                type="email"
                className="admin-input"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="admin-label" htmlFor="admin-password">PASSWORD</label>
              <input
                id="admin-password"
                type="password"
                className="admin-input"
                placeholder="Your password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                required
              />
            </div>

            {error && <div className="admin-error-box mb-4">{error}</div>}

            <button type="submit" className="btn-admin-submit w-100 py-3" disabled={isLoading}>
              {isLoading ? <span className="spinner-border spinner-border-sm" /> : "Authorize Access"}
            </button>
          </form>

          <button type="button" onClick={handleGoogleLogin} className="btn btn-light w-100 mt-3" disabled={isLoading}>
            Continue with Google
          </button>

          <div className="text-center mt-4">
            <button type="button" onClick={() => navigate("/")} className="btn btn-link btn-sm text-light-muted text-decoration-none">
              Return to Main Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
