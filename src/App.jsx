// ─── App.jsx ───
// Root component: AnimatePresence route transitions, layout shell, and global overlays.

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth, AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import PageTransition from './components/layout/PageTransition';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminRoute from './components/shared/AdminRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';

// ── Lazy-loaded Pages ──
// Auth
const Login  = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

// Main
const Home    = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));

// Verticals
const MoviesIndex = lazy(() => import('./pages/movies/MoviesIndex'));
const MovieDetail = lazy(() => import('./pages/movies/MovieDetail'));
const EventsIndex = lazy(() => import('./pages/events/EventsIndex'));
const EventDetail = lazy(() => import('./pages/events/EventDetail'));
const SportsIndex = lazy(() => import('./pages/sports/SportsIndex'));
const DiningIndex = lazy(() => import('./pages/dining/DiningIndex'));
const StaysIndex  = lazy(() => import('./pages/stays/StaysIndex'));

// Itinerary & Checkout
const Itinerary = lazy(() => import('./pages/Itinerary'));
const Success   = lazy(() => import('./pages/Success'));

// Admin & Testing
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TestPage = lazy(() => import('./pages/TestPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const Info = lazy(() => import('./pages/Info'));

// ── Animated Routes Wrapper ──
const AnimatedRoutes = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
        <Routes location={location} key={location.pathname}>
          {/* ═══ Public Routes ═══ */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <PageTransition><Signup /></PageTransition>} />

          {/* ═══ Protected Routes ═══ */}
          <Route path="/" element={<ProtectedRoute><PageTransition>{isAdmin ? <Navigate to="/test" replace /> : <Home />}</PageTransition></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><PageTransition><WishlistPage /></PageTransition></ProtectedRoute>} />

          {/* Movies */}
          <Route path="/movies" element={<ProtectedRoute><PageTransition><MoviesIndex /></PageTransition></ProtectedRoute>} />
          <Route path="/movie/:id" element={<ProtectedRoute><PageTransition><MovieDetail /></PageTransition></ProtectedRoute>} />

          {/* Events */}
          <Route path="/events" element={<ProtectedRoute><PageTransition><EventsIndex /></PageTransition></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><PageTransition><EventDetail /></PageTransition></ProtectedRoute>} />

          {/* Sports */}
          <Route path="/sports" element={<ProtectedRoute><PageTransition><SportsIndex /></PageTransition></ProtectedRoute>} />

          {/* Dining */}
          <Route path="/dining" element={<ProtectedRoute><PageTransition><DiningIndex /></PageTransition></ProtectedRoute>} />

          {/* Stays */}
          <Route path="/stays" element={<ProtectedRoute><PageTransition><StaysIndex /></PageTransition></ProtectedRoute>} />

          {/* Itinerary (Universal Bag) */}
          <Route path="/itinerary" element={<ProtectedRoute><PageTransition><Itinerary /></PageTransition></ProtectedRoute>} />

          {/* Post-Purchase Success */}
          <Route path="/success" element={<ProtectedRoute><PageTransition><Success /></PageTransition></ProtectedRoute>} />

          {/* ═══ Admin & Test Routes ═══ */}
          <Route path="/admin" element={<AdminRoute><PageTransition><AdminPanel /></PageTransition></AdminRoute>} />
          <Route path="/test" element={<AdminRoute><PageTransition><TestPage /></PageTransition></AdminRoute>} />

          {/* ═══ Catch-all / Info ═══ */}
          <Route path="/info/*" element={<PageTransition><Info /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

// ── App Shell ──
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <ItineraryProvider>
            <WishlistProvider>
              <AnimatedRoutes />

              {/* Global Toast Notifications */}
            <ToastContainer
              position="bottom-right"
              autoClose={3500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              toastStyle={{
                borderRadius: '12px',
                fontSize: '14px',
              }}
            />
            </WishlistProvider>
          </ItineraryProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
