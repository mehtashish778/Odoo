import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import Profile from './components/profile/Profile';
import ProjectDashboard from './components/projects/ProjectDashboard';
import CreateProject from './components/projects/CreateProject';
import ProjectDetail from './components/projects/ProjectDetail';
import CreateTask from './components/tasks/CreateTask';
import TaskDetail from './components/tasks/TaskDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<HomePage />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              {/* Redirect /dashboard to /projects for a better UX */}
              <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Project routes */}
              <Route path="/projects" element={<ProjectDashboard />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              
              {/* Task routes */}
              <Route path="/projects/:projectId/tasks/new" element={<CreateTask />} />
              <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Simple HomePage component that redirects authenticated users to the dashboard
const HomePage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Navigate to="/projects" />;
  }

  return (
    <div className="home-container">
      <h1>Welcome to SynergySphere</h1>
      <p>A collaborative platform for teams to manage projects and tasks.</p>
      <div className="home-cta">
        <a href="/login" className="btn-primary">Login</a>
        <a href="/signup" className="btn-secondary">Sign Up</a>
      </div>
    </div>
  );
};

export default App;
