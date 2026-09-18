import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useComments, useAddComment } from '../../hooks/useComments';
import CommentItem from './CommentItem';
import EmptyState from '../ui/EmptyState';
import toast from 'react-hot-toast';
import './CommentThread.css';

/**
 * Builds a nested tree from a flat list of comments (supporting both flat and pre-nested APIs).
 */
function buildCommentTree(comments) {
  if (!Array.isArray(comments)) return [];

  const commentMap = {};
  const roots = [];

  comments.forEach((c) => {
    commentMap[c._id] = { ...c, replies: c.replies ? [...c.replies] : [] };
  });

  comments.forEach((c) => {
    const parentId = c.parentComment?._id || c.parentComment || c.parentId;
    if (parentId && commentMap[parentId]) {
      const exists = commentMap[parentId].replies.some((r) => r._id === c._id);
      if (!exists) {
        commentMap[parentId].replies.push(commentMap[c._id]);
      }
    } else if (!parentId) {
      roots.push(commentMap[c._id]);
    }
  });

  return roots.length > 0 ? roots : comments;
}

export default function CommentThread({ postId }) {
  const { user } = useAuthStore();
  const { data: comments = [], isLoading, isError } = useComments(postId);
  const addCommentMutation = useAddComment(postId);

  const [body, setBody] = useState('');

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const totalCount = comments.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        post: postId,
        body: body.trim(),
      });
      setBody('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    }
  };

  return (
    <section className="comment-thread" aria-labelledby="comments-heading">
      <div className="comment-thread-header">
        <h2 id="comments-heading" className="comment-thread-title">
          Activity & Comments
          <span className="comment-count-pill">{totalCount}</span>
        </h2>
      </div>

      {/* New Comment Box */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-form-inner">
            <div className="comment-form-avatar" aria-hidden="true">
              {(user.name || user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="comment-form-input-wrapper">
              <textarea
                id="new-comment-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Leave a thoughtful comment... (Markdown supported)"
                className="comment-textarea"
                rows={3}
                required
              />
              <div className="comment-form-footer">
                <span className="markdown-hint">Supports markdown formatting</span>
                <button
                  type="submit"
                  id="submit-comment-btn"
                  className="btn-primary"
                  disabled={addCommentMutation.isPending || !body.trim()}
                >
                  {addCommentMutation.isPending ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>
            <Link to="/login" className="login-link">Log in</Link> or <Link to="/signup" className="login-link">Sign up</Link> to join the conversation.
          </p>
        </div>
      )}

      {/* Comment List */}
      <div className="comment-list">
        {isLoading ? (
          <div className="comment-loading">
            <div className="skeleton-line" style={{ width: '60%', height: '18px', marginBottom: '8px' }} />
            <div className="skeleton-line" style={{ width: '90%', height: '14px', marginBottom: '6px' }} />
            <div className="skeleton-line" style={{ width: '40%', height: '14px' }} />
          </div>
        ) : isError ? (
          <div className="comment-error">Failed to load comments.</div>
        ) : commentTree.length === 0 ? (
          <EmptyState
            title="No comments yet"
            description="Be the first to join the discussion and share your feedback on this request."
          />
        ) : (
          commentTree.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              depth={0}
            />
          ))
        )}
      </div>
    </section>
  );
}
