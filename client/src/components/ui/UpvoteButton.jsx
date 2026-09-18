import { useAuthStore } from '../../store/authStore';
import { useToggleUpvote } from '../../hooks/usePost';
import toast from 'react-hot-toast';
import './UpvoteButton.css';

/**
 * UpvoteButton — works in both card (vertical) and detail (horizontal) layouts.
 * @prop {object} post    - Post document (needs _id, upvoteCount, upvotes[])
 * @prop {"vertical"|"horizontal"} layout
 */
export default function UpvoteButton({ post, layout = 'vertical' }) {
  const { user } = useAuthStore();
  const { mutate, isPending } = useToggleUpvote(post._id);

  const currentUserId = user?.id || user?._id;
  const hasVoted = Boolean(
    currentUserId &&
      post.upvotes?.some((u) => (u?._id || u)?.toString() === currentUserId.toString())
  );

  const handleUpvote = () => {
    if (!user) {
      toast.error('Log in to upvote');
      return;
    }
    mutate(undefined, {
      onSuccess: () => {
        if (hasVoted) {
          toast.success('Vote removed');
        } else {
          toast.success('Upvoted!');
        }
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to update vote');
      },
    });
  };

  return (
    <button
      id={`upvote-${post._id}`}
      onClick={handleUpvote}
      disabled={isPending}
      aria-pressed={hasVoted}
      aria-label={`${hasVoted ? 'Remove upvote' : 'Upvote'} — ${post.upvoteCount ?? 0} votes`}
      className={`upvote-btn upvote-btn--${layout} ${hasVoted ? 'upvote-btn--active' : ''}`}
    >
      <svg
        className="upvote-icon"
        viewBox="0 0 16 16"
        fill={hasVoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 1.5l2.5 4H13l-2.5 4.5H11l1 4H4l1-4H4.5L2 5.5h2.5L8 1.5z"
        />
      </svg>
      <span className="upvote-count">{post.upvoteCount ?? 0}</span>
    </button>
  );
}
