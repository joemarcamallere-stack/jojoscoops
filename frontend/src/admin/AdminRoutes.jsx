import { Route, Routes } from 'react-router-dom';
import RequireRole from './RequireRole';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminStaff from './pages/AdminStaff';
import EditProduct from './pages/EditProduct';
import EditStaff from './pages/EditStaff';
import OrdersPage from './components/OrdersPage';

export default function AdminRoutes() {
  return (
    <RequireRole role="admin">
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id/edit" element={<EditProduct />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="staff/:id/edit" element={<EditStaff />} />
        <Route path="orders" element={<OrdersPage role="admin" />} />
      </Routes>
    </RequireRole>
  );
}
