import { Route, Routes } from 'react-router-dom';
import RequireRole from './RequireRole';
import StaffDashboard from './pages/StaffDashboard';
import StaffProducts from './pages/StaffProducts';
import OrdersPage from './components/OrdersPage';

export default function StaffRoutes() {
  return (
    <RequireRole role="staff">
      <Routes>
        <Route index element={<StaffDashboard />} />
        <Route path="products" element={<StaffProducts />} />
        <Route path="orders" element={<OrdersPage role="staff" />} />
      </Routes>
    </RequireRole>
  );
}
