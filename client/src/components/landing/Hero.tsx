import { motion } from 'framer-motion';
import { HiSearch } from 'react-icons/hi';

export default function Hero() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-16 text-white sm:px-10 lg:px-14">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200 shadow-lg shadow-slate-950/20">
              AI-Powered PC Building
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Build Your Perfect PC with AI
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Choose parts that match your goals, budget and workflow. Let AI recommend, compare, and optimize your dream PC build in minutes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.5fr_auto]">
            <div className="rounded-3xl bg-white/95 p-4 shadow-xl shadow-slate-950/20 ring-1 ring-white/10 backdrop-blur-sm">
              <label className="sr-only" htmlFor="hero-search">
                Search components
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/5 px-4 py-3 text-slate-800 shadow-inner shadow-slate-950/5">
                <HiSearch className="h-5 w-5 text-slate-500" />
                <input
                  id="hero-search"
                  type="search"
                  placeholder="Search GPUs, CPUs, motherboards..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button className="hidden rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:inline-flex">
              Explore Catalog
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button className="inline-flex items-center justify-center rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400">
              Build with AI
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/15">
              Browse Components
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.35),_transparent_30%)]" />
          <div className="absolute -left-12 top-24 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex min-h-[360px] flex-col justify-between gap-6 rounded-[1.75rem] bg-slate-950/80 p-8 text-white shadow-xl shadow-slate-950/30">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                AI visualization</div>
              <h2 className="text-2xl font-semibold">Smart build preview</h2>
              <p className="max-w-sm text-sm leading-6 text-slate-300">
                Visualize your build instantly with AI-selected components, performance estimates, and price signals.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">GPU</p>
                <p className="mt-2 font-semibold">RTX 4090</p>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">CPU</p>
                <p className="mt-2 font-semibold">Ryzen 9 7950X</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
