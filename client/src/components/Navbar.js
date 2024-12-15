import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ isAuthenticated, setIsAuthenticated, userRole }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                setIsAuthenticated(false);
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <div className="navbar-left">
                    <Link className="navbar-brand" to="/">Vet Clinic</Link>
                    {isAuthenticated && (
                        <ul className="navbar-nav">
                            <li className="nav-item"><Link className="nav-link" to="/appointments">Appointments</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/book-appointment">Book Appointment</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/pets">My Pets</Link></li>
                            {userRole === 'admin' && (
                                <li className="nav-item"><Link className="nav-link" to="/admin">Admin Dashboard</Link></li>
                            )}
                        </ul>
                    )}
                </div>
                <div className="navbar-right">
                    {!isAuthenticated ? (
                        <div className="navbar-right">
                            <Link className="auth-button" to="/login">Login</Link>
                            <Link className="auth-button ms-2 register-button" to="/register">Register</Link>
                        </div>
                    ) : (
                        <div className="navbar-right">
                            <button className="auth-button ms-2" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
