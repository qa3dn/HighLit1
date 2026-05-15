import React, { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();

  // If authentication state is still initializing, you can optionally render a loading state
  // This prevents brief redirects before localStorage is parsed.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">
        [ LOADING_SYSTEM... ]
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role Check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized
  return children ? <>{children}</> : <Outlet />;
};
