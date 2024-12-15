const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./Db');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // TODO: Set this in environment variables
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Middleware Setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Only serve static files and use catch-all route in production
if (!isDev) {
    app.use(express.static(path.join(__dirname, 'client/build')));
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Auth Routes
// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            
            if (user) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user with 'user' role
            db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 'user'],
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: 'Error creating user' });
                    }

                    // Create token for automatic login
                    const token = jwt.sign(
                        { 
                            id: this.lastID,
                            email: email,
                            role: 'user'
                        },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    // Set token in cookie
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 24 * 60 * 60 * 1000 // 24 hours
                    });

                    res.status(201).json({
                        message: 'User created successfully',
                        id: this.lastID,
                        username,
                        email,
                        role: 'user'
                    });
                }
            );
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        try {
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Create token with user ID
            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    role: user.role || 'user'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            // Send user info (excluding password)
            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (err) {
            console.error('Error during login:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Pet Management Routes
// Add Pet
app.post('/api/pets', authenticateToken, (req, res) => {
    const { name, species, breed, age } = req.body;
    const owner_id = req.user.id;

    db.run('INSERT INTO pets (owner_id, name, species, breed, age) VALUES (?, ?, ?, ?, ?)',
        [owner_id, name, species, breed, age],
        (err) => {
            if (err) return res.status(500).json({ error: 'Error creating pet' });
            res.status(201).json({ message: 'Pet added successfully' });
        });
});

// Get User's Pets
app.get('/api/pets', authenticateToken, (req, res) => {
    db.all('SELECT * FROM pets WHERE owner_id = ?', [req.user.id], (err, pets) => {
        if (err) return res.status(500).json({ error: 'Error fetching pets' });
        res.json(pets);
    });
});

// Delete Pet
app.delete('/api/pets/:id', authenticateToken, (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;

    // First verify that the pet belongs to the user
    db.get('SELECT * FROM pets WHERE id = ? AND owner_id = ?', [petId, userId], (err, pet) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!pet) return res.status(404).json({ error: 'Pet not found or not authorized' });

        // If verified, delete the pet
        db.run('DELETE FROM pets WHERE id = ?', [petId], (err) => {
            if (err) return res.status(500).json({ error: 'Error deleting pet' });
            res.json({ message: 'Pet deleted successfully' });
        });
    });
});

// Appointment Routes
// Get Available Vets
app.get('/api/vets', (req, res) => {
    db.all('SELECT * FROM vets', [], (err, vets) => {
        if (err) return res.status(500).json({ error: 'Error fetching vets' });
        res.json(vets);
    });
});

// Book Appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
    const { pet_id, vet_id, appointment_date, reason } = req.body;
    
    // Validate the appointment date
    const date = new Date(appointment_date);
    if (isNaN(date)) {
        return res.status(400).json({ error: 'Invalid appointment date format' });
    }

    // Check if the appointment is in the future
    if (date < new Date()) {
        return res.status(400).json({ error: 'Appointment date must be in the future' });
    }
    
    // Verify pet belongs to user
    db.get('SELECT * FROM pets WHERE id = ? AND owner_id = ?', [pet_id, req.user.id], (err, pet) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!pet) return res.status(403).json({ error: 'Not authorized' });

        // Store the date in ISO format
        const isoDate = date.toISOString();

        db.run('INSERT INTO appointments (pet_id, vet_id, appointment_date, reason, status) VALUES (?, ?, ?, ?, ?)',
            [pet_id, vet_id, isoDate, reason, 'pending'],
            (err) => {
                if (err) {
                    console.error('Error creating appointment:', err);
                    return res.status(500).json({ error: 'Error creating appointment' });
                }
                res.status(201).json({ message: 'Appointment booked successfully' });
            });
    });
});

// Get User's Appointments
app.get('/api/appointments', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // First verify the user exists
    db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Error verifying user:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Get appointments for the verified user
        const query = `
            SELECT 
                a.id,
                a.appointment_date,
                a.reason,
                a.status,
                p.name as pet_name,
                v.name as vet_name
            FROM appointments a
            JOIN pets p ON a.pet_id = p.id
            JOIN vets v ON a.vet_id = v.id
            WHERE p.owner_id = ?
            ORDER BY a.appointment_date DESC
        `;
        
        db.all(query, [userId], (err, appointments) => {
            if (err) {
                console.error('Error fetching appointments:', err);
                return res.status(500).json({ error: 'Error fetching appointments' });
            }
            // Format dates before sending
            const formattedAppointments = appointments.map(apt => ({
                ...apt,
                appointment_date: new Date(apt.appointment_date).toISOString()
            }));
            res.json(formattedAppointments);
        });
    });
});

// Cancel appointment endpoint
app.patch('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const appointmentId = req.params.id;
        
        // Find the appointment and verify it belongs to the user
        db.get('SELECT * FROM appointments WHERE id = ? AND pet_id IN (SELECT id FROM pets WHERE owner_id = ?)', [appointmentId, req.user.id], async (err, appointment) => {
            if (err) {
                console.error('Error cancelling appointment:', err);
                return res.status(500).json({ message: 'Error cancelling appointment' });
            }
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found or already cancelled' });
            }

            if (appointment.status === 'cancelled') {
                return res.status(400).json({ message: 'Appointment already cancelled' });
            }

            // Update the appointment status
            db.run('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', appointmentId], (err) => {
                if (err) {
                    console.error('Error cancelling appointment:', err);
                    return res.status(500).json({ message: 'Error cancelling appointment' });
                }
                res.json({ message: 'Appointment cancelled successfully' });
            });
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Error cancelling appointment' });
    }
});

// Get all appointments (admin only)
app.get('/api/admin/appointments', authenticateToken, isAdmin, (req, res) => {
    const query = `
        SELECT 
            a.id,
            a.appointment_date,
            a.reason,
            a.status,
            p.name as pet_name,
            u.username as owner_name,
            v.name as vet_name
        FROM appointments a
        JOIN pets p ON a.pet_id = p.id
        JOIN users u ON p.owner_id = u.id
        JOIN vets v ON a.vet_id = v.id
        ORDER BY a.appointment_date DESC
    `;
    
    db.all(query, [], (err, appointments) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            return res.status(500).json({ error: 'Error fetching appointments' });
        }
        res.json(appointments);
    });
});

// Update appointment status (admin only)
app.patch('/api/admin/appointments/:id/status', authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;
    const appointmentId = req.params.id;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'denied'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId], (err) => {
        if (err) {
            console.error('Error updating appointment status:', err);
            return res.status(500).json({ error: 'Error updating appointment status' });
        }
        res.json({ message: 'Appointment status updated successfully' });
    });
});

// Catch-all Route for React App (only in production)
if (!isDev) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    if (isDev) {
        console.log('Running in development mode');
        console.log('Frontend URL: http://localhost:3000');
    } else {
        console.log('Running in production mode');
        console.log(`Frontend URL: http://localhost:${PORT}`);
    }
});

db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    `);

    // Pets table
    db.run(`
        CREATE TABLE IF NOT EXISTS pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            species TEXT NOT NULL,
            breed TEXT,
            age INTEGER,
            owner_id INTEGER NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    `);

    // Appointments table with status field
    db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id INTEGER NOT NULL,
            vet_id INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed', 'denied')),
            FOREIGN KEY (pet_id) REFERENCES pets (id)
        )
    `);

    // Vets table
    db.run(`
        CREATE TABLE IF NOT EXISTS vets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT
        )
    `);
});
