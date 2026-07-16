import { Outlet } from 'react-router-dom';
import Footer from '../common/Footer';
import Navbar from '../common/Navbar';
import CartDrawer from '../common/CartDrawer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}

