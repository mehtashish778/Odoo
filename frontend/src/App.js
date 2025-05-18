import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import Profile from './components/profile/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/" element={ <HomePage /> } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Simple HomePage component for now
const HomePage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome to SynergySphere</h1>
      {isAuthenticated ? (
        <p>Hello, {user && user.email ? user.email : 'User'}! You are logged in.</p>
      ) : (
        <p>Please <a href="/login">login</a> or <a href="/signup">sign up</a>.</p>
      )}
      {isAuthenticated && (
        <p><a href="/dashboard">Go to Dashboard</a></p>
      )}
    </div>
  );
};

export default App;
