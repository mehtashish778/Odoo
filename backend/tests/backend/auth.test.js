const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authRoutes = require('../../routes/auth');
const users = require('../../models/User');
const { jwtSecret } = require('../../config/keys');

// Mock the express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  // Clear users array before each test
  beforeEach(() => {
    while (users.length) {
      users.pop();
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify token
      const decoded = jwt.verify(response.body.token, jwtSecret);
      expect(decoded).toHaveProperty('user');
      expect(decoded.user).toHaveProperty('id', response.body.user.id);
      
      // Verify user was added to users array
      expect(users.length).toBe(1);
      expect(users[0].email).toBe(userData.email);
    });

    it('should return 400 if email is missing', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(users.length).toBe(0);
    });
    
    it('should return 400 if password is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(users.length).toBe(0);
    });
    
    it('should return 400 if user already exists', async () => {
      // Add a user first
      const existingUser = {
        id: 1,
        name: 'Existing User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      };
      users.push(existingUser);
      
      const userData = {
        name: 'Test User',
        email: 'test@example.com', // Same email
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(users.length).toBe(1); // No new user added
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Add a user first
      const hashedPassword = await bcrypt.hash('password123', 10);
      const existingUser = {
        id: 1,
        name: 'Existing User',
        email: 'test@example.com',
        password: hashedPassword
      };
      users.push(existingUser);
      
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', existingUser.id);
      expect(response.body.user).toHaveProperty('email', existingUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify token
      const decoded = jwt.verify(response.body.token, jwtSecret);
      expect(decoded).toHaveProperty('user');
      expect(decoded.user).toHaveProperty('id', existingUser.id);
    });
    
    it('should return 400 if email is missing', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 if password is missing', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 if user does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 if password is incorrect', async () => {
      // Add a user first
      const hashedPassword = await bcrypt.hash('password123', 10);
      const existingUser = {
        id: 1,
        name: 'Existing User',
        email: 'test@example.com',
        password: hashedPassword
      };
      users.push(existingUser);
      
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
}); 