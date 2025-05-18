const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/keys');

// Middleware to verify token and attach user to request
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user; // Add user from payload to request object
    next(); // Call next middleware
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 