import React from 'react';
import './EmptyState.css';

/**
 * Reusable EmptyState component for feeds, tables, columns, and comment threads.
 * @param {React.ReactNode} icon - Optional custom icon
 * @param {string} title - Heading text
 * @param {string} description - Descriptive subtitle
 * @param {string} actionLabel - Optional CTA button label
 * @param {function} onAction - Optional CTA button handler
 */
export default function EmptyState({
  icon,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrap" aria-hidden="true">
        {icon || (
          <svg
            viewBox="0 0 24 24"
            width="36"
            height="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="empty-state-default-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        )}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary empty-state-action-btn"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
