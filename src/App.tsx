import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TournamentDetails from './pages/TournamentDetails';
import CreateTournament from './pages/CreateTournament';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute requireAdmin={true}><Layout><CreateTournament /></Layout></ProtectedRoute>} />
      <Route path="/tournament/:id" element={<ProtectedRoute><Layout><TournamentDetails /></Layout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><div className="p-10 text-center text-gray-500">Redirecting to your profile... (TODO)</div></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Layout><Admin /></Layout></ProtectedRoute>} />

      {/* Fallback routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
