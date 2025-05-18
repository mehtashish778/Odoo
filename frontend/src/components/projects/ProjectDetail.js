import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch project data and tasks
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectData = await api.get(`/api/projects/${projectId}`, token);
        setProject(projectData);
        
        // Fetch tasks for this project
        const tasksData = await api.get(`/api/tasks/project/${projectId}`, token);
        setTasks(tasksData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project. Please try again.');
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, token]);

  const handleCreateTask = () => {
    navigate(`/projects/${projectId}/tasks/new`);
  };

  if (loading) {
    return <div>Loading project...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-container">
        <p>Project not found.</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // Group tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="project-detail-container">
      <div className="project-header">
        <h2>{project.name}</h2>
        <div className="header-actions">
          <button 
            onClick={handleCreateTask}
            className="btn-add"
          >
            <i className="fas fa-plus"></i> Add Task
          </button>
        </div>
      </div>

      {project.description && (
        <div className="project-description">
          <p>{project.description}</p>
        </div>
      )}

      <div className="task-board">
        {/* Pending Tasks Column */}
        <div className="task-column pending-column">
          <h3>To Do</h3>
          {pendingTasks.length === 0 ? (
            <p className="no-tasks">No pending tasks</p>
          ) : (
            pendingTasks.map(task => (
              <div 
                key={task.id} 
                className="task-card"
                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
              >
                <h4>{task.title}</h4>
                {task.dueDate && (
                  <p className="task-due-date">
                    <i className="fas fa-calendar"></i> 
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                {task.assigneeId && (
                  <div className="task-assignee">
                    <i className="fas fa-user-circle"></i> {/* Replace with user's name or avatar later */}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* In Progress Tasks Column */}
        <div className="task-column in-progress-column">
          <h3>In Progress</h3>
          {inProgressTasks.length === 0 ? (
            <p className="no-tasks">No tasks in progress</p>
          ) : (
            inProgressTasks.map(task => (
              <div 
                key={task.id} 
                className="task-card"
                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
              >
                <h4>{task.title}</h4>
                {task.dueDate && (
                  <p className="task-due-date">
                    <i className="fas fa-calendar"></i> 
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                {task.assigneeId && (
                  <div className="task-assignee">
                    <i className="fas fa-user-circle"></i>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Completed Tasks Column */}
        <div className="task-column completed-column">
          <h3>Completed</h3>
          {completedTasks.length === 0 ? (
            <p className="no-tasks">No completed tasks</p>
          ) : (
            completedTasks.map(task => (
              <div 
                key={task.id} 
                className="task-card"
                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
              >
                <h4>{task.title}</h4>
                {task.dueDate && (
                  <p className="task-due-date">
                    <i className="fas fa-calendar"></i> 
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                {task.assigneeId && (
                  <div className="task-assignee">
                    <i className="fas fa-user-circle"></i>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 