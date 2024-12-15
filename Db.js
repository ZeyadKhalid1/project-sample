const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('vet.db');

// Create tables in series
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
        }
    });

    // Pets table
    db.run(`CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        age INTEGER,
        FOREIGN KEY (owner_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating pets table:', err);
        } else {
            console.log('Pets table ready');
        }
    });

    // Vets table
    db.run(`CREATE TABLE IF NOT EXISTS vets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        specialization TEXT,
        available_days TEXT,
        available_hours TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating vets table:', err);
        } else {
            console.log('Vets table ready');
        }
    });

    // Appointments table
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        vet_id INTEGER NOT NULL,
        appointment_date DATETIME NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id),
        FOREIGN KEY (vet_id) REFERENCES vets(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating appointments table:', err);
        } else {
            console.log('Appointments table ready');
        }
    });

    // Add default vets if they don't exist
    db.get('SELECT COUNT(*) as count FROM vets', [], (err, result) => {
        if (err) {
            console.error('Error checking vets:', err);
            return;
        }
        
        if (result.count === 0) {
            // Add two default veterinarians
            const defaultVets = [
                {
                    name: 'Dr. Sarah Johnson',
                    specialization: 'Small Animals, Surgery',
                    available_days: 'Monday,Tuesday,Wednesday,Thursday',
                    available_hours: '09:00-17:00'
                },
                {
                    name: 'Dr. Michael Chen',
                    specialization: 'Exotic Pets, Internal Medicine',
                    available_days: 'Wednesday,Thursday,Friday',
                    available_hours: '10:00-18:00'
                }
            ];

            defaultVets.forEach(vet => {
                db.run(
                    'INSERT INTO vets (name, specialization, available_days, available_hours) VALUES (?, ?, ?, ?)',
                    [vet.name, vet.specialization, vet.available_days, vet.available_hours],
                    (err) => {
                        if (err) {
                            console.error('Error adding default vet:', err);
                        } else {
                            console.log('Added vet:', vet.name);
                        }
                    }
                );
            });
        }
    });
});

module.exports = db;