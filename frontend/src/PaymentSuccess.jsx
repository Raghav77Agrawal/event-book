import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying payment…");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error("Please sign in to view this booking.");
        if (!sessionId) throw new Error("Payment session is missing.");
        const token = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/verify-session/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Payment verification failed");
        setMessage(data.status === "booked" ? "Payment confirmed. Your ticket is ready." : "Payment received; ticket confirmation is pending.");
      } catch (error) { setMessage(error.message); }
      finally { setLoading(false); }
    };
    verifyPayment();
  }, [sessionId]);

  return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="text-center"><div className={loading ? "spinner-border text-primary" : "mb-3"} />{!loading && <h2>{message}</h2>} {loading && <p>{message}</p>}<button className="btn btn-primary mt-3" onClick={() => navigate("/event")}>Go to My Bookings</button></div></div>;
};
export default PaymentSuccess;
