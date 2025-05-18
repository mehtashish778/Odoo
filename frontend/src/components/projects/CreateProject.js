import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const CreateProject = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] // This will be an array of email addresses
  });
  
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { name, description, members } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMember = () => {
    if (memberEmail && !members.includes(memberEmail)) {
      setFormData({
        ...formData,
        members: [...members, memberEmail]
      });
      setMemberEmail(''); // Clear the input
    }
  };

  const handleRemoveMember = (email) => {
    setFormData({
      ...formData,
      members: members.filter(member => member !== email)
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!name) {
      setError('Project name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/api/projects', formData, token);
      navigate('/dashboard'); // Redirect to dashboard after successful creation
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="create-project-container">
      <h2>Create New Project</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Project Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Project Members</label>
          <div className="member-input-container">
            <input
              type="email"
              placeholder="Enter member email"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handleAddMember}
              className="btn-add-member"
            >
              Add
            </button>
          </div>
          
          {members.length > 0 && (
            <div className="member-list">
              <h4>Added Members:</h4>
              <ul>
                {members.map((email, index) => (
                  <li key={index}>
                    {email}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMember(email)}
                      className="btn-remove-member"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject; 