import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar({ onOpenAuth, onOpenNewPost }) {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Left: Logo & Brand */}
        <div className="navbar-brand-group">
          <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-logo-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="brand-name">RoadmapPortal</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Feedback
            </Link>
            <Link to="/roadmap" className={`nav-link ${isActive('/roadmap') ? 'active' : ''}`}>
              Roadmap
            </Link>
            {user && isAdmin && isAdmin() && (
              <Link to="/admin" className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Actions / Auth */}
        <div className="navbar-actions-group">
          <button
            type="button"
            className="btn-new-request"
            onClick={onOpenNewPost}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z" />
            </svg>
            <span>Give Feedback</span>
          </button>

          {user ? (
            <div className="user-profile-menu">
              <div className="user-nav-avatar" title={user.email}>
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                className="btn-logout-link"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <button
                type="button"
                className="btn-login-text"
                onClick={() => onOpenAuth('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn-signup-pill"
                onClick={() => onOpenAuth('signup')}
              >
                Sign up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link
            to="/"
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Feedback
          </Link>
          <Link
            to="/roadmap"
            className={`mobile-nav-link ${isActive('/roadmap') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Roadmap
          </Link>
          {user && isAdmin && isAdmin() && (
            <Link
              to="/admin"
              className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <button
              type="button"
              className="mobile-nav-link logout-link"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              Log out ({user.name || user.username})
            </button>
          ) : (
            <div className="mobile-auth-actions">
              <button
                type="button"
                className="btn-login-text"
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn-signup-pill"
                onClick={() => {
                  onOpenAuth('signup');
                  setMobileMenuOpen(false);
                }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
