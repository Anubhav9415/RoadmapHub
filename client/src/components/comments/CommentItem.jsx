import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useUpdateComment, useDeleteComment, useAddComment } from '../../hooks/useComments';
import { timeAgo } from '../../utils/timeAgo';
import './CommentItem.css';

export default function CommentItem({ comment, postId, depth = 0 }) {
  const { user, isAdmin } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body || '');
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  const updateMutation = useUpdateComment(postId);
  const deleteMutation = useDeleteComment(postId);
  const addReplyMutation = useAddComment(postId);

  const authorId = comment.author?._id || comment.author?.id || comment.author;
  const currentUserId = user?._id || user?.id;
  const isAuthor = Boolean(currentUserId && authorId && currentUserId === authorId);
  const canModify = isAuthor || (isAdmin && isAdmin());

  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editBody.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: comment._id, body: editBody.trim() });
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteMutation.mutateAsync(comment._id);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    try {
      await addReplyMutation.mutateAsync({
        post: postId,
        body: replyBody.trim(),
        parentComment: comment._id,
      });
      setReplyBody('');
      setIsReplying(false);
      toast.success('Reply added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add reply');
    }
  };

  // If deleted and no replies, skip rendering or render nothing
  if (comment.isDeleted && !hasReplies) {
    return null;
  }

  const authorName = comment.author?.name || comment.author?.username || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div
      className={`comment-item ${depth > 0 ? 'comment-item--nested' : ''}`}
      style={{ '--comment-depth': depth }}
      id={`comment-${comment._id}`}
    >
      <div className="comment-card">
        <div className="comment-header">
          <div className="comment-author-info">
            <div className="comment-avatar" aria-hidden="true">
              {authorInitial}
            </div>
            <span className="comment-author-name">
              {comment.isDeleted ? '[deleted]' : authorName}
            </span>
            {comment.author?.role === 'admin' && !comment.isDeleted && (
              <span className="admin-badge">Admin</span>
            )}
            <span className="comment-date">
              {timeAgo(comment.createdAt)}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && !comment.isDeleted && (
              <span className="comment-edited">(edited)</span>
            )}
          </div>

          {!comment.isDeleted && canModify && !isEditing && (
            <div className="comment-actions-menu">
              {isAuthor && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setEditBody(comment.body);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                className="btn-link btn-link--danger"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="comment-body">
          {comment.isDeleted ? (
            <p className="comment-deleted-text">[This comment has been deleted]</p>
          ) : isEditing ? (
            <form onSubmit={handleUpdate} className="comment-edit-form">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="comment-textarea"
                rows={3}
                required
                autoFocus
              />
              <div className="comment-edit-actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comment.body}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!comment.isDeleted && user && !isEditing && (
          <div className="comment-footer">
            <button
              type="button"
              className="comment-reply-btn"
              onClick={() => setIsReplying(!isReplying)}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.596 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.74 8.74 0 0 0-1.921-.304 4.5 4.5 0 0 0-.77.027.5.5 0 0 0-.5.5v1.153a.144.144 0 0 1-.202.134L2.35 8.134a.144.144 0 0 1 0-.268l4.248-2.853z"/>
              </svg>
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          </div>
        )}

        {isReplying && (
          <form onSubmit={handleReply} className="comment-reply-form">
            <textarea
              placeholder={`Reply to ${authorName}...`}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="comment-textarea"
              rows={2}
              required
              autoFocus
            />
            <div className="comment-edit-actions">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary btn-sm"
                disabled={addReplyMutation.isPending}
              >
                {addReplyMutation.isPending ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </form>
        )}
      </div>

      {hasReplies && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
