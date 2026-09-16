import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-10 text-center shadow-soft-lg"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HiOutlineExclamationCircle className="mx-auto h-16 w-16 text-slate-300" />
        </motion.div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:from-slate-700 hover:to-slate-800 active:scale-95"
        >
          Return to Home
        </Link>
      </motion.div>
    </section>
  );
}
