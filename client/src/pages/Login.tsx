import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
    clearError();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const { email, password } = formData;

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setValidationError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = searchParams.get('redirect') || '/';
      navigate(redirectTo);
    } catch (err: any) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[75vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-slate-400/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md space-y-8 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-8 shadow-soft-lg sm:p-10"
      >
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
          >
            <span className="font-mono">PC</span>
            <span>FORGE</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Log in to manage your builds and access your PC configuration profile
          </p>
        </div>

        {/* Error Container */}
        <AnimatePresence mode="wait">
          {(validationError || authError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-rose-50 border border-rose-200/80 p-4 text-sm text-rose-600"
            >
              {validationError || authError}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative mt-1.5 flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all duration-200">
                <HiMail className="h-5 w-5 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                {/* Optional reset link placeholder if desired */}
              </div>
              <div className="relative mt-1.5 flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all duration-200">
                <HiLockClosed className="h-5 w-5 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative flex w-full justify-center rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70 transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-slate-900 hover:text-cyan-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
