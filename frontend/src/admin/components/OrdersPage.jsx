import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import OrderStatusControl from './OrderStatusControl';
import { fetchOrders } from '../../lib/adminApi';
import { filterByPayment, filterByStatus, formatMoney } from '../utils/orders';

function PurchaseSummary({ items }) {
  if (!items?.length) return <span style={{ color: '#666' }}>No stored items</span>;
  return (
    <div className="purchase-lines">
      {items.map((item, i) => (
        <div key={i}>{item.product_name} x {item.quantity}</div>
      ))}
    </div>
  );
}

function OrdersTableCard({ title, subtitle, orders, onUpdated }) {
  return (
    <div className="table-card orders-status-card" style={{ marginTop: 16 }}>
      <div className="section-heading cart-section-heading" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p className="section-kicker">{title}</p>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{subtitle}</h2>
        </div>
        <div className="status-lock-pill">{orders.length} order{orders.length === 1 ? '' : 's'}</div>
      </div>
      <div className="orders-table-scroll">
        {orders.length === 0 ? (
          <div className="notice">No {title.toLowerCase()} found.</div>
        ) : (
          <table className="orders-status-table orders-table-full">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Contact Number</th><th>Total</th>
                <th>Purchases</th><th>Status</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.contact_number || ''}</td>
                  <td>{Number(o.total).toFixed(2)}</td>
                  <td><PurchaseSummary items={o.items} /></td>
                  <td>{o.status}</td>
                  <td>{o.created_at}</td>
                  <td className="orders-action-cell">
                    <OrderStatusControl order={o} onUpdated={onUpdated} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage({ role }) {
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('pickup');
  const [message, setMessage] = useState('');
  const base = role === 'admin' ? '/admin' : '/staff';

  const load = useCallback(async () => {
    const data = await fetchOrders();
    if (data.success) setOrders(data.orders || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onUpdated = (msg, isError) => {
    setMessage(msg || '');
    if (!isError) load();
  };

  const pickup = filterByPayment(orders, 'cash_on_pickup');
  const delivery = filterByPayment(orders, 'cash_on_delivery');
  const pickupPending = filterByStatus(pickup, ['pending']);
  const pickupCompleted = filterByStatus(pickup, ['completed', 'cancelled']);
  const deliveryPending = filterByStatus(delivery, ['pending']);
  const deliveryProcessing = filterByStatus(delivery, ['processing']);
  const deliveryShipped = filterByStatus(delivery, ['shipped']);
  const deliveryCompleted = filterByStatus(delivery, ['completed', 'cancelled']);

  return (
    <AdminLayout role={role} pageTitle="Manage Purchases" activePage="orders">
      <div className="center-panel orders-page-panel">
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Order Management</span></div>
              <div className="inv-brand-email">Track orders by status and review customer purchases</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Orders</div>
              <div className="inv-number">{orders.length}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Pickup:</span><span className="val">pending, completed</span></div>
              <div className="row"><span className="label">Delivery:</span><span className="val">pending, processing, shipped, completed</span></div>
              <div className="row"><span className="label">View:</span><span className="val">{view.charAt(0).toUpperCase() + view.slice(1)}</span></div>
            </div>
            {role === 'admin' ? (
              <Link className="btn-purple" to={`${base}?section=orders`} style={{ width: 'auto', padding: '10px 16px' }}>Dashboard</Link>
            ) : (
              <Link className="btn-purple" to={base} style={{ width: 'auto', padding: '10px 16px' }}>Dashboard</Link>
            )}
          </div>
        </div>

        {message ? <div className="notice">{message}</div> : null}

        <div className="orders-view-tabs">
          <button type="button" className={`orders-view-tab ${view === 'pickup' ? 'active' : ''}`} onClick={() => setView('pickup')}>Pickup</button>
          <button type="button" className={`orders-view-tab ${view === 'delivery' ? 'active' : ''}`} onClick={() => setView('delivery')}>Delivery</button>
        </div>

        {view === 'pickup' ? (
          <>
            <div className="section-heading cart-section-heading" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p className="section-kicker">Pickup Orders</p>
                <h2 style={{ margin: 0, fontSize: 16 }}>Cash on pick up</h2>
              </div>
              <div className="status-lock-pill">{pickup.length} orders</div>
            </div>
            <OrdersTableCard title="Pending Pickup" subtitle="Waiting for collection" orders={pickupPending} onUpdated={onUpdated} />
            <OrdersTableCard title="Completed Pickup" subtitle="Collected and archived" orders={pickupCompleted} onUpdated={onUpdated} />
          </>
        ) : (
          <>
            <div className="section-heading cart-section-heading" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p className="section-kicker">Delivery Orders</p>
                <h2 style={{ margin: 0, fontSize: 16 }}>Cash on delivery</h2>
              </div>
              <div className="status-lock-pill">{delivery.length} orders</div>
            </div>
            <OrdersTableCard title="Pending Delivery" subtitle="Queued for preparation" orders={deliveryPending} onUpdated={onUpdated} />
            <OrdersTableCard title="Processing Delivery" subtitle="Being prepared" orders={deliveryProcessing} onUpdated={onUpdated} />
            <OrdersTableCard title="Shipped Delivery" subtitle="On the way" orders={deliveryShipped} onUpdated={onUpdated} />
            <OrdersTableCard title="Completed Delivery" subtitle="Finished and cancelled orders" orders={deliveryCompleted} onUpdated={onUpdated} />
          </>
        )}

        <div className="rcard order-status-card" style={{ marginTop: 16 }}>
          <div className="rcard-header">
            <span className="rcard-title">Order Status</span>
            <button type="button" className="more-btn">⋯</button>
          </div>
          <div className="page-summary" style={{ marginBottom: 14 }}>
            <div className="count">{orders.length}</div>
            <div className="label">orders in the queue</div>
          </div>
          <div className="action-links">
            <button type="button" className="action-link" onClick={() => setView('pickup')}>Pickup</button>
            <button type="button" className="action-link" onClick={() => setView('delivery')}>Delivery</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
