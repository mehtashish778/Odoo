import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import ProjectComments from './ProjectComments';
import TaskBoard from './TaskBoard';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'discussion'

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

  // Handler for task updates (used by TaskBoard component)
  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
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

      <div className="project-tabs">
        <button 
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <TaskBoard
          projectId={parseInt(projectId)}
          tasks={tasks}
          token={token}
          onTaskUpdate={handleTaskUpdate}
        />
      ) : (
        <ProjectComments projectId={parseInt(projectId)} />
      )}
    </div>
  );
};

export default ProjectDetail; 