import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchStats } from '../../lib/adminApi';
import { formatMoney } from '../utils/orders';

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then((data) => {
      if (data.success) setStats(data);
    });
  }, []);

  if (!stats) {
    return (
      <AdminLayout role="staff" pageTitle="Staff Dashboard" activePage="dashboard">
        <div className="center-panel">Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="staff" pageTitle="Staff Dashboard" activePage="dashboard">
      <div className="center-panel">
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Staff Dashboard</span></div>
              <div className="inv-brand-email">Quick view for staff — manage orders and track completed sales</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Sales</div>
              <div className="inv-number">{formatMoney(stats.completed_sales_total)}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Assigned:</span><span className="val">All orders</span></div>
              <div className="row"><span className="label">Actions:</span><span className="val">Update status, Ship, Complete</span></div>
              <div className="row"><span className="label">Completed:</span><span className="val">{stats.completed_purchases_count} purchases</span></div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link className="btn-purple" to="/staff/orders" style={{ width: 'auto', padding: '10px 16px' }}>Go to Purchases</Link>
              <Link className="btn-outline" to="/staff/products" style={{ width: 'auto', padding: '10px 16px' }}>View Products</Link>
            </div>
          </div>
        </div>

        <div className="table-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 6 }}>Sales total</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)' }}>{formatMoney(stats.completed_sales_total)}</div></div>
            <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 6 }}>Completed purchases</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)' }}>{stats.completed_purchases_count}</div></div>
            <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 6 }}>Queued orders</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)' }}>{stats.orders_count}</div></div>
            <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 6 }}>Pickup orders</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)' }}>{stats.pickup_orders_count}</div></div>
            <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 6 }}>Delivery orders</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)' }}>{stats.delivery_orders_count}</div></div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn-outline" to="/staff/orders">Pickup Orders</Link>
            <Link className="btn-outline" to="/staff/orders">Delivery Orders</Link>
            <Link className="btn-outline" to="/staff/products">View Products</Link>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="rcard">
          <div className="rcard-header"><span className="rcard-title">Need Help?</span><button type="button" className="more-btn">⋯</button></div>
          <div className="page-summary" style={{ marginBottom: 14 }}>
            <div className="count">{formatMoney(stats.completed_sales_total)}</div>
            <div className="label">sales from completed purchases</div>
          </div>
          <div className="action-links">
            <Link className="action-link" to="/staff/orders">Pickup Orders</Link>
            <Link className="action-link" to="/staff/orders">Delivery Orders</Link>
            <Link className="action-link" to="/staff/products">View Products</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
