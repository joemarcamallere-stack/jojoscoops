import { useState } from 'react';
import { updateOrderStatus } from '../../lib/adminApi';

export default function OrderStatusControl({ order, onUpdated }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const current = (order.status || 'pending').toLowerCase();
  const options = order.status_options || [];

  if (!options.length) {
    return <div className="status-lock-pill">{current.charAt(0).toUpperCase() + current.slice(1)}</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;
    setLoading(true);
    try {
      const res = await updateOrderStatus(order.id, status);
      if (res.success) {
        onUpdated?.(res.message);
      } else {
        onUpdated?.(res.message, true);
      }
    } catch {
      onUpdated?.('Unable to update order status.', true);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <form className="status-combo-form" onSubmit={handleSubmit}>
      <select
        className="status-combo-select"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Update order status"
      >
        <option value="" disabled>
          {current.charAt(0).toUpperCase() + current.slice(1)}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button type="submit" className="status-combo-btn" disabled={loading || !status}>
        {loading ? '…' : 'Update'}
      </button>
    </form>
  );
}
