import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const TaskDetail = () => {
  const { projectId, taskId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    status: 'pending'
  });

  // Fetch task and project data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch task details
        const taskData = await api.get(`/api/tasks/${taskId}`, token);
        setTask(taskData);
        
        // Initialize form data with task values
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          assigneeId: taskData.assigneeId || '',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
          status: taskData.status || 'pending'
        });
        
        // Fetch project details
        const projectData = await api.get(`/api/projects/${projectId}`, token);
        setProject(projectData);
        
        // Fetch member details (simplified for MVP)
        const memberPromises = projectData.members.map(
          memberId => api.get(`/api/users/${memberId}`, token)
            .catch(() => ({ id: memberId, name: `User ${memberId}`, email: 'unknown' }))
        );
        
        const members = await Promise.all(memberPromises);
        setProjectMembers(members);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Failed to load task. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, projectId, token]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear any previous errors
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!formData.title) {
      setError('Task title is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Update task
      const taskData = { ...formData };
      
      // Convert assigneeId to number if it's a string and not empty
      if (taskData.assigneeId) {
        taskData.assigneeId = parseInt(taskData.assigneeId);
      }
      
      const updatedTask = await api.put(`/api/tasks/${taskId}`, taskData, token);
      setTask(updatedTask);
      setIsEditing(false);
      setSuccess('Task updated successfully!');
      setSubmitting(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update task. Please try again.');
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/api/tasks/${taskId}`, token);
        navigate(`/projects/${projectId}`);
      } catch (err) {
        setError(err.message || 'Failed to delete task. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading task...</div>;
  }

  if (!task) {
    return (
      <div className="error-container">
        <p>Task not found.</p>
        <button onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</button>
      </div>
    );
  }

  // Find the assignee name if there is one
  const assignee = task.assigneeId ? 
    projectMembers.find(member => member.id === task.assigneeId) : null;

  return (
    <div className="task-detail-container">
      <div className="breadcrumb">
        <button onClick={() => navigate(`/projects/${projectId}`)}>
          <i className="fas fa-arrow-left"></i> Back to Project
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      {isEditing ? (
        // Edit Form
        <div className="task-edit-form">
          <h2>Edit Task</h2>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onChange}
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="assigneeId">Assignee</label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
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
                value={formData.dueDate}
                onChange={onChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
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
                onClick={() => setIsEditing(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // View Mode
        <div className="task-details">
          <div className="task-header">
            <h2>{task.title}</h2>
            <div className="task-actions">
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-edit"
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              <button 
                onClick={handleDeleteTask}
                className="btn-delete"
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </div>
          
          <div className="task-status">
            <span className={`status-badge ${task.status}`}>
              {task.status === 'pending' ? 'To Do' : 
               task.status === 'in-progress' ? 'In Progress' : 'Completed'}
            </span>
          </div>
          
          <div className="task-meta">
            {task.dueDate && (
              <div className="task-due-date">
                <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            
            <div className="task-assignee">
              <strong>Assignee:</strong> {assignee ? (assignee.name || assignee.email) : 'Unassigned'}
            </div>
          </div>
          
          <div className="task-description">
            <h3>Description</h3>
            <p>{task.description || 'No description provided.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail; 