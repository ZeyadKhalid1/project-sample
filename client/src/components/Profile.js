import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/api/profile', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setUser(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return (
            <div className="page-content">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="form-container">
                <h2 className="text-center mb-4">My Profile</h2>
                
                <div className="card">
                    <div className="card-body">
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={user.name}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                value={user.email}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Role:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={user.role}
                                readOnly
                            />
                        </div>

                        <button
                            className="btn btn-primary w-100"
                            onClick={() => navigate('/edit-profile')}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
