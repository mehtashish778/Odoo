import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <p>Welcome to your dashboard, {user.email}!</p>
      ) : (
        <p>Loading user data...</p>
      )}
      <p>This is a protected area.</p>
      {/* More dashboard content will go here */}
    </div>
  );
};

export default Dashboard; 