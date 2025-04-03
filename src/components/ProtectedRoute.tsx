
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Add console logging for debugging
  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { user: !!user, loading });
  }, [user, loading]);

  if (loading) {
    // You can replace this with a loading component
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - Redirecting to auth page');
    // Redirect to auth page with a return URL
    return <Navigate to={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
