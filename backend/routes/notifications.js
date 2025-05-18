const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const notifications = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filter notifications for this user
    const userNotifications = notifications
      .filter(notification => notification.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
    
    res.json(userNotifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/notifications
// @desc    Create a new notification (internal use only)
// @access  Private - Only for internal server use, not exposed as an API endpoint
const createNotification = (userId, message, type, relatedId = null) => {
  const newNotification = {
    id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
    userId,
    message,
    type, // e.g., 'task-assigned', 'task-due-soon', 'comment-added'
    relatedId, // ID of the related entity (task, project, etc.)
    read: false,
    createdAt: new Date()
  };
  
  notifications.push(newNotification);
  return newNotification;
};

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', authMiddleware, async (req, res) => {
  const notificationId = parseInt(req.params.id);
  
  try {
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to this user
    if (notifications[notificationIndex].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }
    
    // Mark as read
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      read: true
    };
    
    res.json(notifications[notificationIndex]);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    // Find all notifications for this user
    notifications.forEach((notification, index) => {
      if (notification.userId === req.user.id) {
        notifications[index] = {
          ...notification,
          read: true
        };
      }
    });
    
    // Get updated notifications for this user
    const userNotifications = notifications
      .filter(notification => notification.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userNotifications);
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router and createNotification function
module.exports = {
  router,
  createNotification
}; 