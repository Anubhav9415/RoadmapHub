import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import './CreatePostModal.css';

export default function CreatePostModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('feature');
  const [description, setDescription] = useState('');

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (newPost) => api.post('/posts', newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      toast.success('Feature request submitted');
      setTitle('');
      setCategory('feature');
      setDescription('');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit feature request');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      category,
      description: description.trim(),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            Suggest a Feature
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              placeholder="Short, descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
              required
              autoFocus
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="post-category">Category</label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="modal-select"
            >
              <option value="feature">Feature</option>
              <option value="bug">Bug</option>
              <option value="improvement">Improvement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="post-desc">Description (Markdown supported)</label>
            <textarea
              id="post-desc"
              placeholder="Explain the problem you want to solve and how this feature would help..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="modal-textarea"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
