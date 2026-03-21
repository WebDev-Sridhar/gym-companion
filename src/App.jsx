import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useUserStore from './store/useUserStore';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Diet from './pages/Diet';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import KnowledgeHub from './pages/KnowledgeHub';
import PlanSummary from './pages/PlanSummary';
import { ToastContainer } from './components/ui/Toast';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const session = useAuthStore((s) => s.session);
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  if (!session) return <Navigate to="/auth" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function OnboardingRoute({ children }) {
  const session = useAuthStore((s) => s.session);
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  if (!session) return <Navigate to="/auth" replace />;
  if (isOnboarded) return <Navigate to="/dashboard" replace />;

  return children;
}

function PlanSummaryRoute({ children }) {
  const session = useAuthStore((s) => s.session);
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  if (!session) return <Navigate to="/auth" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;

  return children;
}

function PublicRoute({ children }) {
  const session = useAuthStore((s) => s.session);
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  if (session && isOnboarded) return <Navigate to="/dashboard" replace />;
  if (session && !isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const loading = useAuthStore((s) => s.loading);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <ToastContainer />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
          <Route path="/plan-summary" element={<PlanSummaryRoute><PlanSummary /></PlanSummaryRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><Diet /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/knowledge" element={<ProtectedRoute><KnowledgeHub /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
