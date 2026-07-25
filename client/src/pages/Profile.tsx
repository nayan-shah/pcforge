import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiShieldCheck, HiDatabase, HiArrowRight, HiLogout } from 'react-icons/hi';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <HiUser className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please log in or register a new account to access and view your PCForge profile page.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/10 hover:from-violet-700 hover:to-indigo-700 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-violet-50/50 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-indigo-50/40 blur-2xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
            alt={user.name}
            className="h-24 w-24 rounded-3xl object-cover border-2 border-violet-100 shadow-md shadow-violet-500/5 flex-shrink-0"
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{user.name}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                <HiShieldCheck className="h-3.5 w-3.5" />
                {user.role}
              </span>
            </div>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-600 text-sm">
              <HiMail className="h-4 w-4 text-slate-400" />
              {user.email}
            </p>
            <p className="text-xs text-slate-400">
              Account level: <span className="font-semibold text-slate-500 capitalize">{user.role} User</span>
            </p>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-2xl border border-rose-100 hover:border-rose-200 bg-rose-50/30 hover:bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition shadow-sm hover:shadow cursor-pointer self-center sm:self-start"
          >
            <HiLogout className="h-4 w-4" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Account Content Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Saved Builds Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HiDatabase className="h-5 w-5 text-violet-500" />
              Saved Custom Builds
            </h2>
            <Link
              to="/builder"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-0.5 transition"
            >
              New Build <HiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {user.savedBuilds && user.savedBuilds.length > 0 ? (
            <div className="grid gap-4">
              {/* Future feature: mapping actual saved user builds */}
              {user.savedBuilds.map((buildId) => (
                <div key={buildId} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Saved PC Rig</p>
                    <p className="text-xs text-slate-400">ID: {buildId}</p>
                  </div>
                  <Link
                    to={`/builder?id=${buildId}`}
                    className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition shadow-sm"
                  >
                    Load Build
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-250 p-8 text-center text-slate-500">
              <p className="text-sm font-semibold">No saved PC configurations yet</p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                Use our PC Builder helper to configure components, estimate power usage, check compatibility, and save your builds.
              </p>
              <Link
                to="/builder"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 transition"
              >
                Go to Builder <HiArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Navigation Sidebar Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Account Navigation</h3>
          
          <div className="flex flex-col gap-2">
            <Link
              to="/builder"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition"
            >
              PC Builder Studio
            </Link>
            <Link
              to="/compare"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition"
            >
              Compare Components
            </Link>
            <Link
              to="/ai"
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition"
            >
              Ask AI Builder Assistant
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full text-left p-3 rounded-2xl bg-violet-50/50 hover:bg-violet-50 text-violet-700 text-sm font-semibold transition"
              >
                Admin Control Room
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
