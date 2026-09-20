import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Navbar from "./Navbar";
import Signup from "./Signup";
import Login from "./Login";
import EventList from "./EventsList";
import EventBooking from "./Booking";
import AddEvent from "./AddEvent";
import EventDetails from "./EventDetails";
import TicketDetails from "./TicketDetails";
import MyBookings from "./MyBookings";
import AdminLogin from "./Admin";
import AdminEventPage from "./AdminEventPage";
import AdminDashboard from "./AdminDashBoard";
import AdminAnalytics from "./AdminAnalytics";
import PaymentSuccess from "./PaymentSuccess";
import PaymentCancel from "./PaymentCancel";

function App() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await response.json();
        setIsAdmin(response.ok && data.user?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };

    loadRole();
  }, [user]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Router>
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/event" element={user ? <MyBookings /> : <Navigate to="/login" />} />
        <Route path="/book" element={user ? <EventBooking /> : <Navigate to="/login" />} />
        <Route path="/addevent" element={user ? <AddEvent /> : <Navigate to="/login" />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/ticket/:id" element={user ? <TicketDetails /> : <Navigate to="/login" />} />
        <Route path="/admin" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
        <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} />
        <Route path="/admin/analytics" element={isAdmin ? <AdminAnalytics /> : <Navigate to="/admin" />} />
        <Route path="/admin/event/:id" element={isAdmin ? <AdminEventPage /> : <Navigate to="/admin" />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
