import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredBranchId?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requiredBranchId 
}) => {
  const { user, hasPermission, hasBranchAccess } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  if (requiredBranchId !== undefined && !hasBranchAccess(requiredBranchId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
