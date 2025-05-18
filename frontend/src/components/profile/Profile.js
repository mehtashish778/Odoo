import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    // This case should ideally be handled by PrivateRoute, but as a fallback:
    return <div>Could not load user profile. Please try logging in again.</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>
      {/* More profile information will go here later */}
      {/* For example: Name, Bio, Profile Picture, etc. */}
      {/* We might also add an "Edit Profile" button here */}
    </div>
  );
};

export default Profile; 