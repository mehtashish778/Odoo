const express = require('express');
const cors = require('cors'); // Import CORS package
const app = express();
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001 to avoid potential conflict with React dev server

const authRoutes = require('./routes/auth'); // Import auth routes
const userRoutes = require('./routes/users'); // Import user routes
const projectRoutes = require('./routes/projects'); // Import project routes
const taskRoutes = require('./routes/tasks'); // Import task routes

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Use auth routes
app.use('/api/auth', authRoutes);
// Use user routes
app.use('/api/users', userRoutes);
// Use project routes
app.use('/api/projects', projectRoutes);
// Use task routes
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 