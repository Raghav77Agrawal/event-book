import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Signup from "./Signup";
import Login from "./Login";
import EventList from "./EventsList";
import EventBooking from "./Booking";
import Navbar from "./Navbar";
import AddEvent from "./AddEvent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import EventDetails from "./EventDetails";
import TicketDetails from "./TicketDetails";
import MyBookings from "./MyBookings";
import AdminLogin from "./Admin";

import { useState, useEffect } from "react";
import AdminEventPage from "./AdminEventPage.jsx";
import AdminDashboard from "./AdminDashBoard.jsx";

function App() {
  const [user, loading] = useAuthState(auth);

  // 🧩 Admin login state
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("isAdmin");
    if (storedAdmin === "true") setIsAdmin(true);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/event" element={<MyBookings />} />
        <Route path="/book" element={user ? <EventBooking /> : <Navigate to="/login" />} />
        <Route path="/addevent" element={user || isAdmin ? <AddEvent /> : <Navigate to="/login" />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/ticket/:id" element={<TicketDetails />} />
        <Route path="/admin/event/:id" element={isAdmin ? <AdminEventPage></AdminEventPage> : <Navigate to="admin" />} />

        {/* 🧠 Pass setIsAdmin to AdminLogin */}
        <Route path="/admin" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
        {/* Optional dashboard route */}
        <Route
          path="/admin/dashboard"
          element={
            isAdmin ? <AdminDashboard className="text-center mt-5">Pending Requests (Admin Dashboard)</AdminDashboard> : <Navigate to="/admin" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
