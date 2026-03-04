import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ setIsAdmin }) => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const HARDCODED_ID = process.env.REACT_APP_USERID;
    const HARDCODED_CODE = process.env.REACT_APP_PASSWORD;

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate a brief network delay for a "realistic" feel
        setTimeout(() => {
            if (adminId === HARDCODED_ID && password === HARDCODED_CODE) {
                localStorage.setItem("isAdmin", "true");
                setIsAdmin(true);
                navigate('/admin/dashboard');
            } else {
                setError('Authentication failed. Invalid credentials.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="admin-login-wrapper">
            {/* Dark Professional Background Shapes */}
            <div className="admin-bg-blur"></div>
            
            <div className="container d-flex justify-content-center align-items-center vh-100 position-relative">
                <div className="glass-admin-card p-5 shadow-2xl">
                    <div className="text-center mb-5">
                        <div className="admin-icon-circle mb-3">
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>
                        <h2 className="fw-bold text-white mb-1">Admin Portal</h2>
                        <p className="text-light-muted small">Restricted Access Area</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="admin-label">ADMINISTRATOR ID</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="Enter ID"
                                value={adminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="admin-label">SECURITY CODE</label>
                            <input
                                type="password"
                                className="admin-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="admin-error-box mb-4 animate__animated animate__shakeX">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn-admin-submit w-100 py-3" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                "Authorize Access"
                            )}
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-link btn-sm text-light-muted text-decoration-none"
                        >
                            <i className="bi bi-arrow-left me-1"></i> Return to Main Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;