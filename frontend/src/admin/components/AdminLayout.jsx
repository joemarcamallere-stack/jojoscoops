import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import LogoutDialog from './LogoutDialog';
import CreamyIcon from '../../components/CreamyIcon';
import { checkAuth, clearAuthClientState, logout } from '../../lib/adminApi';
import '../../styles/admin.css';
import '../../styles/admin-dashboard.css';

const adminNav = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: 'grid' },
  { key: 'users', label: 'Users', path: '/admin/users', icon: 'user' },
  { key: 'products', label: 'Products', path: '/admin/products', icon: 'bag', arrow: true },
  { key: 'staff', label: 'Staff', path: '/admin/staff', icon: 'staff' },
  { key: 'orders', label: 'Purchases', path: '/admin/orders', icon: 'orders' },
];

const staffNav = [
  { key: 'dashboard', label: 'Dashboard', path: '/staff', icon: 'grid' },
  { key: 'products', label: 'Products', path: '/staff/products', icon: 'bag' },
  { key: 'orders', label: 'Purchases', path: '/staff/orders', icon: 'orders' },
];

function NavIcon({ type }) {
  if (type === 'grid') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    );
  }
  if (type === 'user') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (type === 'bag') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    );
  }
  if (type === 'staff') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    );
  }
  if (type === 'orders') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 20H4a2 2 0 01-2-2V5a2 2 0 012-2h3.9a2 2 0 011.69.9l.81 1.2a2 2 0 001.67.9H20a2 2 0 012 2v.5" />
        <path d="M13 13.9c0 2.8 2.2 5.1 5 5.1s5-2.3 5-5.1-2.2-5-5-5-5 2.2-5 5z" /><path d="M18 12v3h3" />
      </svg>
    );
  }
  if (type === 'logout') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    );
  }
  return null;
}

export default function AdminLayout({ role, pageTitle, activePage, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ fullname: role === 'admin' ? 'Admin' : 'Staff', username: '' });
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const nav = role === 'admin' ? adminNav : staffNav;
  const initial = (user.fullname || 'A').charAt(0).toUpperCase();

  const resolvedActivePage = activePage || (() => {
    const path = location.pathname;
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/products')) return 'products';
    if (path.startsWith('/admin/staff')) return 'staff';
    if (path.startsWith('/admin/orders')) return 'orders';
    if (path.startsWith('/staff/products')) return 'products';
    if (path.startsWith('/staff/orders')) return 'orders';
    if (path.startsWith('/staff')) return 'dashboard';
    const section = new URLSearchParams(location.search).get('section');
    if (section && section !== 'overview') return section;
    return 'dashboard';
  })();

  useEffect(() => {
    document.body.classList.add('admin-page');
    document.documentElement.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
      document.documentElement.classList.remove('admin-page');
    };
  }, []);

  useEffect(() => {
    checkAuth().then((data) => {
      if (data.authenticated && data.user) {
        setUser(data.user);
      }
    });
  }, []);

  const handleLogoutClick = () => {
    if (!loggingOut) setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    let successMessage = 'You have been logged out successfully.';
    let errorMessage = '';

    try {
      const res = await logout();
      if (res?.message) successMessage = res.message;
      if (!res?.success) errorMessage = res?.message || 'Logout failed. Please try again.';
    } catch {
      errorMessage = 'Could not reach the server. Your session was cleared on this device.';
    }

    clearAuthClientState();
    setShowLogoutConfirm(false);
    setLoggingOut(false);

    navigate('/login', {
      replace: true,
      state: errorMessage
        ? { logoutError: errorMessage }
        : { logoutMessage: successMessage },
    });
  };

  return (
    <div className="admin-shell">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div className="gradient-banner" />
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon logo-icon-creamy">
              <CreamyIcon size={22} />
            </div>
            <span className="logo-text">Jojo&apos;s</span>
          </div>
          <p className="nav-section-label">General</p>
          {nav.map((item) => (
            <Link
              key={item.key}
              className={`nav-item ${resolvedActivePage === item.key ? 'active' : ''}`}
              to={item.path}
            >
              <span className="nav-icon"><NavIcon type={item.icon} /></span>
              {item.label}
              {item.arrow ? <span className="arrow">›</span> : null}
            </Link>
          ))}
          <button
            type="button"
            className="nav-item nav-item-logout"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
          >
            <span className="nav-icon"><NavIcon type="logout" /></span>
            <span className="nav-item-logout-label">{loggingOut ? 'Logging out…' : 'Log out'}</span>
          </button>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{pageTitle}</div>
            <div className="search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0A0BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search …" />
            </div>
            <div className="topbar-actions">
              <NotificationPanel />
              <button className="icon-btn" type="button" aria-label="Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M12 2v1.5M12 20.5V22" />
                </svg>
              </button>
              <div className="avatar-area">
                <div className="avatar">{initial}</div>
                <div className="avatar-info">
                  <div className="name">{user.fullname || (role === 'admin' ? 'Admin' : 'Staff')}</div>
                  <div className="role">{role === 'admin' ? 'Administrator' : 'Staff Member'}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>

      <LogoutDialog
        open={showLogoutConfirm}
        loading={loggingOut}
        onCancel={() => !loggingOut && setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
