import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const CreateTask = () => {
  const { projectId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    status: 'pending'
  });
  
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { title, description, assigneeId, dueDate, status } = formData;

  // Fetch project data to get list of members
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectData = await api.get(`/api/projects/${projectId}`, token);
        setProject(projectData);
        
        // Fetch user details for each member to display names in dropdown
        // In a real app, you'd have a dedicated API endpoint for this
        // For our MVP, we'll keep it simple
        const memberPromises = projectData.members.map(
          memberId => api.get(`/api/users/${memberId}`, token)
            .catch(() => ({ id: memberId, name: `User ${memberId}`, email: 'unknown' }))
        );
        
        // This is a simplification - in a real app, you might have a dedicated endpoint
        const members = await Promise.all(memberPromises);
        setProjectMembers(members);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project. Please try again.');
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, token]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title) {
      setError('Task title is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create task with project ID
      const taskData = {
        ...formData,
        projectId: parseInt(projectId)
      };
      
      // Convert assigneeId to number if it's a string
      if (taskData.assigneeId) {
        taskData.assigneeId = parseInt(taskData.assigneeId);
      }
      
      await api.post('/api/tasks', taskData, token);
      navigate(`/projects/${projectId}`); // Redirect back to project detail
    } catch (err) {
      setError(err.message || 'Failed to create task. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="create-task-container">
      <h2>Create New Task</h2>
      
      <div className="project-info">
        <h3>Project: {project?.name}</h3>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
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
          <label htmlFor="assigneeId">Assignee</label>
          <select
            id="assigneeId"
            name="assigneeId"
            value={assigneeId}
            onChange={onChange}
          >
            <option value="">-- Select Assignee --</option>
            {projectMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name || member.email}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={dueDate}
            onChange={onChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={onChange}
          >
            <option value="pending">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/projects/${projectId}`)}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask; 