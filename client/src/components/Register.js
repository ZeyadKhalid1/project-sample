import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ setIsAuthenticated, setUserRole }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let newErrors = { ...formErrors };

    switch (fieldName) {
      case 'username':
        newErrors.username = value.length < 3 ? 'Username must be at least 3 characters long' : '';
        break;
      case 'email':
        newErrors.email = !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ? 'Invalid email address' : '';
        break;
      case 'password':
        newErrors.password = value.length < 8 ? 'Password must be at least 8 characters long' : '';
        if (formData.confirmPassword) {
          newErrors.confirmPassword = value !== formData.confirmPassword ? 'Passwords do not match' : '';
        }
        break;
      case 'confirmPassword':
        newErrors.confirmPassword = value !== formData.password ? 'Passwords do not match' : '';
        break;
      default:
        break;
    }

    setFormErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    // Check if there are any errors
    if (Object.values(formErrors).some(error => error !== '')) {
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUserRole('user');
        navigate('/pets');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error:', err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Register</h2>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    name="username"
                    className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {formErrors.username && (
                    <div className="invalid-feedback">
                      {formErrors.username}
                    </div>
                  )}
                </div>
                <div className="form-group mt-3">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback">
                      {formErrors.email}
                    </div>
                  )}
                </div>
                <div className="form-group mt-3">
                  <label>Password:</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {formErrors.password && (
                    <div className="invalid-feedback">
                      {formErrors.password}
                    </div>
                  )}
                </div>
                <div className="form-group mt-3">
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formErrors.confirmPassword && (
                    <div className="invalid-feedback">
                      {formErrors.confirmPassword}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3">
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
