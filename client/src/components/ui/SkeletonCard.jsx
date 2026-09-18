import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-label="Loading..." aria-busy="true">
      <div className="skeleton-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-meta">
          <div className="skeleton-line w-32" />
          <div className="skeleton-line w-20 short" />
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line w-full title" />
        <div className="skeleton-line w-3/4" />
        <div className="skeleton-line w-full" />
        <div className="skeleton-line w-2/3" />
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-badge" />
        <div className="skeleton-badge" />
        <div className="skeleton-line w-24 short" />
      </div>
    </div>
  );
}
