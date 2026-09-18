import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/authStore';
import {
  useAdminPosts,
  useAdminUsers,
  useAdminUpdatePostStatus,
  useAdminDeletePost,
  useAdminUpdateUserRole,
} from '../hooks/useAdmin';
import { CategoryBadge, STATUS_OPTIONS } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo } from '../utils/timeAgo';
import './AdminPage.css';

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'users'
  const [postSearch, setPostSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Admin Data Hooks
  const {
    data: posts = [],
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useAdminPosts();

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useAdminUsers();

  const updateStatusMutation = useAdminUpdatePostStatus();
  const deletePostMutation = useAdminDeletePost();
  const updateRoleMutation = useAdminUpdateUserRole();

  // Filter posts (declared before any early returns to satisfy React Rules of Hooks)
  const filteredPosts = useMemo(() => {
    if (!postSearch.trim()) return posts;
    const query = postSearch.toLowerCase();
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(query) ||
        p.author?.name?.toLowerCase().includes(query) ||
        p.author?.username?.toLowerCase().includes(query)
    );
  }, [posts, postSearch]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const query = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  // Guard: Protect admin route
  if (!user || !isAdmin()) {
    return (
      <div className="admin-access-denied">
        <div className="admin-access-card">
          <h2>403 - Admin Access Required</h2>
          <p>You must be signed in with administrator privileges to view this page.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>
            Return to Public Portal
          </Link>
        </div>
      </div>
    );
  }

  // Handlers for Post Management
  const handleStatusChange = async (postId, newStatus) => {
    const formattedStatus = newStatus.replace('_', ' ');
    try {
      await updateStatusMutation.mutateAsync({ id: postId, status: newStatus });
      toast.success(`Status updated to ${formattedStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${postTitle}"?`)) {
      return;
    }
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  // Handlers for User Management
  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await updateRoleMutation.mutateAsync({ id: targetUserId, role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const currentUserId = user.id || user._id;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage feedback posts, roadmap statuses, and portal user roles.
          </p>
        </div>

        <div className="admin-badge-pill">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h7z"/>
          </svg>
          Admin Mode
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'posts'}
          className={`admin-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts Management
          <span className="tab-count-badge">{posts.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'users'}
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
          <span className="tab-count-badge">{users.length}</span>
        </button>
      </div>

      {/* Tab 1: Posts Management */}
      {activeTab === 'posts' && (
        <section className="admin-tab-content">
          <div className="admin-table-toolbar">
            <div className="search-input-wrap">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="search-icon">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Filter posts by title or author..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="admin-search-input"
              />
              {postSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setPostSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
            <span className="showing-count-text">
              Showing {filteredPosts.length} of {posts.length} posts
            </span>
          </div>

          <div className="admin-table-wrapper">
            {isPostsLoading ? (
              <div className="table-loading">Loading all posts...</div>
            ) : isPostsError ? (
              <div className="table-error">Failed to load posts.</div>
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                title="No posts found"
                description={postSearch ? "No posts match your search filter." : "There are currently no feature requests in the system."}
                actionLabel={postSearch ? "Clear Filter" : undefined}
                onAction={postSearch ? () => setPostSearch('') : undefined}
              />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th className="th-center">Votes</th>
                    <th className="th-center">Comments</th>
                    <th className="th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const authorName = post.author?.name || post.author?.username || 'Anonymous';
                    return (
                      <tr key={post._id}>
                        <td className="td-title">
                          <Link to={`/posts/${post._id}`} className="post-table-link">
                            {post.title}
                          </Link>
                          <span className="post-created-date">{timeAgo(post.createdAt)}</span>
                        </td>
                        <td>
                          <CategoryBadge category={post.category} />
                        </td>
                        <td>
                          <select
                            value={post.status}
                            onChange={(e) => handleStatusChange(post._id, e.target.value)}
                            disabled={updateStatusMutation.isPending}
                            className="admin-table-select"
                            aria-label={`Change status for ${post.title}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="td-author">
                          <span className="author-name-text">{authorName}</span>
                          <span className="author-email-text">{post.author?.email}</span>
                        </td>
                        <td className="td-center">
                          <span className="metric-pill metric-pill--votes">
                            ▲ {post.upvoteCount ?? 0}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className="metric-pill metric-pill--comments">
                            💬 {post.commentCount ?? 0}
                          </span>
                        </td>
                        <td className="td-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post._id, post.title)}
                            disabled={deletePostMutation.isPending}
                            className="btn-danger-outline btn-sm"
                            title="Hard delete post"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <section className="admin-tab-content">
          <div className="admin-table-toolbar">
            <div className="search-input-wrap">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="search-icon">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Filter users by name, username, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="admin-search-input"
              />
              {userSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setUserSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
            <span className="showing-count-text">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>

          <div className="admin-table-wrapper">
            {isUsersLoading ? (
              <div className="table-loading">Loading users...</div>
            ) : isUsersError ? (
              <div className="table-error">Failed to load users.</div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                title="No users found"
                description={userSearch ? "No users match your search filter." : "There are currently no registered users."}
                actionLabel={userSearch ? "Clear Filter" : undefined}
                onAction={userSearch ? () => setUserSearch('') : undefined}
              />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th className="th-right">Self Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((targetUser) => {
                    const targetId = targetUser._id || targetUser.id;
                    const isSelf = currentUserId === targetId;

                    return (
                      <tr key={targetId} className={isSelf ? 'row-highlight' : ''}>
                        <td className="td-user">
                          <div className="user-avatar-small">
                            {(targetUser.name || targetUser.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-table-name">
                              {targetUser.name || targetUser.username}
                              {isSelf && <span className="self-tag">(You)</span>}
                            </div>
                            <div className="user-table-username">@{targetUser.username || targetUser.name}</div>
                          </div>
                        </td>
                        <td className="td-email">{targetUser.email}</td>
                        <td>
                          <select
                            value={targetUser.role}
                            onChange={(e) => handleRoleChange(targetId, e.target.value)}
                            disabled={isSelf || updateRoleMutation.isPending}
                            className={`admin-table-select ${targetUser.role === 'admin' ? 'role-admin' : ''}`}
                            title={isSelf ? 'You cannot change your own role' : 'Change user role'}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          {targetUser.isVerified ? (
                            <span className="badge-verified">✓ Verified</span>
                          ) : (
                            <span className="badge-unverified">Pending</span>
                          )}
                        </td>
                        <td className="td-date">
                          {timeAgo(targetUser.createdAt)}
                        </td>
                        <td className="td-right">
                          {isSelf ? (
                            <span className="self-protected-label">Protected</span>
                          ) : (
                            <span className="active-user-label">Active</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
