import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PostCard from '../components/posts/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import './HomePage.css';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

export default function HomePage({ onOpenNewPost }) {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('top'); // 'top' | 'newest' | 'commented'
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data } = await api.get('/posts?limit=150');
      return data.data?.posts ?? data.data ?? [];
    },
  });

  // Client-side filtering & sorting
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    if (status !== 'all') {
      result = result.filter((p) => p.status === status);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.author?.name?.toLowerCase().includes(query) ||
          p.author?.username?.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'top') {
      result.sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'commented') {
      result.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
    }

    return result;
  }, [posts, category, status, search, sortBy]);

  const hasActiveFilters = category !== 'all' || status !== 'all' || search.trim() !== '';

  const handleClearFilters = () => {
    setCategory('all');
    setStatus('all');
    setSearch('');
  };

  return (
    <div className="home-page-container">
      {/* Hero Header */}
      <section className="feed-hero-section">
        <div className="hero-text-content">
          <h1 className="hero-heading">Feature Requests & Ideas</h1>
          <p className="hero-subheading">
            Vote on existing ideas or suggest new features to help shape our product roadmap.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewPost}
          className="btn-primary hero-cta-btn"
        >
          + Suggest a Feature
        </button>
      </section>

      {/* Filter & Toolbar */}
      <div className="feed-toolbar">
        {/* Search */}
        <div className="feed-search-wrap">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="search-icon">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="feed-search-input"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="feed-filter-controls">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="feed-select"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="feed-select"
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="feed-select"
            aria-label="Sort requests"
          >
            <option value="top">Top Voted</option>
            <option value="newest">Newest</option>
            <option value="commented">Most Commented</option>
          </select>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="feed-content-list">
        {isLoading ? (
          <div className="feed-skeleton-stack">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <div className="feed-error-card">
            <h3>Unable to load feature requests</h3>
            <p>Please check your connection and try again.</p>
            <button type="button" onClick={() => refetch()} className="btn-primary">
              Retry
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No matching requests" : "No feature requests yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search query or removing category/status filters."
                : "Be the first to submit a suggestion and help prioritize the roadmap!"
            }
            actionLabel={hasActiveFilters ? "Clear All Filters" : "+ Suggest First Feature"}
            onAction={hasActiveFilters ? handleClearFilters : onOpenNewPost}
          />
        ) : (
          filteredPosts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
