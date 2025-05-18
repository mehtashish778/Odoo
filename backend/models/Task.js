// For MVP, we'll use an in-memory array to store tasks.
// Later, this will be replaced with a database model.
const tasks = [];

// Sample task structure:
// {
//   id: 1,
//   title: 'Task Title',
//   description: 'Task Description',
//   projectId: 1, // reference to the project
//   assigneeId: 1, // userId of assignee
//   dueDate: Date,
//   status: 'pending', // or 'in-progress', 'completed', etc.
//   createdBy: 1, // userId
//   createdAt: Date,
//   updatedAt: Date
// }

module.exports = tasks; 