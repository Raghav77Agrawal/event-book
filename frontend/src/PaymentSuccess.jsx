import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios"; // or use fetch

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

 
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/verify-session/${sessionId}`);
        
        if (response.data.status) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error("Verification failed", error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-success" role="status"></div>
        <span className="ms-2">Verifying Payment...</span>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="card border-0 shadow-lg text-center p-5"
        style={{
          maxWidth: "400px",
          width: "90%",
          borderRadius: "2rem",
          backgroundColor: "white",
        }}
      >
        {isVerified ? (
          <>
            <div 
              className="mx-auto mb-4 d-flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#f0fdf4",
                borderRadius: "50%",
                color: "#22c55e",
                fontSize: "2.5rem"
              }}
            >
              ✓
            </div>
            <h2 className="fw-bold text-dark mb-2">Payment Done!</h2>
            <p className="text-secondary mb-4">
              Your transaction was completed successfully. Your tickets are now available in your dashboard.
            </p>
          </>
        ) : (
          <>
            <div className="text-danger mb-4" style={{ fontSize: "2.5rem" }}>✕</div>
            <h2 className="fw-bold text-dark mb-2">Verification Failed</h2>
            <p className="text-secondary mb-4">
              We couldn't verify your session. If you paid, please check your email for the ticket.
            </p>
          </>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-lg w-100 text-white shadow-sm"
          style={{
            background: isVerified ? "#22c55e" : "#6c757d",
            borderRadius: "12px",
            border: "none",
            fontWeight: "600",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;