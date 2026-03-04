import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff5f5 0%, #fff1f2 100%)",
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
        {/* Cancel Icon */}
        <div 
          className="mx-auto mb-4 d-flex align-items-center justify-content-center"
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#fff1f2",
            borderRadius: "50%",
            color: "#ef4444",
            fontSize: "2.5rem"
          }}
        >
          ✕
        </div>

        <h2 className="fw-bold text-dark mb-2">Payment Cancelled</h2>
        <p className="text-secondary mb-4">
          Your payment was not processed. No charges were made to your account.
        </p>

        <button
          onClick={() => navigate('/')}
          className="btn btn-lg w-100 text-white shadow-sm"
          style={{
            background: "#ef4444",
            borderRadius: "12px",
            border: "none",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;