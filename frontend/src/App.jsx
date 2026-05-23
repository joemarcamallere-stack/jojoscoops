import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import CustomerShell from './components/CustomerShell';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Tracking from './pages/Tracking';
import Orders from './pages/Orders';
import Testimonial from './pages/Testimonial';
import AdminRoutes from './admin/AdminRoutes';
import StaffRoutes from './admin/StaffRoutes';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
      <Router>
        <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/staff/*" element={<StaffRoutes />} />
        <Route element={<CustomerShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        </Routes>
      </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
