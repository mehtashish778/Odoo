import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const ProjectDashboard = () => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.get('/api/projects', token);
        setProjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, token]);

  const handleCreateNew = () => {
    navigate('/projects/new');
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>My Projects</h2>
        <button 
          onClick={handleCreateNew}
          className="btn-add"
        >
          <i className="fas fa-plus"></i> New Project
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {projects.length === 0 ? (
        <div className="no-projects">
          <p>You don't have any projects yet.</p>
          <button onClick={handleCreateNew}>Create your first project</button>
        </div>
      ) : (
        <div className="project-list">
          {projects.map(project => (
            <div className="project-card" key={project.id}>
              <Link to={`/projects/${project.id}`}>
                <h3>{project.name}</h3>
                <p>{project.description || 'No description'}</p>
                <div className="project-stats">
                  <span><i className="fas fa-users"></i> {project.members.length} members</span>
                  {/* We can add more stats here later, like number of tasks */}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard; 