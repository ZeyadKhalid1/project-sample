import React, { useState, useEffect } from 'react';

function PetsPage() {
    const [pets, setPets] = useState([]);
    const [newPet, setNewPet] = useState({
        name: '',
        species: '',
        breed: '',
        age: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPets();
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

    const handleInputChange = (e) => {
        setNewPet({
            ...newPet,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newPet)
            });
            if (!response.ok) throw new Error('Failed to add pet');
            setSuccess('Pet added successfully!');
            setNewPet({ name: '', species: '', breed: '', age: '' });
            fetchPets();
        } catch (err) {
            setError('Failed to add pet');
        }
    };

    const handleDelete = async (petId) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/pets/${petId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to delete pet');
                setSuccess('Pet removed successfully');
                fetchPets();
            } catch (err) {
                setError('Failed to remove pet');
            }
        }
    };

    return (
        <div className="container">
            <h2 className="mb-4">My Pets</h2>
            
            {/* Add New Pet Form */}
            <div className="card mb-4">
                <div className="card-body">
                    <h3 className="card-title">Add New Pet</h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                placeholder="Pet Name"
                                value={newPet.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <select
                                className="form-control"
                                name="species"
                                value={newPet.species}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Species</option>
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                                <option value="Bird">Bird</option>
                                <option value="Rabbit">Rabbit</option>
                                <option value="Hamster">Hamster</option>
                                <option value="Fish">Fish</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                name="breed"
                                placeholder="Breed"
                                value={newPet.breed}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                            <input
                                type="text"
                                className="form-control"
                                name="age"
                                value={newPet.age}
                                onChange={handleInputChange}
                                required
                                style={{ width: '80px', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                                maxLength="3"
                                pattern="\d{1,3}"
                                placeholder="Age"
                            />
                            <span className="ms-2">months</span>
                        </div>
                        <button type="submit" className="btn btn-primary">Add Pet</button>
                    </form>
                </div>
            </div>

            {/* Pet List */}
            <div className="row">
                {pets.map(pet => (
                    <div key={pet.id} className="col-md-4 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{pet.name}</h5>
                                <p className="card-text">
                                    <strong>Species:</strong> {pet.species}<br />
                                    <strong>Breed:</strong> {pet.breed || 'Not specified'}<br />
                                    <strong>Age:</strong> {pet.age} months
                                </p>
                                <button 
                                    onClick={() => handleDelete(pet.id)} 
                                    className="btn btn-danger btn-sm"
                                >
                                    Remove Pet
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PetsPage;
