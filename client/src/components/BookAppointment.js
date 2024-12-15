import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BookAppointment() {
    const [pets, setPets] = useState([]);
    const [vets, setVets] = useState([]);
    const [appointment, setAppointment] = useState({
        pet_id: '',
        vet_id: '',
        date: '',
        time: '',
        reason: ''
    });
    const [formErrors, setFormErrors] = useState({
        pet_id: '',
        vet_id: '',
        date: '',
        time: '',
        reason: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Generate time slots from 9 AM to 5 PM with 30-minute intervals
    const timeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        timeSlots.push(`${displayHour}:00 ${period}`);
        timeSlots.push(`${displayHour}:30 ${period}`);
    }

    useEffect(() => {
        fetchPets();
        fetchVets();
    }, []);

    const fetchPets = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/pets', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch pets');
            const data = await response.json();
            setPets(data);
        } catch (err) {
            setError('Failed to fetch pets');
        }
    };

    const fetchVets = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/vets', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch vets');
            const data = await response.json();
            setVets(data);
        } catch (err) {
            setError('Failed to fetch vets');
        }
    };

    const handleInputChange = (e) => {
        setAppointment({
            ...appointment,
            [e.target.name]: e.target.value
        });
        setFormErrors({
            ...formErrors,
            [e.target.name]: ''
        });
    };

    const validateDate = (date) => {
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;
        return regex.test(date);
    };

    const validateForm = () => {
        let isValid = true;
        const errors = {
            pet_id: '',
            vet_id: '',
            date: '',
            time: '',
            reason: ''
        };

        if (appointment.pet_id === '') {
            errors.pet_id = 'Please select a pet';
            isValid = false;
        }

        if (appointment.vet_id === '') {
            errors.vet_id = 'Please select a veterinarian';
            isValid = false;
        }

        if (!validateDate(appointment.date)) {
            errors.date = 'Please enter date in dd/mm/yyyy format';
            isValid = false;
        }

        if (appointment.time === '') {
            errors.time = 'Please select a time';
            isValid = false;
        }

        if (appointment.reason === '') {
            errors.reason = 'Please enter a reason for visit';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Parse the date
            const [day, month, year] = appointment.date.split('/');
            
            // Parse the time
            const [time, period] = appointment.time.split(' ');
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            
            // Convert to 24-hour format
            if (period === 'PM' && hour !== 12) {
                hour += 12;
            } else if (period === 'AM' && hour === 12) {
                hour = 0;
            }
            
            // Create ISO datetime string
            const dateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minutes}:00`;

            const response = await fetch('http://localhost:3001/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    pet_id: appointment.pet_id,
                    vet_id: appointment.vet_id,
                    appointment_date: dateTime,
                    reason: appointment.reason
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to book appointment');
            }

            setSuccess('Appointment booked successfully!');
            setTimeout(() => {
                navigate('/appointments');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="page-content">
            <h2 className="text-center mb-4">Book an Appointment</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Pet:</label>
                        <select
                            name="pet_id"
                            className={`form-control ${formErrors.pet_id ? 'is-invalid' : ''}`}
                            value={appointment.pet_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Choose a pet</option>
                            {pets.map(pet => (
                                <option key={pet.id} value={pet.id}>{pet.name}</option>
                            ))}
                        </select>
                        {formErrors.pet_id && (
                            <div className="invalid-feedback">{formErrors.pet_id}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Select Veterinarian:</label>
                        <select
                            name="vet_id"
                            className={`form-control ${formErrors.vet_id ? 'is-invalid' : ''}`}
                            value={appointment.vet_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Choose a vet</option>
                            {vets.map(vet => (
                                <option key={vet.id} value={vet.id}>{vet.name}</option>
                            ))}
                        </select>
                        {formErrors.vet_id && (
                            <div className="invalid-feedback">{formErrors.vet_id}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Date (dd/mm/yyyy):</label>
                        <input
                            type="text"
                            name="date"
                            className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
                            value={appointment.date}
                            onChange={handleInputChange}
                            placeholder="DD/MM/YYYY"
                        />
                        {formErrors.date && (
                            <div className="invalid-feedback">{formErrors.date}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Time:</label>
                        <select
                            name="time"
                            className={`form-control ${formErrors.time ? 'is-invalid' : ''}`}
                            value={appointment.time}
                            onChange={handleInputChange}
                        >
                            <option value="">Select time</option>
                            {timeSlots.map((time, index) => (
                                <option key={index} value={time}>{time}</option>
                            ))}
                        </select>
                        {formErrors.time && (
                            <div className="invalid-feedback">{formErrors.time}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Reason for Visit:</label>
                        <textarea
                            name="reason"
                            className={`form-control ${formErrors.reason ? 'is-invalid' : ''}`}
                            value={appointment.reason}
                            onChange={handleInputChange}
                            rows="3"
                        ></textarea>
                        {formErrors.reason && (
                            <div className="invalid-feedback">{formErrors.reason}</div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Book Appointment
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BookAppointment;
