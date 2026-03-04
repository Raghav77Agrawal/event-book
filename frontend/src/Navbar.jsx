import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

const Navbar = ({ isAdmin, setIsAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    signOut(auth).catch(console.error);
    navigate("/login");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    navigate("/");
  };

  // Helper to check active route for styling
  const isActive = (path) => location.pathname === path ? "nav-link active-link" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg sticky-top modern-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="brand-icon me-2">🎟️</span>
          <span className="brand-text">Event<span className="text-primary">Book</span></span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className={isActive("/")} to="/">Upcoming</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive("/addevent")} to="/addevent">Host Event</Link>
            </li>

            {!isAdmin && !user && (
              <li className="nav-item">
                <Link className={isActive("/admin")} to="/admin">Admin Access</Link>
              </li>
            )}

            <div className="nav-divider d-none d-lg-block mx-3"></div>

            {isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className={isActive("/admin/dashboard")} to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <button className="btn btn-danger-soft rounded-pill px-4" onClick={handleAdminLogout}>
                    Admin Logout
                  </button>
                </li>
              </>
            ) : user ? (
              <>
                <li className="nav-item">
                  <Link className={isActive("/event")} to="/event">My Bookings</Link>
                </li>
                <li className="nav-item ms-lg-3">
                  <div className="user-profile-pill d-flex align-items-center" onClick={handleLogout}>
                    <div className="avatar-circle me-2">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="logout-text fw-semibold small">Logout</span>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-primary rounded-pill px-4 shadow-sm" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;