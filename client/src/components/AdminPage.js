import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/appointments', {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 403) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch appointments');
            }
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            setError('Error fetching appointments');
            console.error('Error:', error);
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update status');
            }

            setSuccess('Appointment status updated successfully');
            // Update local state
            setAppointments(appointments.map(apt =>
                apt.id === appointmentId ? { ...apt, status: newStatus } : apt
            ));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message);
            console.error('Error:', error);
            // Clear error message after 3 seconds
            setTimeout(() => setError(''), 3000);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            cancelled: 'status-cancelled',
            completed: 'status-completed',
            denied: 'status-denied'
        };
        return colors[status] || 'status-pending';
    };

    return (
        <div className="admin-dashboard">
            <h2 className="dashboard-title">Admin Dashboard</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Owner</th>
                            <th>Pet</th>
                            <th>Vet</th>
                            <th>Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(appointment => (
                            <tr key={appointment.id}>
                                <td>{appointment.owner_name}</td>
                                <td>{appointment.pet_name}</td>
                                <td>{appointment.vet_name}</td>
                                <td>{new Date(appointment.appointment_date).toLocaleString()}</td>
                                <td>{appointment.reason}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={appointment.status}
                                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirm</option>
                                        <option value="cancelled">Cancel</option>
                                        <option value="completed">Complete</option>
                                        <option value="denied">Deny</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPage;
