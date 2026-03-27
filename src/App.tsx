import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, ReactNode } from 'react';
import { FirebaseProvider, ErrorBoundary, useFirebase } from './FirebaseContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import Conferences from './pages/Conferences';
import Profile from './pages/Profile';
import Apply from './pages/Apply';
import Login from './pages/Login';
import Admin from './pages/Admin';
import HostMUN from './pages/HostMUN';
import Leaderboard from './pages/Leaderboard';
import ChairDashboard from './pages/ChairDashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Component
function ProtectedRoute({ children, adminOnly, chairOnly }: { children: ReactNode; adminOnly?: boolean; chairOnly?: boolean }) {
  const { user, loading, isAdmin, isBanned, profile } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6 text-center">
        <div className="max-w-md w-full bg-surface-container-low p-8 rounded-xl border border-error/20">
          <h2 className="text-2xl font-bold text-error mb-4">Account Banned</h2>
          <p className="text-on-surface-variant mb-6">Your account has been restricted from accessing the platform. Please contact the Secretariat for more information.</p>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (chairOnly && !isAdmin && profile?.role !== 'chair') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans selection:bg-primary-container/30 selection:text-primary-container">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/committees" element={<Conferences />} />
                <Route path="/conferences" element={<Conferences />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/apply" 
                  element={
                    <ProtectedRoute>
                      <Apply />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/host" 
                  element={
                    <ProtectedRoute>
                      <HostMUN />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chair" 
                  element={
                    <ProtectedRoute chairOnly>
                      <ChairDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                {/* Fallback for other routes */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
