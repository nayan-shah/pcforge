import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';

export default function Register() {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
    clearError();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      setValidationError('Name is required');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, '');
      navigate('/');
    } catch (err: any) {
      // AuthContext handles setting state error, caught locally for safety
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10"
      >
        <div className="text-center">
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent"
          >
            PCForge
          </Link>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Start building your dream gaming rig or workstation today
          </p>
        </div>

        {/* Display validation or server error */}
        <AnimatePresence mode="wait">
          {(validationError || authError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600"
            >
              {validationError || authError}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative mt-1 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
                <HiUser className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative mt-1 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
                <HiMail className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
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


            {/* Password Input */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-1 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
                <HiLockClosed className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="•••••••• (Min 8 chars)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative mt-1 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
                <HiLockClosed className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative flex w-full justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-70 transition duration-150 ease-in-out cursor-pointer"
            >
              {isSubmitting ? (
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
