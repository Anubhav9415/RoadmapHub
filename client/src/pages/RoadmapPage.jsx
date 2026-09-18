import React from 'react';
import { useRoadmap } from '../hooks/useRoadmap';
import KanbanBoard from '../components/kanban/KanbanBoard';
import './RoadmapPage.css';

export default function RoadmapPage() {
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useRoadmap();

  const formattedUpdatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="roadmap-page-container">
      {/* Header Section */}
      <header className="roadmap-header">
        <div className="roadmap-header-text">
          <h1 className="roadmap-title">Public Roadmap</h1>
          <p className="roadmap-subtitle">
            Track what features are planned, currently in development, and recently shipped.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="roadmap-refresh-btn"
          disabled={isFetching}
          title="Refresh roadmap"
        >
          <svg
            className={`refresh-icon ${isFetching ? 'spin' : ''}`}
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
            />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
          </svg>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {/* Main Board */}
      {isLoading ? (
        <div className="roadmap-skeleton-grid">
          {[1, 2, 3].map((colIndex) => (
            <div key={colIndex} className="roadmap-skeleton-column">
              <div className="skeleton-line" style={{ height: '32px', marginBottom: '16px' }} />
              <div className="skeleton-line" style={{ height: '70px', marginBottom: '12px' }} />
              <div className="skeleton-line" style={{ height: '70px', marginBottom: '12px' }} />
              <div className="skeleton-line" style={{ height: '70px' }} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="roadmap-error-card">
          <h3>Unable to load roadmap</h3>
          <p>Please check your connection and try again.</p>
          <button type="button" onClick={() => refetch()} className="btn-primary">
            Retry
          </button>
        </div>
      ) : (
        <>
          <KanbanBoard data={data} />

          <footer className="roadmap-footer">
            <span className="live-indicator">
              <span className="live-pulse" />
              Live auto-syncing (30s)
            </span>
            {formattedUpdatedAt && (
              <span className="last-updated-text">
                Last updated at {formattedUpdatedAt}
              </span>
            )}
          </footer>
        </>
      )}
    </div>
  );
}
