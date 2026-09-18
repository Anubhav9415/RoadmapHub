import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

import { usePost, useDeletePost, useUpdatePost, useUpdatePostStatus } from '../hooks/usePost';
import { useAuthStore } from '../store/authStore';
import SkeletonCard from '../components/ui/SkeletonCard';
import { StatusBadge, CategoryBadge, STATUS_OPTIONS } from '../components/ui/Badge';
import UpvoteButton from '../components/ui/UpvoteButton';
import CommentThread from '../components/comments/CommentThread';
import { timeAgo } from '../utils/timeAgo';
import './PostDetailPage.css';

const CATEGORY_OPTIONS = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'other', label: 'Other' },
];

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();

  const { data: post, isLoading, isError, error } = usePost(id);
  const deleteMutation = useDeletePost();
  const updateMutation = useUpdatePost(id);
  const statusMutation = useUpdatePostStatus(id);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Start editing handler
  const handleStartEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditCategory(post.category);
    setEditDescription(post.description);
    setIsEditing(true);
  };

  // Submit edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        title: editTitle.trim(),
        category: editCategory,
        description: editDescription.trim(),
      });
      setIsEditing(false);
      toast.success('Post updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post');
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feature request? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  // Admin status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await statusMutation.mutateAsync({ status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status');
    }
  };

  if (isLoading) {
    return (
      <div className="post-detail-container">
        <SkeletonCard />
      </div>
    );
  }

  if (isError || !post) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="post-detail-container">
        <div className="post-not-found-card">
          <h2>{is404 ? '404 - Post Not Found' : 'Error Loading Post'}</h2>
          <p>
            {is404
              ? 'The feature request you are looking for does not exist or has been removed.'
              : error?.message || 'Something went wrong while loading this post.'}
          </p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>
            Back to Feature Requests
          </Link>
        </div>
      </div>
    );
  }

  const authorId = post.author?._id || post.author?.id || post.author;
  const currentUserId = user?._id || user?.id;
  const isAuthor = Boolean(currentUserId && authorId && currentUserId === authorId);
  const userIsAdmin = Boolean(isAdmin && isAdmin());
  const canDelete = isAuthor || userIsAdmin;

  const authorName = post.author?.name || post.author?.username || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="post-detail-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/" className="breadcrumb-link">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L8.707 1.5z"/>
          </svg>
          Requests
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current" title={post.title}>
          {post.title}
        </span>
      </nav>

      <div className="post-detail-layout">
        {/* Main Column */}
        <main className="post-main-column">
          <div className="post-card">
            {isEditing ? (
              /* Inline Edit Form */
              <form onSubmit={handleSaveEdit} className="post-edit-form">
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>
                  <select
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="select-field"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description (Markdown supported)</label>
                  <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={8}
                    className="input-field textarea-field"
                    required
                  />
                </div>

                <div className="edit-form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* Normal Post View */
              <>
                <header className="post-header">
                  <div className="post-header-top">
                    <div className="post-badges">
                      <StatusBadge status={post.status} />
                      <CategoryBadge category={post.category} />
                    </div>

                    <div className="post-actions">
                      {isAuthor && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={handleStartEdit}
                          aria-label="Edit post"
                          title="Edit post"
                        >
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086zM9.75 4.81l-6.97 6.97a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.97-6.97-1.439-1.44z"/>
                          </svg>
                          <span>Edit</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          className="action-btn action-btn--danger"
                          onClick={handleDelete}
                          aria-label="Delete post"
                          title="Delete post"
                          disabled={deleteMutation.isPending}
                        >
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a2.25 2.25 0 0 0 2.24 2.025h1.208a2.25 2.25 0 0 0 2.24-2.025l.66-6.6a.75.75 0 0 0-1.492-.15l-.66 6.6a.75.75 0 0 1-.748.675H8.604a.75.75 0 0 1-.748-.675l-.66-6.6a.75.75 0 0 0-1.492.15z"/>
                          </svg>
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <h1 className="post-title">{post.title}</h1>

                  <div className="post-meta">
                    <div className="author-info">
                      <div className="author-avatar" aria-hidden="true">
                        {authorInitial}
                      </div>
                      <span className="author-name">{authorName}</span>
                    </div>
                    <span className="meta-dot">•</span>
                    <time dateTime={post.createdAt} className="post-date">
                      {timeAgo(post.createdAt)}
                    </time>
                  </div>
                </header>

                <div className="post-upvote-banner">
                  <UpvoteButton post={post} layout="horizontal" />
                  <span className="upvote-hint">Upvote this request to help prioritize it</span>
                </div>

                <div className="post-description markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.description}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>

          {/* Comment Thread Component */}
          <CommentThread postId={post._id} />
        </main>

        {/* Sidebar Column (Desktop) */}
        <aside className="post-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-section">
              <span className="sidebar-label">Votes</span>
              <div className="sidebar-vote-display">
                <span className="sidebar-vote-number">{post.upvoteCount ?? 0}</span>
                <span className="sidebar-vote-text">community votes</span>
              </div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <span className="sidebar-label">Status</span>
              <div className="sidebar-status-container">
                <StatusBadge status={post.status} />

                {userIsAdmin && (
                  <div className="admin-status-select-wrap">
                    <label htmlFor="admin-status-select" className="admin-select-label">
                      Admin: Change Status
                    </label>
                    <select
                      id="admin-status-select"
                      value={post.status}
                      onChange={handleStatusChange}
                      disabled={statusMutation.isPending}
                      className="select-field admin-select"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <span className="sidebar-label">Category</span>
              <div>
                <CategoryBadge category={post.category} />
              </div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <Link to="/" className="back-link">
                ← Back to all requests
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
