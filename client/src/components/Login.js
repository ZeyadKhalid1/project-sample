import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated, setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };

    if (!email) {
      errors.email = 'Email is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);

    return Object.keys(errors).every(key => errors[key] === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const userData = await response.json();
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/appointments');
      }
      setIsAuthenticated(true);
      setUserRole(userData.role);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Login</h2>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {formErrors.password && (
                    <div className="invalid-feedback">
                      {formErrors.password}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
