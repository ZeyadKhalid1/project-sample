# Vet Clinic Management System

A modern web application for managing veterinary clinic appointments, pets, and users. Built with React, Node.js, and SQLite.

## Features

- 🔐 User Authentication (Login/Register)
- 👤 Role-based Access Control (Admin/User)
- 🐾 Pet Management
- 📅 Appointment Scheduling & Management
- 📱 Responsive Design

## Tech Stack

### Frontend
- React
- React Router
- Custom CSS (No Bootstrap)
- JWT Authentication

### Backend
- Node.js
- Express.js
- SQLite3
- JSON Web Tokens
- Cookie-based Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vet-clinic.git
cd vet-clinic
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

### Running the Application

1. Start both servers with a single command:
```bash
npm run dev:full
```

Or start them separately:

2a. Start the backend server (from root directory):
```bash
npm start
```

2b. Start the frontend development server (from client directory):
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
vet-clinic/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── styles/       # CSS files
│       └── App.js        # Main application component
├── node_modules/
├── Db.js                  # Database configuration
├── server.js              # Express server
├── package.json
└── README.md
```

## Features in Detail

### User Management
- User registration
- Secure login with JWT
- Role-based access control (Admin/User)

### Pet Management
- Add/Edit/Delete pets
- View pet details
- Pet history tracking

### Appointment System
- Schedule new appointments
- View upcoming appointments
- Cancel/Reschedule appointments
- Admin appointment management

### Admin Dashboard
- View all appointments
- Manage users
- System statistics

## Security Features

- JWT-based authentication
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- Input validation
- CORS configuration
