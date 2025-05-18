import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  const authLinks = (
    <ul>
      <li>
        <Link to='/profile'> {/* Link to Profile page */}
          <i className="fas fa-user"></i> <span className="hide-sm">Profile</span>
        </Link>
      </li>
      <li>
        <Link to='/dashboard'> {/* Link to Dashboard page */}
          <i className="fas fa-tachometer-alt"></i> <span className="hide-sm">Dashboard</span>
        </Link>
      </li>
      <li>
        <a onClick={onLogout} href='#!'>
          <i className="fas fa-sign-out-alt"></i> <span className="hide-sm">Logout</span>
        </a>
      </li>
      {/* Add other links for authenticated users here, e.g., Profile, Dashboard */}
    </ul>
  );

  const guestLinks = (
    <ul>
      <li><Link to='/signup'>Sign Up</Link></li>
      <li><Link to='/login'>Login</Link></li>
      {/* Add other links for guests here, e.g., About */}
    </ul>
  );

  return (
    <nav className='navbar bg-dark'> {/* Basic styling, can be improved */}
      <h1>
        <Link to='/'><i className="fas fa-code"></i> SynergySphere</Link> {/* Placeholder icon */}
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar; 