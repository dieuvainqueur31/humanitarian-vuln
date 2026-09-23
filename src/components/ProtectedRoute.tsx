import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { UserRole } from '../context/AuthProvider';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { DashboardLayout } from './layout/DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  // 1. Redirect unauthenticated users to login, storing intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Render Unauthorized state in DashboardLayout if user lacks allowed role
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <DashboardLayout>
        <UnauthorizedPage
          requiredRole={allowedRoles.map(r => r.replace('_', ' ')).join(' or ')}
        />
      </DashboardLayout>
    );
  }

  // 3. Authorized access granted
  return <>{children}</>;
};
