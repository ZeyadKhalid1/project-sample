import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/appointments', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            setError('Error fetching appointments');
            console.error('Error:', error);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/cancel`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to cancel appointment');
            }

            setSuccess('Appointment cancelled successfully');
            // Update the local state to reflect the cancellation
            setAppointments(appointments.map(apt => 
                apt.id === appointmentId 
                    ? { ...apt, status: 'cancelled' } 
                    : apt
            ));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message);
            // Clear error message after 3 seconds
            setTimeout(() => setError(''), 3000);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date)) return 'Invalid date';
            
            // Format date as DD/MM/YYYY
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            // Format time as HH:MM AM/PM
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12
            
            return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid date';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-success';
            case 'pending':
                return 'bg-warning text-dark';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="container mt-4">
            <h2>My Appointments</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            {appointments.length === 0 ? (
                <div className="alert alert-info">
                    No appointments found. <a href="/book-appointment">Book an appointment</a>
                </div>
            ) : (
                <div className="row">
                    {appointments.map(appointment => (
                        <div key={appointment.id} className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title mb-0">
                                            Appointment with {appointment.vet_name}
                                        </h5>
                                        <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="card-text">
                                        <strong>Pet:</strong> {appointment.pet_name}<br />
                                        <strong>Date:</strong> {formatDateTime(appointment.appointment_date)}<br />
                                        <strong>Reason:</strong> {appointment.reason}
                                    </p>
                                    {appointment.status !== 'cancelled' && (
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => handleCancel(appointment.id)}
                                        >
                                            Cancel Appointment
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AppointmentsPage;
