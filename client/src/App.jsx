import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import RoadmapPage from './pages/RoadmapPage';
import AdminPage from './pages/AdminPage';
import CreatePostModal from './components/posts/CreatePostModal';
import AuthModal from './components/auth/AuthModal';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s
      retry: 1,
    },
  },
});

export default function App() {
  const { user } = useAuthStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const handleOpenAuth = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleOpenNewPost = () => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    setIsCreateOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-layout-root">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e293b',
                color: '#ffffff',
                fontSize: '13.5px',
                borderRadius: '8px',
                padding: '10px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />

          {/* Navigation Bar */}
          <Navbar
            onOpenAuth={handleOpenAuth}
            onOpenNewPost={handleOpenNewPost}
          />

          {/* Page Routing */}
          <main className="app-main-content">
            <Routes>
              <Route path="/" element={<HomePage onOpenNewPost={handleOpenNewPost} />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route
                path="*"
                element={
                  <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                    <h2>404 - Page Not Found</h2>
                    <p style={{ color: '#64748b' }}>The page you requested does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Modals */}
          <CreatePostModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
          />

          <AuthModal
            isOpen={authModal.isOpen}
            initialMode={authModal.mode}
            onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
