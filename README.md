# SynergySphere - Advanced Team Collaboration Platform

SynergySphere is a collaborative task management and team communication platform designed to streamline project workflows, enhance team coordination, and boost productivity.

## MVP Features (Round 1)

- **User Authentication**
  - Secure signup and login functionality
  - JWT token-based authorization

- **Project Management**
  - Create and manage multiple projects
  - View projects in an intuitive dashboard
  - Detailed project views with task tracking

- **Team Collaboration**
  - Add team members to projects via email
  - Manage project membership

- **Task Management**
  - Create tasks with titles, descriptions, and due dates
  - Assign tasks to team members
  - Track task status (To-Do, In Progress, Done)
  - Task detail view and editing capabilities

## Application Structure

### Backend

The backend is built with Node.js and Express, using an in-memory data store (for the MVP):

- **Server**: Express server with API endpoints
- **Authentication**: JWT-based with bcrypt for password hashing
- **Models**: Project, User, and Task data structures
- **Routes**: API endpoints for projects, tasks, users, and authentication

### Frontend

The frontend is built with React:

- **Components**: Modular React components for UI elements
- **Context**: React Context API for state management (AuthContext)
- **Routing**: React Router for navigation
- **API Service**: Axios for backend communication

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm (v6+ recommended)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd SynergySphere
   ```

2. Install dependencies for backend
   ```
   cd backend
   npm install
   ```

3. Install dependencies for frontend
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server
   ```
   cd backend
   npm start
   ```
   The server will run on http://localhost:5001

2. Start the frontend development server
   ```
   cd frontend
   npm start
   ```
   The application will be available at http://localhost:3000

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup`: Register a new user
  - Request: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ "token": "string", "user": { "id": "number", "name": "string", "email": "string" } }`

- `POST /api/auth/login`: Login with credentials
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "token": "string", "user": { "id": "number", "name": "string", "email": "string" } }`

- `GET /api/auth/user`: Get current user (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `{ "id": "number", "name": "string", "email": "string" }`

### Project Endpoints

- `GET /api/projects`: Get all projects for the user (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `[{ "id": "number", "name": "string", "description": "string", ... }]`

- `GET /api/projects/:id`: Get a specific project (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `{ "id": "number", "name": "string", "description": "string", ... }`

- `POST /api/projects`: Create a new project (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Request: `{ "name": "string", "description": "string", "members": ["string"] }`
  - Response: `{ "id": "number", "name": "string", "description": "string", ... }`

- `PUT /api/projects/:id`: Update a project (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Request: `{ "name": "string", "description": "string", "members": ["string"] }`
  - Response: `{ "id": "number", "name": "string", "description": "string", ... }`

- `DELETE /api/projects/:id`: Delete a project (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `{ "message": "Project removed" }`

### Task Endpoints

- `GET /api/tasks/project/:projectId`: Get all tasks for a project (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `[{ "id": "number", "title": "string", "description": "string", ... }]`

- `GET /api/tasks/:id`: Get a specific task (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `{ "id": "number", "title": "string", "description": "string", ... }`

- `POST /api/tasks`: Create a new task (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Request: `{ "title": "string", "description": "string", "projectId": "number", "assignedTo": "number", "dueDate": "date", "status": "string" }`
  - Response: `{ "id": "number", "title": "string", "description": "string", ... }`

- `PUT /api/tasks/:id`: Update a task (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Request: `{ "title": "string", "description": "string", "assignedTo": "number", "dueDate": "date", "status": "string" }`
  - Response: `{ "id": "number", "title": "string", "description": "string", ... }`

- `DELETE /api/tasks/:id`: Delete a task (protected)
  - Headers: `{ "x-auth-token": "string" }`
  - Response: `{ "message": "Task removed" }`

## Future Enhancements (Beyond MVP)

- Threaded discussions within projects
- Task progress visualization (Kanban board)
- Notifications system
- Enhanced mobile responsiveness
- File attachments for tasks
- Integration with external tools
- Advanced reporting features

## Contributing

Please read the CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.