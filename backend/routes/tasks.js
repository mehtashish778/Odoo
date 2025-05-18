const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const tasks = require('../models/Task');
const projects = require('../models/Project');
const users = require('../models/User');
const { createNotification } = require('./notifications');

// Helper function to check if user has access to a project
const hasProjectAccess = (projectId, userId) => {
  const project = projects.find(p => p.id === projectId);
  return project && (project.createdBy === userId || project.members.includes(userId));
};

// @route   GET api/tasks/project/:projectId
// @desc    Get all tasks for a specific project
// @access  Private
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  
  try {
    // Check if user has access to the project
    if (!hasProjectAccess(projectId, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access tasks for this project' });
    }
    
    // Get tasks for this project
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    res.json(projectTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/tasks/:id
// @desc    Get a task by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  const taskId = parseInt(req.params.id);
  
  try {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the associated project
    if (!hasProjectAccess(task.projectId, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, projectId, assigneeId, dueDate, status = 'pending' } = req.body;
  
  try {
    // Validate required fields
    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project ID are required' });
    }
    
    // Check if project exists and user has access
    const project = projects.find(p => p.id === projectId);
    if (!project || !hasProjectAccess(projectId, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to create tasks for this project' });
    }
    
    // Validate assignee has access to the project if provided
    if (assigneeId) {
      if (!project.members.includes(assigneeId)) {
        return res.status(400).json({ message: 'Assignee must be a member of the project' });
      }
    }
    
    // Create new task
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title,
      description: description || '',
      projectId,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tasks.push(newTask);
    
    // Create notification for the assignee if one is assigned
    if (assigneeId && assigneeId !== req.user.id) {
      createNotification(
        assigneeId,
        `You were assigned a new task: ${title}`,
        'task-assigned',
        newTask.id
      );
    }
    
    // Create notifications for all project members except the creator
    project.members.forEach(memberId => {
      if (memberId !== req.user.id) {
        createNotification(
          memberId,
          `A new task was created in ${project.name}: ${title}`,
          'task-created',
          newTask.id
        );
      }
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, assigneeId, dueDate, status } = req.body;
  const taskId = parseInt(req.params.id);
  
  try {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const task = tasks[taskIndex];
    
    // Check if user has access to the associated project
    if (!hasProjectAccess(task.projectId, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Get project for notifications
    const project = projects.find(p => p.id === task.projectId);
    
    // Remember old values for change detection
    const oldAssigneeId = task.assigneeId;
    const oldStatus = task.status;
    
    // Validate assignee if changing
    if (assigneeId !== undefined) {
      if (assigneeId && !project.members.includes(assigneeId)) {
        return res.status(400).json({ message: 'Assignee must be a member of the project' });
      }
    }
    
    // Create updated task
    const updatedTask = {
      ...task,
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      assigneeId: assigneeId !== undefined ? assigneeId : task.assigneeId,
      dueDate: dueDate ? new Date(dueDate) : task.dueDate,
      status: status || task.status,
      updatedAt: new Date()
    };
    
    tasks[taskIndex] = updatedTask;
    
    // Create notification for the assignee if it changed and is not the current user
    if (assigneeId && assigneeId !== oldAssigneeId && assigneeId !== req.user.id) {
      createNotification(
        assigneeId,
        `You were assigned to task: ${updatedTask.title}`,
        'task-assigned',
        updatedTask.id
      );
    }
    
    // Create notification if status changed
    if (status && status !== oldStatus) {
      // Notify creator if they're not the one updating
      if (task.createdBy !== req.user.id) {
        createNotification(
          task.createdBy,
          `Task status changed to ${status}: ${updatedTask.title}`,
          'task-status-changed',
          updatedTask.id
        );
      }
      
      // Notify assignee if they're not the one updating
      if (updatedTask.assigneeId && updatedTask.assigneeId !== req.user.id) {
        createNotification(
          updatedTask.assigneeId,
          `Task status changed to ${status}: ${updatedTask.title}`,
          'task-status-changed',
          updatedTask.id
        );
      }
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  const taskId = parseInt(req.params.id);
  
  try {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const task = tasks[taskIndex];
    
    // Check if user has access to the project and is either the task creator or project creator
    const project = projects.find(p => p.id === task.projectId);
    if (
      !project || 
      !(project.createdBy === req.user.id || task.createdBy === req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    // Create notification for the assignee if they are not the one deleting
    if (task.assigneeId && task.assigneeId !== req.user.id) {
      createNotification(
        task.assigneeId,
        `A task assigned to you was deleted: ${task.title}`,
        'task-deleted',
        null
      );
    }
    
    // Remove the task
    tasks.splice(taskIndex, 1);
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 