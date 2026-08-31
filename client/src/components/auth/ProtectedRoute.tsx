import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — a route guard for authenticated-only pages.
 *
 * Behavior:
 * - While the auth state is loading (e.g., verifying a stored token),
 *   we show a neutral full-screen spinner so there's no flash of
 *   unauthorized content (FOUC).
 * - If the user is not authenticated, redirect to /login with a
 *   `redirect` query parameter preserving the attempted URL so
 *   the login page can redirect back after authentication.
 * - If authenticated, render the child content.
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Phase 1: Auth state is still being resolved (token verification in progress)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600 dark:border-slate-700" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  // Phase 2: Not logged in — send to login, remembering the attempted URL
  if (!isAuthenticated) {
    const redirectPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  // Phase 3: Authenticated — render the protected content
  return <>{children}</>;
}
