import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const ProjectComments = ({ projectId }) => {
  const { token, user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await api.get(`/api/comments/project/${projectId}`, token);
        setComments(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again.');
        setLoading(false);
      }
    };

    fetchComments();
  }, [projectId, token]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return; // Don't submit empty comments
    }
    
    try {
      const data = await api.post('/api/comments', { 
        content: newComment,
        projectId
      }, token);
      
      setComments([...comments, data]);
      setNewComment(''); // Clear the input field
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}`, token);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  // Format date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="project-comments">
      <h3>Discussion</h3>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="comment-form">
        <form onSubmit={handleSubmitComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment to the discussion..."
            rows="3"
          ></textarea>
          <button type="submit" className="btn-primary">Post Comment</button>
        </form>
      </div>
      
      {comments.length === 0 ? (
        <p className="no-comments">No comments yet. Be the first to start the discussion!</p>
      ) : (
        <div className="comment-list">
          {comments.map(comment => (
            <div className="comment-card" key={comment.id}>
              <div className="comment-header">
                <span className="comment-author">User #{comment.userId}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="comment-content">{comment.content}</div>
              {user && user.id === comment.userId && (
                <div className="comment-actions">
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectComments; 