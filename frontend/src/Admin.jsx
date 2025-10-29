import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({setIsAdmin}) => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- HARDCODED ADMIN CREDENTIALS ---
    // In a real application, this would be handled securely on the backend.
    const HARDCODED_ID = 'admin_iet';
    const HARDCODED_CODE = 'iet@davv2025';

    const handleLogin = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        if (adminId === HARDCODED_ID && password === HARDCODED_CODE) {
            // Successful Authentication - SIMULATION ONLY
            console.log("Admin login successful (Simulated)");
            
            // In a real app, you'd store the JWT here.
            // For now, we'll just navigate to a mock admin dashboard page.
            localStorage.setItem("isAdmin","true");
            setIsAdmin(true);
            navigate('/admin/dashboard'); 
        } else {
            // Failed Authentication
            setError('Invalid Admin ID or Code. Please try again.');
        }
    };

    return (
        <div 
            className="container d-flex justify-content-center align-items-center" 
            style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
        >
            <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '0.75rem' }}>
                <h3 className="card-title text-center mb-4 fw-bold text-primary">Admin Access</h3>
                
                <form onSubmit={handleLogin}>
                    
                    {/* Admin ID Input */}
                    <div className="mb-3">
                        <label htmlFor="adminId" className="form-label">Admin ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="adminId"
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Admin Code</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger mb-4" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {/* Login Button */}
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                        Login
                    </button>
                    
                </form>

              
            </div>
        </div>
    );
};

export default AdminLogin;