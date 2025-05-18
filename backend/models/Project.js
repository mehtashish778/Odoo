// For MVP, we'll use an in-memory array to store projects.
// Later, this will be replaced with a database model.
const projects = [];

// Sample project structure:
// {
//   id: 1,
//   name: 'Project Name',
//   description: 'Project Description',
//   createdBy: 1, // userId
//   members: [1, 2], // array of userIds
//   createdAt: Date,
//   updatedAt: Date
// }

module.exports = projects; 