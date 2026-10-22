import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { DownloadBar } from './components/common/DownloadBar';
import { AuthModal } from './components/common/AuthModal';
import { SearchModal } from './components/common/SearchModal';
import { CapCaptchaModal } from './components/common/CapCaptchaModal';
import { HomePage } from './pages/HomePage';
import { ForumPage } from './pages/ForumPage';
import { ActivityPage } from './pages/ActivityPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReleasePage } from './pages/ReleasePage';
import { SearchPage } from './pages/SearchPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

export const App: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark text-slate-100 selection:bg-brand-500/30 selection:text-brand-300 relative">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Routed Content with Animated Transitions */}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/topic/:topicId" element={<ForumPage />} />
              <Route path="/release" element={<ReleasePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/bookmarks" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Bar (Pill shape) */}
      <BottomNav />

      {/* Floating CDN Download Manager Progress Widget */}
      <DownloadBar />

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <AuthModal />
      <SearchModal />
      <CapCaptchaModal />
    </div>
  );
};
