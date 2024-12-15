import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PetsPage from './components/PetsPage';
import AppointmentsPage from './components/AppointmentsPage';
import AdminPage from './components/AdminPage';
import BookAppointment from './components/BookAppointment';
import './styles/main.css';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/check-auth', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        };

        checkAuth();
    }, []);

    return (
        <div className="App">
            <Navbar 
                isAuthenticated={isAuthenticated} 
                setIsAuthenticated={setIsAuthenticated}
                userRole={userRole}
            />
            <div className="container mt-4">
                <Routes>
                    <Route path="/login" element={
                        !isAuthenticated ? (
                            <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                        ) : (
                            <Navigate to={userRole === 'admin' ? '/admin' : '/appointments'} />
                        )
                    } />
                    <Route path="/register" element={
                        !isAuthenticated ? (
                            <Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                        ) : (
                            <Navigate to="/appointments" />
                        )
                    } />
                    <Route path="/pets" element={
                        isAuthenticated ? <PetsPage /> : <Navigate to="/login" />
                    } />
                    <Route path="/appointments" element={
                        isAuthenticated ? <AppointmentsPage /> : <Navigate to="/login" />
                    } />
                    <Route path="/book-appointment" element={
                        isAuthenticated ? <BookAppointment /> : <Navigate to="/login" />
                    } />
                    <Route path="/admin" element={
                        isAuthenticated && userRole === 'admin' ? (
                            <AdminPage />
                        ) : (
                            <Navigate to="/login" />
                        )
                    } />
                    <Route path="/" element={
                        <Navigate to={isAuthenticated ? '/appointments' : '/login'} />
                    } />
                </Routes>
            </div>
        </div>
    );
}

export default App;
