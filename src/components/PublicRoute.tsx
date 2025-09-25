import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
  redirectIfAuthenticated?: string;
  allowAuthenticated?: boolean;
}

export const PublicRoute = ({ 
  children, 
  redirectIfAuthenticated = '/dashboard',
  allowAuthenticated = false 
}: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && !allowAuthenticated) {
      navigate(redirectIfAuthenticated);
    }
  }, [user, loading, navigate, redirectIfAuthenticated, allowAuthenticated]);

  if (loading) {
    return <>{children}</>;
  }

  return <>{children}</>;
};