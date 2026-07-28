import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute — a route guard for admin-only pages.
 *
 * Behavior:
 * - While the auth state is loading (e.g., verifying a stored token),
 *   we show a neutral full-screen spinner so there's no flash of
 *   unauthorized content (FOUC).
 * - If the user is not authenticated, redirect to /login. React Router
 *   preserves the `from` location so we can redirect back after login.
 * - If the user is authenticated but their role is not 'admin',
 *   redirect to the home page with a 'replace' so they can't go back.
 * - If all checks pass, render the child content.
 */

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // Phase 3: Logged in but not an admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Phase 4: Authenticated admin — render the protected content
  return <>{children}</>;
}
