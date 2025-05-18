import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import { AuthContext } from '../../context/AuthContext';
// We will need an API service to call the backend, or use fetch directly
// import authService from '../../services/authService'; // Example service path

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '' // For password confirmation
  });
  const [error, setError] = useState(''); // To display errors to the user

  const { name, email, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  }

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await signup({ name, email, password });
      // Signup successful, AuthContext will set isAuthenticated to true
      // Navigate to a protected route or homepage
      // No need to navigate immediately, useEffect below will handle it.
      // navigate('/'); 
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      console.error('Signup component error:', err);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Navigate to homepage or dashboard
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container">
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} 
      <form onSubmit={onSubmit}>
        <div>
          <input 
            type="text" 
            placeholder="Name (Optional)" 
            name="name" 
            value={name} 
            onChange={onChange} 
          />
        </div>
        <div>
          <input 
            type="email" 
            placeholder="Email Address" 
            name="email" 
            value={email} 
            onChange={onChange} 
            required 
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="Password (min. 6 characters)" 
            name="password" 
            value={password} 
            onChange={onChange} 
            minLength="6" 
            required 
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="Confirm Password" 
            name="password2" 
            value={password2} 
            onChange={onChange} 
            minLength="6" 
            required 
          />
        </div>
        <input type="submit" value="Sign Up" />
      </form>
    </div>
  );
};

export default Signup; 