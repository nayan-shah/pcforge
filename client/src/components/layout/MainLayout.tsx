import { Outlet } from 'react-router-dom';
import Footer from '../common/Footer';
import Navbar from '../common/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-[1536px] px-3 py-10 sm:px-4 lg:px-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

