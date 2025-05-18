import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TaskBoard = ({ projectId, tasks, token, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [draggedTask, setDraggedTask] = useState(null);
  const [error, setError] = useState('');

  // Group tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    // For a cleaner drag preview
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    document.querySelectorAll('.task-column').forEach(column => {
      column.classList.remove('drag-over');
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedTask) return;
    
    // Don't do anything if the status hasn't changed
    if (draggedTask.status === newStatus) return;
    
    try {
      // Update the task status
      await api.put(`/api/tasks/${draggedTask.id}`, {
        ...draggedTask,
        status: newStatus
      }, token);
      
      // Update the UI through the parent component
      onTaskUpdate({
        ...draggedTask,
        status: newStatus
      });
      
      setDraggedTask(null);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
    }
  };

  return (
    <div className="task-board">
      {error && <p className="error-message floating">{error}</p>}
      
      {/* Pending Tasks Column */}
      <div 
        className="task-column pending-column"
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 'pending')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'pending')}
      >
        <h3>To Do</h3>
        {pendingTasks.length === 0 ? (
          <p className="no-tasks">No pending tasks</p>
        ) : (
          pendingTasks.map(task => (
            <div 
              key={task.id} 
              className="task-card"
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
            >
              <h4>{task.title}</h4>
              {task.dueDate && (
                <p className="task-due-date">
                  <i className="fas fa-calendar"></i> 
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
              {task.assignedTo && (
                <div className="task-assignee">
                  <i className="fas fa-user-circle"></i> 
                  {/* Replace with user's name or avatar later */}
                  {task.assignedTo}
                </div>
              )}
              <div className="status-badge pending">To Do</div>
            </div>
          ))
        )}
      </div>

      {/* In Progress Tasks Column */}
      <div 
        className="task-column in-progress-column"
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 'in-progress')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'in-progress')}
      >
        <h3>In Progress</h3>
        {inProgressTasks.length === 0 ? (
          <p className="no-tasks">No tasks in progress</p>
        ) : (
          inProgressTasks.map(task => (
            <div 
              key={task.id} 
              className="task-card"
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
            >
              <h4>{task.title}</h4>
              {task.dueDate && (
                <p className="task-due-date">
                  <i className="fas fa-calendar"></i> 
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
              {task.assignedTo && (
                <div className="task-assignee">
                  <i className="fas fa-user-circle"></i>
                  {task.assignedTo}
                </div>
              )}
              <div className="status-badge in-progress">In Progress</div>
            </div>
          ))
        )}
      </div>

      {/* Completed Tasks Column */}
      <div 
        className="task-column completed-column"
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 'completed')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'completed')}
      >
        <h3>Completed</h3>
        {completedTasks.length === 0 ? (
          <p className="no-tasks">No completed tasks</p>
        ) : (
          completedTasks.map(task => (
            <div 
              key={task.id} 
              className="task-card"
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
            >
              <h4>{task.title}</h4>
              {task.dueDate && (
                <p className="task-due-date">
                  <i className="fas fa-calendar"></i> 
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
              {task.assignedTo && (
                <div className="task-assignee">
                  <i className="fas fa-user-circle"></i>
                  {task.assignedTo}
                </div>
              )}
              <div className="status-badge completed">Completed</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard; 