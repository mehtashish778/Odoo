import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  }

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Login successful, AuthContext will set isAuthenticated to true
      // navigate('/'); // Navigate to homepage or dashboard (handled by useEffect)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login component error:', err);
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Navigate to homepage or dashboard
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
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
            placeholder="Password" 
            name="password" 
            value={password} 
            onChange={onChange} 
            required 
          />
        </div>
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default Login; 