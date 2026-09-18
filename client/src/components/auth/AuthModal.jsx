import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import './AuthModal.css';

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', { email, password });
        const { user, accessToken } = data.data;
        setAuth(user, accessToken);
        toast.success(`Welcome back, ${user.name || user.username}!`);
        onClose();
      } else {
        await api.post('/auth/signup', { username, email, password });
        toast.success('Check your email to verify your account');
        setMode('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'login' ? 'Log in to your account' : 'Create an account'}
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'signup' && (
            <div className="modal-form-group">
              <label htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                type="text"
                placeholder="Choose a username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="modal-input"
                required
              />
            </div>
          )}

          <div className="modal-form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modal-input"
              required
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="modal-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>

          <div className="auth-switch-prompt">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setMode('login')}
                >
                  Log in
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
