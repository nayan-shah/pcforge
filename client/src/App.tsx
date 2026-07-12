import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Admin from './pages/Admin';
import AI from './pages/AI';
import Builder from './pages/Builder';
import Compare from './pages/Compare';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Product from './pages/Product';
import Profile from './pages/Profile';
import Register from './pages/Register';
import AdminLanding from './pages/admin/AdminLanding';
import DashboardHome from './pages/admin/DashboardHome';
import Components from './pages/admin/Components';
import ComponentsPage from './pages/ComponentsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="builder" element={<Builder />} />
        <Route path="product" element={<Product />} />
        <Route path="compare" element={<Compare />} />
        <Route path="ai" element={<AI />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminLanding />} />
        <Route path="admin/home" element={<DashboardHome />} />
        <Route path="admin/components" element={<Components />} />
        <Route path="components" element={<ComponentsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
