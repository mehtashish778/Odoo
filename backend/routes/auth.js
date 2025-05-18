const express = require('express');
const router = express.Router();
const users = require('../models/User'); // Our in-memory user store
const bcrypt = require('bcryptjs'); // Import bcryptjs
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const { jwtSecret } = require('../config/keys'); // Import JWT secret
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// @route   POST api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation (more comprehensive validation needed later)
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user already exists (in our in-memory array)
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, // More robust ID
      email,
      password: hashedPassword // Store hashed password
    };

    users.push(newUser);
    console.log('Users array after signup:', users.map(u => ({id: u.id, email: u.email}))); // Don't log passwords

    // Generate JWT
    const payload = { user: { id: newUser.id } }; // Add user id to payload
    jwt.sign(
      payload, 
      jwtSecret, 
      { expiresIn: 3600 }, // Token expires in 1 hour (3600 seconds)
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: newUser.id, email: newUser.email } 
        });
      }
    );

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user in our in-memory array
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' }); // User not found
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' }); // Password doesn't match
    }

    // User matched, Generate JWT
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload, 
      jwtSecret, 
      { expiresIn: 3600 }, 
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, email: user.email }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/user
// @desc    Get user data (protected route)
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    // For in-memory store, find user by ID. In a DB, you'd query by ID.
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      // This case should ideally not happen if token is valid and user exists
      return res.status(404).json({ message: 'User not found' });
    }
    // Return user info (excluding password)
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 