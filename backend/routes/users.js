const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const users = require('../models/User'); // Our in-memory user store

// @route   PUT api/users/me
// @desc    Update current user's profile (e.g., name)
// @access  Private
router.put('/me', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // Get user ID from token (set by authMiddleware)

  try {
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's name
    if (name !== undefined) { // Check if name is provided in the request
      users[userIndex].name = name;
    }
    // Add other updatable fields here later (e.g., bio)

    console.log('Updated user profile:', { id: users[userIndex].id, name: users[userIndex].name, email: users[userIndex].email });

    // Return the updated user (excluding password)
    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 