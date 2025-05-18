const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const projects = require('../models/Project');
const users = require('../models/User');

// @route   GET api/projects
// @desc    Get all projects for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filter projects where the user is either the creator or a member
    const userProjects = projects.filter(
      project => 
        project.createdBy === req.user.id || 
        project.members.includes(req.user.id)
    );
    
    res.json(userProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/projects/:id
// @desc    Get a project by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to view this project
    if (project.createdBy !== req.user.id && !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, members = [] } = req.body;
  
  try {
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    
    // Convert member emails to IDs if provided
    let memberIds = [];
    if (members && members.length > 0) {
      // This is a simplistic approach for the MVP
      memberIds = members.map(member => {
        if (typeof member === 'number') return member; // Already an ID
        
        // Try to find user by email
        const user = users.find(u => u.email === member);
        return user ? user.id : null;
      }).filter(id => id !== null); // Remove any nulls
    }
    
    // Always include the creator as a member
    if (!memberIds.includes(req.user.id)) {
      memberIds.push(req.user.id);
    }
    
    const newProject = {
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
      name,
      description: description || '',
      createdBy: req.user.id,
      members: memberIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    projects.push(newProject);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, description, members } = req.body;
  const projectId = parseInt(req.params.id);
  
  try {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the creator of the project
    if (projects[projectIndex].createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Create updated project object
    const updatedProject = {
      ...projects[projectIndex],
      name: name || projects[projectIndex].name,
      description: description !== undefined ? description : projects[projectIndex].description,
      updatedAt: new Date()
    };
    
    // Update members if provided
    if (members) {
      // Similar logic as in POST, convert emails to IDs
      let memberIds = members.map(member => {
        if (typeof member === 'number') return member;
        
        const user = users.find(u => u.email === member);
        return user ? user.id : null;
      }).filter(id => id !== null);
      
      // Always include the creator
      if (!memberIds.includes(req.user.id)) {
        memberIds.push(req.user.id);
      }
      
      updatedProject.members = memberIds;
    }
    
    projects[projectIndex] = updatedProject;
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  const projectId = parseInt(req.params.id);
  
  try {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the creator of the project
    if (projects[projectIndex].createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    // Remove the project
    projects.splice(projectIndex, 1);
    
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 