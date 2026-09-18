import React from 'react';
import { Link } from 'react-router-dom';
import UpvoteButton from '../ui/UpvoteButton';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import { timeAgo } from '../../utils/timeAgo';
import './PostCard.css';

export default function PostCard({ post }) {
  const authorName = post.author?.name || post.author?.username || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <article className="feed-post-card" id={`post-${post._id}`}>
      {/* Left: Upvote button in vertical layout */}
      <div className="post-card-vote-col">
        <UpvoteButton post={post} layout="vertical" />
      </div>

      {/* Right: Content details */}
      <div className="post-card-content-col">
        <div className="post-card-meta-top">
          <div className="post-card-badges">
            <StatusBadge status={post.status} />
            <CategoryBadge category={post.category} />
          </div>
          <span className="post-card-time">{timeAgo(post.createdAt)}</span>
        </div>

        <Link to={`/posts/${post._id}`} className="post-card-title">
          {post.title}
        </Link>

        {post.description && (
          <p className="post-card-preview">
            {post.description.replace(/[#*`_~[\]]/g, '').slice(0, 160)}
            {post.description.length > 160 ? '...' : ''}
          </p>
        )}

        <div className="post-card-footer">
          <div className="post-card-author">
            <div className="post-card-avatar" aria-hidden="true">
              {authorInitial}
            </div>
            <span>{authorName}</span>
          </div>

          <Link to={`/posts/${post._id}#comments`} className="post-card-comments-link">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h1.8l2.2 2.2a.5.5 0 0 0 .8-.4V13h6.2a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11z" />
            </svg>
            <span>{post.commentCount ?? 0}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
