import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
// import Navbar from './components/layout/Navbar'; // We can add this later
// import Dashboard from './components/dashboard/Dashboard'; // Example protected route
// import PrivateRoute from './components/routing/PrivateRoute'; // To protect routes

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Navbar /> */}
        <div className="container"> {/* Added a general container for centering content */}
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
            <Route path="/" element={ <HomePage /> } /> {/* Basic HomePage component */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Simple HomePage component for now
const HomePage = () => {
  return (
    <div>
      <h1>Welcome to SynergySphere</h1>
      <p>Please <a href="/login">login</a> or <a href="/signup">sign up</a>.</p>
      {/* We can add links or content based on auth state here later */}
    </div>
  );
};

export default App;
