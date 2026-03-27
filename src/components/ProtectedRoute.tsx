import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './SessionProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
