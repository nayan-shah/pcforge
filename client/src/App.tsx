import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminRoute from './components/admin/AdminRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import AI from './pages/AI';
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import Register from './pages/Register';
import AdminLanding from './pages/admin/AdminLanding';
import DashboardHome from './pages/admin/DashboardHome';
import Components from './pages/admin/Components';
import ComponentsPage from './pages/ComponentsPage';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />

        {/* Guest-only routes — redirect to home if already logged in */}
        <Route
          path="login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Protected routes — redirect to login if not authenticated */}
        <Route
          path="builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="components/:id" element={<ProductDetails />} />
        <Route path="ai" element={<AI />} />
        <Route path="components" element={<ComponentsPage />} />
        <Route path="search" element={<SearchResults />} />

        {/* Admin-only routes */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLanding />
            </AdminRoute>
          }
        />
        <Route
          path="admin/home"
          element={
            <AdminRoute>
              <DashboardHome />
            </AdminRoute>
          }
        />
        <Route
          path="admin/components"
          element={
            <AdminRoute>
              <Components />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
