import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryBadge } from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import './Kanban.css';

/**
 * KanbanColumn Component
 * @param {string} title - Column title (e.g. "Planned", "In Progress", "Completed")
 * @param {string} status - Post status key
 * @param {Array} posts - Array of post objects
 * @param {string} color - Accent color for top bar
 */
export default function KanbanColumn({ title, status, posts = [], color = '#0969da' }) {
  return (
    <div className="kanban-column" id={`kanban-col-${status}`}>
      {/* Accent color bar */}
      <div className="kanban-column-accent" style={{ backgroundColor: color }} />

      {/* Column Header */}
      <div className="kanban-column-header">
        <div className="kanban-column-title-wrap">
          <h3 className="kanban-column-title">{title}</h3>
          <span className="kanban-count-badge" style={{ borderColor: `${color}40`, color }}>
            {posts.length}
          </span>
        </div>
      </div>

      {/* Scrollable List of Mini Cards */}
      <div className="kanban-cards-container">
        {posts.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description={`No requests currently marked as ${title.toLowerCase()}.`}
          />
        ) : (
          posts.map((post) => {
            const authorName = post.author?.name || post.author?.username || 'Anonymous';
            return (
              <div key={post._id} className="kanban-mini-card">
                <div className="kanban-card-top">
                  <CategoryBadge category={post.category} />
                </div>

                <Link to={`/posts/${post._id}`} className="kanban-card-title">
                  {post.title}
                </Link>

                <div className="kanban-card-footer">
                  <span className="kanban-card-author">
                    by <strong>{authorName}</strong>
                  </span>

                  <div className="kanban-card-stats">
                    {/* Vote count */}
                    <span className="kanban-stat" title={`${post.upvoteCount ?? 0} upvotes`}>
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                        <path d="M8 3.5l4 4.5H9.5V13h-3V8H4l4-4.5z" />
                      </svg>
                      {post.upvoteCount ?? 0}
                    </span>

                    {/* Comment count */}
                    <span className="kanban-stat" title={`${post.commentCount ?? 0} comments`}>
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h1.8l2.2 2.2a.5.5 0 0 0 .8-.4V13h6.2a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11z" />
                      </svg>
                      {post.commentCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
