import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ORDER_STATUS_STEPS,
  copyText,
  formatMoney,
  formatProductCount,
  orderStepClass,
  projectImage,
} from '../lib/ordersUtils';

export default function OrderCard({
  order,
  section,
  highlighted = false,
  expanded = false,
  onToggle,
  onCancel,
  onBuyAgain,
  busy = false,
}) {
  const [copyMsg, setCopyMsg] = useState('');
  const status = order.status || 'pending';
  const previewItems = (order.items || []).slice(0, 2);
  const remaining = Math.max(0, (order.item_count || 0) - previewItems.length);
  const canCancel = section === 'ongoing' && ['pending', 'processing'].includes(status);
  const canBuyAgain = section === 'history';

  const handleCopy = async (e) => {
    e.stopPropagation();
    const ok = await copyText(order.tracking_id);
    setCopyMsg(ok ? 'Copied!' : 'Copy failed');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const stop = (e) => e.stopPropagation();

  return (
    <article
      className={`order-card ${highlighted ? 'highlighted' : ''} ${expanded ? 'is-expanded' : ''}`}
      data-order-card
      data-order-id={order.id}
      onClick={() => onToggle(order.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(order.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="order-card-preview">
        <div className="order-card-header">
          <div>
            <p className="section-kicker">Order #{order.id}</p>
            <h3 className="order-title">{order.customer_name || 'Customer'}</h3>
            <p className="order-subtitle">
              Placed on {order.created_at} · {order.quantity_total} item
              {order.quantity_total === 1 ? '' : 's'} · {formatMoney(order.total)}
            </p>
          </div>
          <span className={`order-status-badge ${order.status_class || status}`}>
            {order.status_label || status}
          </span>
        </div>

        <div className="order-preview-products">
          {previewItems.map((item) => (
            <div key={item.product_id} className="preview-product-pill">
              <img src={projectImage(item.image)} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <span>x{item.quantity}</span>
              </div>
            </div>
          ))}
          {remaining > 0 ? <div className="preview-more-pill">+{remaining} more</div> : null}
        </div>

        <div className="order-preview-meta">
          <span><strong>Status:</strong> {order.status_label}</span>
          {!order.is_pickup ? (
            <span><strong>Tracking:</strong> {order.tracking_id || 'Pending'}</span>
          ) : null}
          <span><strong>Items:</strong> {formatProductCount(order.item_count)}</span>
        </div>

        {!expanded && (
          <div className="order-preview-actions" onClick={stop}>
            <span className="order-preview-hint">Tap anywhere to view full order</span>
            {canCancel ? (
              <button
                type="button"
                className="order-action-btn cancel"
                disabled={busy}
                onClick={(e) => {
                  stop(e);
                  onCancel(order.id);
                }}
              >
                Cancel Order
              </button>
            ) : null}
            {canBuyAgain ? (
              <button
                type="button"
                className="order-action-btn buy-again"
                disabled={busy}
                onClick={(e) => {
                  stop(e);
                  onBuyAgain(order.id);
                }}
              >
                Buy Again
              </button>
            ) : null}
          </div>
        )}
      </div>

      {expanded ? (
        <div className="order-card-expanded" data-order-expanded>
          {section === 'ongoing' && !order.is_pickup ? (
            <div className="status-tracker" data-order-tracker>
              {ORDER_STATUS_STEPS.map((step) => (
                <div
                  key={step.key}
                  className={`status-step ${orderStepClass(status, step.key)}`}
                  data-order-step={step.key}
                >
                  <strong>{step.label}</strong>
                  <span>{step.description}</span>
                </div>
              ))}
            </div>
          ) : null}

          {section === 'ongoing' && order.is_pickup ? (
            <div className="detail-card">
              <span className="label">Pickup order</span>
              <strong>Ready for branch collection</strong>
              <p>Pickup orders do not use delivery tracking steps or tracking IDs.</p>
            </div>
          ) : null}

          <div className="order-details-grid">
            <div className="detail-card">
              <span className="label">Contact number</span>
              <strong>{order.customer_name}</strong>
              <p>{order.contact_number || 'No contact number recorded'}</p>
            </div>
            <div className="detail-card">
              <span className="label">Payment</span>
              <strong>{order.payment_method_label}</strong>
              <p>
                Shipping fee: {formatMoney(order.shipping_fee)} · Total: {formatMoney(order.total)}
              </p>
            </div>
            <div className="detail-card">
              <span className="label">{order.is_pickup ? 'Pickup information' : 'Delivery information'}</span>
              <strong>
                {order.shipping_address
                  || (order.is_pickup ? 'No pickup branch recorded' : 'No delivery address recorded')}
              </strong>
              <p>
                {order.is_pickup
                  ? 'Pickup orders use the branch location instead of delivery coordinates.'
                  : order.shipping_latitude && order.shipping_longitude
                    ? `Location: ${order.shipping_latitude}, ${order.shipping_longitude}`
                    : 'Location details not available'}
              </p>
            </div>
            <div className="detail-card">
              <span className="label">Order status</span>
              <strong>{order.status_label}</strong>
              <p>
                {section === 'ongoing'
                  ? 'Updates refresh automatically every few seconds.'
                  : status === 'cancelled'
                    ? 'Cancelled orders stay in history for easy reference.'
                    : 'Completed orders stay in history for easy reference.'}
              </p>
            </div>
            {!order.is_pickup ? (
              <div className="detail-card tracking-detail-card">
                <span className="label">Tracking ID</span>
                {order.tracking_id ? (
                  <>
                    <div className="tracking-row">
                      <strong className="tracking-code">{order.tracking_id}</strong>
                      <div className="tracking-actions" onClick={stop}>
                        <button type="button" className="tracking-copy-btn" onClick={handleCopy}>
                          {copyMsg || 'Copy'}
                        </button>
                        <Link
                          className="tracking-open-btn"
                          to={`/tracking?tracking_id=${encodeURIComponent(order.tracking_id)}`}
                          onClick={stop}
                        >
                          Track
                        </Link>
                      </div>
                    </div>
                    <p>Use this code on the tracking page to check the current order status.</p>
                  </>
                ) : (
                  <>
                    <strong>Tracking code pending</strong>
                    <p>This order does not have a tracking code yet.</p>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <div className="order-items-list">
            {(order.items || []).map((item) => (
              <div key={`${order.id}-${item.product_id}`} className="order-item-row">
                <img src={projectImage(item.image)} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>
                    Quantity: {item.quantity} · Unit price: {formatMoney(item.price)}
                  </p>
                </div>
                <div className="order-item-price">{formatMoney(item.subtotal)}</div>
              </div>
            ))}
          </div>

          <div className="order-actions" onClick={stop}>
            {canCancel ? (
              <button
                type="button"
                className="order-action-btn cancel"
                disabled={busy}
                onClick={() => onCancel(order.id)}
              >
                Cancel Order
              </button>
            ) : null}
            {canBuyAgain ? (
              <button
                type="button"
                className="order-action-btn buy-again"
                disabled={busy}
                onClick={() => onBuyAgain(order.id)}
              >
                Buy Again
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
