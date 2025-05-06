
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/auth-context-type';

/**
 * Custom hook to use the auth context with additional authentication state information
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const [isAuthReady, setIsAuthReady] = useState(false);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Mark auth as ready after initial check
  useEffect(() => {
    // Short delay to ensure auth state is fully initialized
    const timer = setTimeout(() => {
      console.log('Auth state is ready:', {
        isAuthenticated: context.authState.isAuthenticated,
        hasToken: !!context.authState.token
      });
      setIsAuthReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [context.authState.isAuthenticated, context.authState.token]);

  return {
    ...context,
    isAuthReady,
    // Helper method to check if user is fully authenticated
    isFullyAuthenticated: isAuthReady && context.authState.isAuthenticated && !!context.authState.token
  };
};
    

