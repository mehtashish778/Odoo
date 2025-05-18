const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/keys');
const projectRoutes = require('../../routes/projects');
const projects = require('../../models/Project');
const users = require('../../models/User');

// Mock middleware
jest.mock('../../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 1 }; // Set default user ID to 1
    next();
  };
});

// Mock express app
const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

describe('Project Routes', () => {
  // Clear projects and users arrays before each test
  beforeEach(() => {
    while (projects.length) {
      projects.pop();
    }
    
    while (users.length) {
      users.pop();
    }
    
    // Add test user
    users.push({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects for the logged-in user', async () => {
      // Add some projects
      projects.push({
        id: 1,
        name: 'Project 1',
        description: 'Description 1',
        createdBy: 1, // User 1
        members: [1],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      projects.push({
        id: 2,
        name: 'Project 2',
        description: 'Description 2',
        createdBy: 2, // Another user
        members: [2, 3],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      projects.push({
        id: 3,
        name: 'Project 3',
        description: 'Description 3',
        createdBy: 3, // Another user
        members: [1, 3], // User 1 is a member
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Only projects where user 1 is creator or member
      expect(response.body[0].id).toBe(1);
      expect(response.body[1].id).toBe(3);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a specific project by ID', async () => {
      // Add a project
      const project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        createdBy: 1,
        members: [1],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      projects.push(project);

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', project.id);
      expect(response.body).toHaveProperty('name', project.name);
      expect(response.body).toHaveProperty('description', project.description);
    });

    it('should return 404 if project not found', async () => {
      const response = await request(app)
        .get('/api/projects/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 403 if user has no access to the project', async () => {
      // Add a project where user is not a member or creator
      const project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        createdBy: 2,
        members: [2, 3],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      projects.push(project);

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'New Description',
        members: ['member@example.com']
      };
      
      // Add member user
      users.push({
        id: 2,
        name: 'Member User',
        email: 'member@example.com',
        password: 'hashedpassword'
      });

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', projectData.name);
      expect(response.body).toHaveProperty('description', projectData.description);
      expect(response.body).toHaveProperty('members');
      expect(response.body.members).toContain(1); // Creator is always a member
      expect(response.body.members).toContain(2); // Added member
      expect(response.body).toHaveProperty('createdBy', 1);
      
      // Verify project was added to projects array
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe(projectData.name);
    });

    it('should return 400 if name is missing', async () => {
      const projectData = {
        description: 'New Description',
        members: []
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(projects.length).toBe(0);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      // Add a project
      const project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        createdBy: 1,
        members: [1],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      projects.push(project);
      
      const updateData = {
        name: 'Updated Project',
        description: 'Updated Description',
        members: ['member@example.com']
      };
      
      // Add member user
      users.push({
        id: 2,
        name: 'Member User',
        email: 'member@example.com',
        password: 'hashedpassword'
      });

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', project.id);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('description', updateData.description);
      expect(response.body).toHaveProperty('members');
      expect(response.body.members).toContain(1); // Creator is still a member
      expect(response.body.members).toContain(2); // Added member
      
      // Verify project was updated in projects array
      expect(projects[0].name).toBe(updateData.name);
    });

    it('should return 404 if project not found', async () => {
      const updateData = {
        name: 'Updated Project',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put('/api/projects/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 403 if user is not the creator', async () => {
      // Add a project where user is not the creator
      const project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        createdBy: 2, // Another user
        members: [1, 2], // User 1 is a member but not creator
        createdAt: new Date(),
        updatedAt: new Date()
      };
      projects.push(project);
      
      const updateData = {
        name: 'Updated Project',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      
      // Verify project was not updated
      expect(projects[0].name).toBe(project.name);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete an existing project', async () => {
      // Add a project
      const project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        createdBy: 1,
        members: [1],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      projects.push(project);

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      
      // Verify project was removed from projects array
      expect(projects.length).toBe(0);
    });

    it('should return 404 if project not found', async () => {
      const response = await request(app)
        .delete('/api/projects/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 403 if user is not the creator', async () => {
      // Add a project where user is not the creator
      const project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        createdBy: 2, // Another user
        members: [1, 2], // User 1 is a member but not creator
        createdAt: new Date(),
        updatedAt: new Date()
      };
      projects.push(project);

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      
      // Verify project was not removed
      expect(projects.length).toBe(1);
    });
  });
}); 