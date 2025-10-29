import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

const Navbar = ({ isAdmin, setIsAdmin }) => {
  const navigate = useNavigate();
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

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          EventBook
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
           
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Upcoming Events
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/addevent">
                    Add Event
                  </Link>
                </li>
                 {!isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    Admin
                  </Link>
                </li>
                 )}
              </>
           

            {isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    Pending Requests
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-danger ms-2" onClick={handleAdminLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/event">
                    My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" onClick={handleLogout}>
                    Logout
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Signup
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
