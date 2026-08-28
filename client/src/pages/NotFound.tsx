import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';

export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <HiOutlineExclamationCircle className="mx-auto h-16 w-16 text-slate-300" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
        >
          Return to Home
        </Link>
      </div>
    </section>
  );
}
