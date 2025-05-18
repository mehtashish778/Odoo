import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications on component mount and when token changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
      try {
        const data = await api.get('/api/notifications', token);
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Optionally set up a polling interval to fetch notifications periodically
    const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
    
    return () => clearInterval(interval); // Clean up on unmount
  }, [token]);
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, {}, token);
      
      // Update local state to mark notification as read
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const updatedNotifications = await api.put('/api/notifications/read-all', {}, token);
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read first
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'task-assigned' || notification.type === 'task-status-changed' || notification.type === 'task-created') {
      // Navigate to the task detail page
      if (notification.relatedId) {
        // We need project ID for the navigation, which we don't have
        // In a real app, we'd include the projectId in the notification data
        // For now, just close the notifications panel
        setIsOpen(false);
      }
    } else if (notification.type === 'project-added') {
      // Navigate to the project
      if (notification.relatedId) {
        navigate(`/projects/${notification.relatedId}`);
        setIsOpen(false);
      }
    } else {
      // For other notification types or if no related ID, just close the panel
      setIsOpen(false);
    }
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Format timestamp relative to now
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="notifications-container">
      <button 
        className="notifications-bell" 
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notifications-content">
            {loading ? (
              <p className="loading-text">Loading notifications...</p>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : notifications.length === 0 ? (
              <p className="no-notifications">No notifications yet</p>
            ) : (
              <ul className="notifications-list">
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">{notification.message}</div>
                    <div className="notification-time">{formatTimestamp(notification.createdAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 