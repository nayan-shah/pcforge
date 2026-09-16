import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword } from '../api/authApi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiMail,
  HiShieldCheck,
  HiDatabase,
  HiArrowRight,
  HiLogout,
  HiPencil,
  HiCheck,
  HiX,
  HiLockClosed,
} from 'react-icons/hi';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();

  // ── Edit Profile state ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Change Password state ───────────────────────────────────────────
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile is always available since ProtectedRoute guarantees auth
  if (!user) return null;

  const handleStartEdit = () => {
    setEditName(user.name);
    setEditAvatar(user.avatar);
    setIsEditing(true);
    setProfileMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileMsg(null);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setProfileMsg({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await updateProfile({ name: editName.trim(), avatar: editAvatar });
      updateUser(updated);
      setIsEditing(false);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Current password is required' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordSaving(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8"
      >
        {/* Ambient background */}
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-cyan-50/30 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-slate-100/30 blur-2xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {isEditing ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={
                  editAvatar ||
                  '/default-avatar.jpg'
                }
                alt={editName}
                className="h-24 w-24 rounded-xl object-cover border-2 border-slate-200 shadow-soft flex-shrink-0"
              />
              <input
                type="text"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="Avatar URL (optional)"
                className="w-full max-w-[220px] rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
            </div>
          ) : (
            <img
              src={
                user.avatar ||
                '/default-avatar.jpg'
              }
              alt={user.name}
              className="h-24 w-24 rounded-xl object-cover border-2 border-slate-200 shadow-soft flex-shrink-0"
            />
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-extrabold tracking-tight text-slate-900 bg-transparent border-b-2 border-slate-400 outline-none px-1 py-0.5 w-full max-w-xs"
                  autoFocus
                />
              ) : (
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{user.name}</h1>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <HiShieldCheck className="h-3.5 w-3.5" />
                {user.role}
              </span>
            </div>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-500 text-sm">
              <HiMail className="h-4 w-4 text-slate-400" />
              {user.email}
            </p>
            <p className="text-xs text-slate-400">
              Account level:{' '}
              <span className="font-semibold text-slate-500 capitalize">{user.role} User</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 self-center sm:self-start">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-70 cursor-pointer"
                >
                  <HiCheck className="h-4 w-4" />
                  {profileSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <HiX className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all shadow-sm cursor-pointer"
                >
                  <HiPencil className="h-4 w-4" />
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-all shadow-sm cursor-pointer"
                >
                  <HiLogout className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile update feedback */}
        <AnimatePresence>
          {profileMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-4 rounded-xl p-3 text-sm font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200/80 text-rose-600'
              }`}
            >
              {profileMsg.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Account Content Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Saved Builds Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 rounded-xl border border-slate-200/80 bg-white p-6 shadow-card space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HiDatabase className="h-5 w-5 text-slate-500" />
              Saved Custom Builds
            </h2>
            <Link
              to="/builder"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
            >
              New Build <HiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {user.savedBuilds && user.savedBuilds.length > 0 ? (
            <div className="grid gap-4">
              {/* Future feature: mapping actual saved user builds */}
              {user.savedBuilds.map((buildId) => (
                <div
                  key={buildId}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Saved PC Rig</p>
                    <p className="text-xs text-slate-400">ID: {buildId}</p>
                  </div>
                  <Link
                    to={`/builder?id=${buildId}`}
                    className="rounded-lg bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all shadow-sm"
                  >
                    Load Build
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              <p className="text-sm font-semibold">No saved PC configurations yet</p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                Use our PC Builder helper to configure components, estimate power usage, check
                compatibility, and save your builds.
              </p>
              <Link
                to="/builder"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-cyan-600 transition-colors"
              >
                Go to Builder <HiArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Sidebar Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4"
        >
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Account Navigation
          </h3>

          <div className="flex flex-col gap-2">
            <Link
              to="/builder"
              className="w-full text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              PC Builder Studio
            </Link>
            <Link
              to="/search"
              className="w-full text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              Compare Components
            </Link>
            <Link
              to="/ai"
              className="w-full text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              Ask AI Builder Assistant
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
              >
                Admin Control Room
              </Link>
            )}

            <hr className="my-2 border-slate-100" />

            {/* Change Password */}
            <button
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordMsg(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              className="w-full text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <HiLockClosed className="h-4 w-4 text-slate-400" />
              Change Password
            </button>
          </div>

          {/* Change Password Form */}
          <AnimatePresence>
            {showPasswordForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleChangePassword}
                className="space-y-3 overflow-hidden"
              >
                <div>
                  <label className="text-xs font-semibold text-slate-600">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <AnimatePresence>
                  {passwordMsg && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`rounded-lg p-2.5 text-xs font-medium ${
                        passwordMsg.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-700'
                          : 'bg-rose-50 border border-rose-200/80 text-rose-600'
                      }`}
                    >
                      {passwordMsg.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-70 cursor-pointer"
                >
                  {passwordSaving ? 'Updating…' : 'Update Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
