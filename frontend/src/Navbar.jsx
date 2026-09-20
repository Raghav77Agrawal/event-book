import { signOut } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

const Navbar = ({ isAdmin, setIsAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active-link" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg sticky-top modern-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="brand-icon me-2">🎟️</span>
          <span className="brand-text">Event<span className="text-primary">Book</span></span>
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className={isActive("/")} to="/">Upcoming</Link></li>
            {user && <li className="nav-item"><Link className={isActive("/addevent")} to="/addevent">Host Event</Link></li>}
            {user && <li className="nav-item"><Link className={isActive("/event")} to="/event">My Bookings</Link></li>}
            {isAdmin && <li className="nav-item"><Link className={isActive("/admin/dashboard")} to="/admin/dashboard">Admin Dashboard</Link></li>}
            {isAdmin && <li className="nav-item"><Link className={isActive("/admin/analytics")} to="/admin/analytics"><i className="bi bi-graph-up-arrow me-1" />Analytics</Link></li>}
            <div className="nav-divider d-none d-lg-block mx-3" />
            {user ? (
              <li className="nav-item ms-lg-3">
                <button className="user-profile-pill d-flex align-items-center border-0" onClick={handleLogout}>
                  <span className="avatar-circle me-2">{user.email?.[0]?.toUpperCase()}</span>
                  <span className="logout-text fw-semibold small">Logout</span>
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item"><Link className={isActive("/login")} to="/login">Login</Link></li>
                <li className="nav-item ms-lg-2"><Link className="btn btn-primary rounded-pill px-4 shadow-sm" to="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
