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
        <Link to='/projects'>
          <i className="fas fa-list-ul"></i> <span className="hide-sm">Projects</span>
        </Link>
      </li>
      <li className="dropdown">
        <a href="#!" className="dropdown-toggle">
          <i className="fas fa-user-circle"></i> <span className="hide-sm">{user?.name || user?.email?.split('@')[0] || 'Account'}</span>
        </a>
        <div className="dropdown-menu">
          <Link to='/profile'>
            <i className="fas fa-user"></i> Profile
          </Link>
          <a onClick={onLogout} href="#!">
            <i className="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </li>
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
        <Link to='/'>
          <i className="fas fa-tasks"></i> SynergySphere
        </Link> {/* Placeholder icon */}
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar; 