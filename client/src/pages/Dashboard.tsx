import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiDatabase, HiLightningBolt, HiCurrencyRupee, HiArrowRight, HiTrash } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { getBuilds } from '../api/buildApi';
import apiClient from '../api/axios';
import { formatPrice } from '../utils/formatters';

interface BuildComponent {
  componentId: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  powerWatts: number;
  image: string;
}

interface Build {
  _id: string;
  name: string;
  components: BuildComponent[];
  totalPrice: number;
  totalPower: number;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const data = await getBuilds();
        setBuilds(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load builds');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  const handleDeleteBuild = async (buildId: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return;

    setDeletingId(buildId);
    try {
      await apiClient.delete(`/builds/${buildId}`);
      setBuilds((prev) => prev.filter((b) => b._id !== buildId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete build');
    } finally {
      setDeletingId(null);
    }
  };

  const totalSpend = builds.reduce((sum, b) => sum + b.totalPrice, 0);
  const avgPower = builds.length > 0
    ? Math.round(builds.reduce((sum, b) => sum + b.totalPower, 0) / builds.length)
    : 0;

  return (
    <section className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-card"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
          DASHBOARD
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Welcome back, {user?.name ?? 'Builder'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your saved PC builds, track spending, and jump into the builder.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 border border-slate-200/60">
              <HiDatabase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Builds</p>
              <p className="text-2xl font-extrabold text-slate-900">{builds.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 border border-emerald-200/60">
              <HiCurrencyRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spend</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatPrice(totalSpend, 'INR')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 border border-amber-200/60">
              <HiLightningBolt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Power</p>
              <p className="text-2xl font-extrabold text-slate-900">{avgPower}W</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Builds List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HiDatabase className="h-5 w-5 text-slate-500" />
            Your Builds
          </h2>
          <Link
            to="/builder"
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 transition-all"
          >
            New Build <HiArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-6 text-center mt-4">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          </div>
        ) : builds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center mt-4">
            <HiDatabase className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No builds yet</p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              Head to the PC Builder to configure and save your first custom PC build.
            </p>
            <Link
              to="/builder"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-cyan-600 transition-colors"
            >
              Go to Builder <HiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {builds.map((build) => (
              <motion.div
                key={build._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{build.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{build.components.length} components</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">{formatPrice(build.totalPrice, 'INR')}</span>
                    <span>•</span>
                    <span>{build.totalPower}W</span>
                    <span>•</span>
                    <span>{new Date(build.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {build.components.slice(0, 4).map((comp) => (
                      <span
                        key={comp.componentId}
                        className="inline-flex rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {comp.category}: {comp.brand}
                      </span>
                    ))}
                    {build.components.length > 4 && (
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        +{build.components.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteBuild(build._id)}
                    disabled={deletingId === build._id}
                    className="flex items-center gap-1 rounded-lg border border-rose-200/80 bg-rose-50/50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <HiTrash className="h-3.5 w-3.5" />
                    {deletingId === build._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
