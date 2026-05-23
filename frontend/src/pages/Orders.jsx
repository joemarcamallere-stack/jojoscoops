import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OrderCard from '../components/OrderCard';
import { fetchCartCount } from '../lib/cartApi';
import { buyAgain, cancelOrder, fetchOrders } from '../lib/ordersApi';
import { useToast } from '../context/ToastContext';
import { showApiToast } from '../lib/toastHelpers';
import '../styles/orders.css';

function EmptyOrders({ section }) {
  if (section === 'ongoing') {
    return (
      <div className="empty-orders">
        <h2>No ongoing orders</h2>
        <p>Active purchases will appear here while they are pending, processing, or shipped.</p>
        <Link className="btn-shop" to="/products">Start shopping</Link>
      </div>
    );
  }
  return (
    <div className="empty-orders">
      <h2>No history yet</h2>
      <p>Finished orders will appear here after delivery or if an order is cancelled.</p>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const highlightParam = searchParams.get('highlight');

  const [loading, setLoading] = useState(true);
  const [ongoing, setOngoing] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    total_orders: 0,
    active_orders: 0,
    pending_orders: 0,
    history_orders: 0,
    latest_status: 'No orders yet',
  });
  const [highlightId, setHighlightId] = useState(0);
  const [expanded, setExpanded] = useState(new Set());
  const { showToast } = useToast();
  const [syncLabel, setSyncLabel] = useState('just now');
  const [acting, setActing] = useState(false);
  const [refreshSeconds, setRefreshSeconds] = useState(10);
  const refreshRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const highlight = highlightParam ? Number(highlightParam) : null;
      const data = await fetchOrders(highlight);
      if (!data.ok) {
        showToast(data.message || 'Unable to load orders.', 'error');
        return;
      }
      setOngoing(data.ongoing || []);
      setHistory(data.history || []);
      setSummary(data.summary || {});
      setHighlightId(Number(data.highlight_order_id || 0));
      setRefreshSeconds(Number(data.refresh_seconds || 10));
      setSyncLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (
        highlight
        && (data.ongoing?.some((o) => o.id === highlight) || data.history?.some((o) => o.id === highlight))
      ) {
        setExpanded((prev) => new Set([...prev, String(highlight)]));
      }
    } catch (err) {
      console.error(err);
      showToast('Could not load orders. Please try again later.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [highlightParam, showToast]);

  useEffect(() => {
    document.body.classList.add('page-shell', 'orders-page');
    return () => document.body.classList.remove('page-shell', 'orders-page');
  }, []);

  useEffect(() => {
    if (location.state?.orderMessage) {
      showToast(location.state.orderMessage, 'success', 6000);
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location, navigate, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (refreshRef.current) clearInterval(refreshRef.current);
    const ms = Math.max(5, refreshSeconds) * 1000;
    refreshRef.current = setInterval(() => load(true), ms);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [load, refreshSeconds]);

  const toggleExpand = (id) => {
    const key = String(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? The product stock will be restored.')) return;
    setActing(true);
    try {
      const res = await cancelOrder(orderId);
      showApiToast(showToast, { ...res, success: res.ok }, {
        success: 'Order cancelled.',
        error: 'Unable to cancel order.',
      });
      if (res.ok) await load(true);
    } catch {
      showToast('Could not cancel order.', 'error');
    } finally {
      setActing(false);
    }
  };

  const handleBuyAgain = async (orderId) => {
    setActing(true);
    try {
      const res = await buyAgain(orderId);
      if (res.ok) {
        showApiToast(showToast, { ...res, success: true }, {
          success: 'Items added to your cart.',
          error: 'Could not add items to cart.',
        });
        if (res.cart_count != null) {
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: res.cart_count } }));
        } else {
          fetchCartCount()
            .then((d) => window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: d.total_items } })))
            .catch(() => {});
        }
        navigate(res.redirect || '/cart#checkout');
      } else {
        showApiToast(showToast, { ...res, success: false }, { error: 'Could not add items to cart.' });
      }
    } catch {
      showToast('Could not add items to cart.', 'error');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <main className="orders-page" id="top">
        <div style={{ padding: 48, textAlign: 'center' }}>Loading orders…</div>
      </main>
    );
  }

  return (
    <main className="orders-page" id="top">
      <section className="orders-hero">
        <div className="orders-hero-copy">
          <p className="section-kicker">Shopee-style order center</p>
          <h1>My Orders</h1>
          <p>
            Track each purchase, review the product and quantity, confirm your delivery and payment
            details, and watch the latest status update as it changes.
          </p>
          <div className="orders-hero-actions">
            <Link className="btn-shop" to="/products">Shop Again</Link>
            <Link className="btn-shop orders-secondary-btn" to="/cart">Back to Cart</Link>
            <Link className="btn-shop tracking-hero-btn" to="/tracking">Track by Code</Link>
          </div>
        </div>
        <div className="orders-hero-summary">
          <div className="orders-metric">
            <span>Total Orders</span>
            <strong>{summary.total_orders}</strong>
          </div>
          <div className="orders-metric">
            <span>Active Orders</span>
            <strong>{summary.active_orders}</strong>
          </div>
          <div className="orders-metric">
            <span>History Orders</span>
            <strong>{summary.history_orders}</strong>
          </div>
        </div>
      </section>

      <section className="orders-layout">
        <div className="orders-card">
          <div className="section-heading cart-section-heading">
            <div>
              <p className="section-kicker">Ongoing Purchases</p>
              <h2>Orders in progress</h2>
            </div>
            <div className="section-actions">
              <Link className="section-link" to="/products">Browse products</Link>
            </div>
          </div>
          {ongoing.length === 0 ? (
            <EmptyOrders section="ongoing" />
          ) : (
            <div className="orders-list">
              {ongoing.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  section="ongoing"
                  highlighted={highlightId === order.id}
                  expanded={expanded.has(String(order.id))}
                  onToggle={toggleExpand}
                  onCancel={handleCancel}
                  onBuyAgain={handleBuyAgain}
                  busy={acting}
                />
              ))}
            </div>
          )}

          <div className="section-heading cart-section-heading" style={{ marginTop: 28 }}>
            <div>
              <p className="section-kicker">Purchase History</p>
              <h2>Completed and cancelled orders</h2>
            </div>
          </div>
          {history.length === 0 ? (
            <EmptyOrders section="history" />
          ) : (
            <div className="orders-list">
              {history.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  section="history"
                  highlighted={highlightId === order.id}
                  expanded={expanded.has(String(order.id))}
                  onToggle={toggleExpand}
                  onCancel={handleCancel}
                  onBuyAgain={handleBuyAgain}
                  busy={acting}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="orders-sidebar">
          <div className="orders-sidebar-card">
            <p className="section-kicker">Delivery</p>
            <h2 className="sidebar-title">Real-time status</h2>
            <div className="mini-summary">
              <div className="mini-summary-row">
                <span>Pending orders</span>
                <strong>{summary.pending_orders}</strong>
              </div>
              <div className="mini-summary-row">
                <span>Latest status</span>
                <strong>{summary.latest_status}</strong>
              </div>
              <div className="mini-summary-row">
                <span>Refresh interval</span>
                <strong>{refreshSeconds}s</strong>
              </div>
            </div>
            <div className="sync-pill">Last sync: {syncLabel}</div>
          </div>
          <div className="orders-sidebar-card">
            <p className="section-kicker">Workflow</p>
            <div className="mini-summary">
              <div className="mini-summary-row"><span>1. Order placed</span><strong>Pending</strong></div>
              <div className="mini-summary-row"><span>2. Packed & verified</span><strong>Processing</strong></div>
              <div className="mini-summary-row"><span>3. In transit</span><strong>Shipped</strong></div>
              <div className="mini-summary-row"><span>4. Delivered</span><strong>Completed</strong></div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
