import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // or a loading spinner
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/profile" replace /> : <>{children}</>;
};
