import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * GuestRoute — a route guard for guest-only pages (login, register).
 *
 * Behavior:
 * - While the auth state is loading, we show a neutral full-screen
 *   spinner to prevent content flashing.
 * - If the user is already authenticated, redirect them away:
 *   - If a `redirect` query parameter exists, navigate there.
 *   - Otherwise, navigate to the home page.
 * - If not authenticated, render the child content.
 */

interface GuestRouteProps {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  // Phase 1: Auth state is still being resolved
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600 dark:border-slate-700" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // Phase 2: Already logged in — redirect away from guest pages
  if (isAuthenticated) {
    const redirectTo = searchParams.get('redirect') || '/';
    return <Navigate to={redirectTo} replace />;
  }

  // Phase 3: Not authenticated — render the guest-only content
  return <>{children}</>;
}
