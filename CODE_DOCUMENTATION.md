# SynergySphere - Code Documentation

This document provides a detailed overview of the SynergySphere codebase, explaining the structure, implementation details, and design decisions.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Authentication Flow](#authentication-flow)
5. [Data Models](#data-models)
6. [API Services](#api-services)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)

## Project Structure

The project follows a clear separation between frontend and backend:

```
SynergySphere/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   ├── layout/
│       │   ├── projects/
│       │   └── tasks/
│       ├── context/
│       ├── services/
│       ├── App.js
│       └── index.js
└── README.md
```

## Backend Implementation

### Server Configuration (server.js)

The main entry point for the backend is `server.js`, which:
- Sets up the Express server
- Configures middleware (CORS, JSON parsing)
- Mounts the API routes
- Starts the server on the configured port (5001)

### Authentication System

The authentication system is implemented using:
- JWT (JSON Web Tokens) for stateless authentication
- bcrypt for secure password hashing
- Custom middleware for protecting routes

Files:
- `routes/auth.js`: Contains signup, login, and user fetch endpoints
- `middleware/authMiddleware.js`: Middleware to verify JWT tokens
- `config/keys.js`: Contains the JWT secret

### Models

For the MVP, we use in-memory data structures:
- `models/User.js`: User data structure
- `models/Project.js`: Project data structure
- `models/Task.js`: Task data structure

### Routes

API routes are organized by resource:
- `routes/auth.js`: Authentication endpoints
- `routes/users.js`: User-related endpoints
- `routes/projects.js`: Project management endpoints
- `routes/tasks.js`: Task management endpoints

## Frontend Implementation

### Component Architecture

Components are organized by feature/domain:

#### Authentication Components
- `components/auth/Login.js`: User login form
- `components/auth/Signup.js`: User registration form

#### Layout Components
- `components/layout/Navbar.js`: Navigation bar with conditional rendering based on auth state

#### Project Components
- `components/projects/ProjectDashboard.js`: Displays all user projects
- `components/projects/CreateProject.js`: Form to create new projects
- `components/projects/ProjectDetail.js`: Detailed view of a specific project

#### Task Components
- `components/tasks/CreateTask.js`: Form to create new tasks
- `components/tasks/TaskDetail.js`: Detailed view of a specific task

### State Management

The application uses React Context API for state management:
- `context/AuthContext.js`: Manages authentication state, including:
  - User information
  - Authentication status
  - JWT token
  - Login/logout/signup functionality

### API Services

The `services/api.js` module provides a clean interface for making API requests:
- Abstracts the Axios implementation
- Handles authentication token inclusion
- Provides consistent error handling

## Authentication Flow

1. **Registration**:
   - User submits registration form
   - Frontend sends data to `POST /api/auth/signup`
   - Backend validates data, hashes password, creates user
   - Backend generates JWT and returns it with user data
   - Frontend stores JWT in localStorage via AuthContext

2. **Login**:
   - User submits login form
   - Frontend sends credentials to `POST /api/auth/login`
   - Backend validates credentials
   - Backend generates JWT and returns it with user data
   - Frontend stores JWT in localStorage via AuthContext

3. **Authenticated Requests**:
   - Frontend adds JWT from AuthContext to request headers
   - Backend middleware validates JWT
   - Request proceeds if token is valid

4. **Logout**:
   - JWT is removed from localStorage
   - AuthContext updates state to reflect logged out status

## Data Models

### User Model
```javascript
{
  id: Number,
  name: String,
  email: String,
  password: String (hashed)
}
```

### Project Model
```javascript
{
  id: Number,
  name: String,
  description: String,
  createdBy: Number (user ID),
  members: [Number] (user IDs),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  id: Number,
  title: String,
  description: String,
  projectId: Number,
  assignedTo: Number (user ID),
  status: String ('to-do', 'in-progress', 'done'),
  dueDate: Date,
  createdBy: Number (user ID),
  createdAt: Date,
  updatedAt: Date
}
```

## API Services

The frontend communicates with the backend through the API service layer in `services/api.js`, which provides methods for:

- `api.post(endpoint, data, token)`: For creating new resources
- `api.get(endpoint, token)`: For retrieving resources
- `api.put(endpoint, data, token)`: For updating resources
- `api.delete(endpoint, token)`: For deleting resources

Each method automatically:
1. Adds the correct content-type header
2. Adds the auth token when provided
3. Handles response parsing
4. Provides consistent error handling

## Component Architecture

The frontend follows a component-based architecture with:

### Container Components
- Manage data fetching and state
- Connect to context APIs
- Handle routing and navigation
- Examples: ProjectDashboard, TaskDetail

### Presentational Components
- Focus on UI rendering
- Receive data via props
- Emit events via callback props
- Examples: task cards, form inputs

### Routing

React Router is used for navigation:
- Public routes (login, signup)
- Protected routes (dashboard, project details)
- Automatic redirects when authentication state changes

## State Management

State management is primarily handled via:

1. **React Context**:
   - AuthContext for user authentication state
   - Potential for ProjectContext, TaskContext in future iterations

2. **Component State**:
   - Local state for forms and UI components
   - useState for simple state
   - useReducer for more complex state logic

## Future Technical Considerations

1. **Database Integration**:
   - Replace in-memory stores with a proper database
   - Implement data validation and sanitization

2. **Enhanced Security**:
   - Token refresh mechanism
   - Rate limiting
   - Input validation

3. **Performance Optimization**:
   - Data caching
   - Pagination for large data sets
   - Code splitting for the frontend

4. **Offline Support**:
   - Implement service workers
   - Add offline data synchronization

5. **Testing**:
   - Unit tests for API endpoints
   - Component tests for React components
   - End-to-end tests for critical user flows 