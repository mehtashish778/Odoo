import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user, loading, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Initialize form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '' });
    }
  }, [user]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    // This case should ideally be handled by PrivateRoute, but as a fallback:
    return <div>Could not load user profile. Please try logging in again.</div>;
  }

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear any previous errors when typing
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false); // Close the edit form after successful update
      // Success message will disappear after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError(''); // Clear any errors when toggling edit mode
    setSuccess(''); // Clear success message
    
    // Reset form data to current user data when opening edit form
    if (!isEditing) {
      setFormData({ name: user.name || '' });
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      
      {/* Success and Error Messages */}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Display Profile Information */}
      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {user.name || 'Not set'}</p>
      </div>
      
      {/* Edit Profile Button */}
      <button 
        onClick={toggleEdit} 
        style={{ marginBottom: '1rem' }}
      >
        {isEditing ? 'Cancel' : 'Edit Profile'}
      </button>
      
      {/* Edit Profile Form */}
      {isEditing && (
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name"
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              placeholder="Enter your name"
            />
          </div>
          <input 
            type="submit" 
            value="Update Profile" 
            style={{ marginTop: '1rem' }}
          />
        </form>
      )}
    </div>
  );
};

export default Profile; 