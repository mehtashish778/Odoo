const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const comments = require('../models/Comment');
const projects = require('../models/Project');

// @route   GET api/comments/project/:projectId
// @desc    Get all comments for a project
// @access  Private
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Verify the project exists
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Verify user has access to the project
    if (project.createdBy !== req.user.id && !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    // Get comments for this project
    const projectComments = comments
      .filter(comment => comment.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    res.json(projectComments);
  } catch (error) {
    console.error('Get project comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/comments
// @desc    Add a comment to a project
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { content, projectId } = req.body;
  
  try {
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const projectIdNum = parseInt(projectId);
    
    // Verify the project exists
    const project = projects.find(p => p.id === projectIdNum);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Verify user has access to the project
    if (project.createdBy !== req.user.id && !project.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to comment on this project' });
    }
    
    const newComment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      content,
      projectId: projectIdNum,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    comments.push(newComment);
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const commentId = parseInt(req.params.id);
  
  try {
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author of the comment
    if (comments[commentIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Update the comment
    comments[commentIndex] = {
      ...comments[commentIndex],
      content,
      updatedAt: new Date()
    };
    
    res.json(comments[commentIndex]);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  const commentId = parseInt(req.params.id);
  
  try {
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author of the comment
    if (comments[commentIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Remove the comment
    comments.splice(commentIndex, 1);
    
    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 