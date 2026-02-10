import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Skeleton from './components/Skeleton';

// Lazy load pages for performance optimization
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TournamentDetails = React.lazy(() => import('./pages/TournamentDetails'));
const CreateTournament = React.lazy(() => import('./pages/CreateTournament'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Admin = React.lazy(() => import('./pages/Admin'));

const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-rivals-neon/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-rivals-neon rounded-full border-t-transparent animate-spin" />
    </div>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] User:', user?.username, 'Auth:', isAuthenticated, 'Admin:', isAdmin, 'Path:', location.pathname);

  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('[ProtectedRoute] Admin required but user is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Global Error Catcher for Production Debugging
if (typeof window !== 'undefined') {
  window.onerror = function (message, source, lineno, colno, error) {
    console.error('GLOBAL ERROR:', message, 'at', source, ':', lineno, ':', colno);
    // Optionally alert for the user to see it
    if (window.location.hostname !== 'localhost') {
      // alert('Une erreur est survenue ! Regarde la console ou contacte le support. Error: ' + message);
    }
  };
}

const ProfileRedirect = () => {
  const { user } = useAuth();
  if (user?.username) {
    return <Navigate to={`/profile/${user.username}`} replace />;
  }
  return (
    <div className="p-10 text-center text-gray-500 font-black italic uppercase tracking-widest">
      Initialising neural link to profile...
    </div>
  );
};

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute requireAdmin={true}><Layout><CreateTournament /></Layout></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<ProtectedRoute><Layout><TournamentDetails /></Layout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfileRedirect /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Layout><Admin /></Layout></ProtectedRoute>} />

        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
