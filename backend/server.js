const express = require('express');
const app = express();
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001 to avoid potential conflict with React dev server

const authRoutes = require('./routes/auth'); // Import auth routes
const userRoutes = require('./routes/users'); // Import user routes

app.use(express.json()); // Middleware to parse JSON bodies

// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Use auth routes
app.use('/api/auth', authRoutes);
// Use user routes
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 