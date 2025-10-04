import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ActivityLogger from './activity-logger';
import { useAuth } from './auth-context';

/**
 * Hook to automatically log route navigation
 * Add this to your main App component to track all page visits
 */
export const useRouteLogger = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Only log if user is authenticated
    if (user) {
      ActivityLogger.logRouteNavigation(location.pathname);
    }
  }, [location.pathname, user]);

  return null;
};

/**
 * Component wrapper for route logging
 * Use this if you prefer a component-based approach
 */
export const RouteLogger = () => {
  useRouteLogger();
  return null;
};