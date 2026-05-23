import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { copyText } from '../lib/ordersUtils';
import { fetchTracking } from '../lib/trackingApi';
import { useToast } from '../context/ToastContext';
import '../styles/tracking.css';

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Pending', description: 'Order received and waiting for processing.' },
  { key: 'processing', label: 'Processing', description: 'The order is being prepared by the store.' },
  { key: 'shipped', label: 'Shipped', description: 'Your package has been picked up for delivery.' },
  { key: 'completed', label: 'Completed', description: 'The order has been delivered successfully.' },
];

function timelineClass(status, stepKey, index) {
  if (status === 'cancelled') {
    return index === 0 ? 'is-cancelled' : 'is-upcoming';
  }
  const currentIndex = Math.max(TIMELINE_STEPS.findIndex((s) => s.key === status), 0);
  if (index < currentIndex) return 'is-complete';
  if (index === currentIndex) return 'is-current';
  return 'is-upcoming';
}

export default function Tracking() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('tracking_id') || '');
  const [feedback, setFeedback] = useState('Search results appear below once the code is found.');
  const [feedbackError, setFeedbackError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const loadTracking = async (rawId) => {
    const normalized = String(rawId || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized) {
      const msg = 'Enter a tracking ID first.';
      setFeedback(msg, true);
      showToast(msg, 'error');
      setShowResult(false);
      setResult(null);
      return;
    }

    setLoading(true);
    setFeedback('Searching for the order status...', false);
    setShowResult(true);

    try {
      const data = await fetchTracking(normalized);
      if (!data.ok) {
        setResult(null);
        const msg = data.message || 'No order was found for that tracking ID.';
        setFeedback(msg, true);
        showToast(msg, 'error');
        return;
      }
      setResult(data.order);
      const foundMsg = 'Order found. See the latest status below.';
      setFeedback(foundMsg, false);
      showToast(foundMsg, 'success');
      setSearchParams({ tracking_id: normalized }, { replace: true });
    } catch {
      setResult(null);
      const msg = 'Unable to load tracking details right now.';
      setFeedback(msg, true);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fromUrl = searchParams.get('tracking_id');
    if (fromUrl) {
      setTrackingId(fromUrl);
      loadTracking(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFeedbackMsg = (msg, isError = false) => {
    setFeedback(msg);
    setFeedbackError(isError);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadTracking(trackingId);
  };

  const handleCopy = async () => {
    if (!result?.tracking_id) return;
    const ok = await copyText(result.tracking_id);
    const msg = ok ? 'Tracking ID copied to clipboard.' : 'Unable to copy the tracking ID right now.';
    setFeedbackMsg(msg, !ok);
    showToast(msg, ok ? 'success' : 'error');
  };

  const status = result?.status || 'pending';

  return (
    <main className="tracking-page" id="top">
      <div className="tracking-shell">
        <section className="tracking-hero">
          <div className="tracking-card">
            <span className="section-kicker">Shopee-style tracking</span>
            <h1>Track your order.</h1>
            <p>
              Paste the tracking ID from your order card to check the latest status right away. The code is
              unique to each order, so you can copy it from your orders page and search it here anytime.
            </p>
            <form className="tracking-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="tracking-input-row">
                <input
                  type="text"
                  name="tracking_id"
                  placeholder="Enter tracking ID like TRK-8F2A..."
                  maxLength={64}
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  aria-label="Tracking ID"
                />
                <button type="submit" className="btn-shop" disabled={loading}>
                  {loading ? 'Searching…' : 'Search status'}
                </button>
              </div>
              <div className="tracking-support">
                <span className="support-pill">Copy from My Orders</span>
                <span className={feedbackError ? 'tracking-feedback-error' : ''} id="tracking-feedback">
                  {feedback}
                </span>
              </div>
            </form>
          </div>

          <aside className="tracking-guide">
            <div>
              <span className="section-kicker">How it works</span>
              <h2>Fast, clear, and easy to check.</h2>
            </div>
            <div className="tracking-step-list">
              <div className="tracking-step">
                <strong>1. Copy the code</strong>
                <span>Open your order card, copy the tracking ID, and paste it here.</span>
              </div>
              <div className="tracking-step">
                <strong>2. Search the status</strong>
                <span>The page checks the current order state from the database.</span>
              </div>
              <div className="tracking-step">
                <strong>3. Follow the timeline</strong>
                <span>See whether the order is pending, processing, shipped, or completed.</span>
              </div>
            </div>
          </aside>
        </section>

        {!showResult ? (
          <section className="tracking-empty">Search a tracking ID to see the current status.</section>
        ) : null}

        {showResult ? (
          <section className="tracking-result" aria-live="polite">
            {result ? (
              <>
                <div className="tracking-result-header">
                  <div>
                    <span className="section-kicker">Latest update</span>
                    <h2>Order #{result.order_id}</h2>
                    <p style={{ color: '#666', lineHeight: 1.55, marginTop: 8 }}>
                      {result.status_message}
                    </p>
                  </div>
                  <span className={`tracking-status-badge ${status}`}>
                    {result.status_label || status}
                  </span>
                </div>

                <div className="tracking-meta-grid">
                  <div className="tracking-meta-card">
                    <span className="label">Tracking ID</span>
                    <div className="tracking-code-row">
                      <strong className="tracking-code">{result.tracking_id}</strong>
                      <button type="button" className="tracking-copy-btn" onClick={handleCopy}>
                        Copy
                      </button>
                      <Link className="tracking-link-btn" to="/orders">
                        My Orders
                      </Link>
                    </div>
                  </div>
                  <div className="tracking-meta-card">
                    <span className="label">Order number</span>
                    <strong>{result.order_id}</strong>
                    <p>The tracking code points to this order record.</p>
                  </div>
                  <div className="tracking-meta-card">
                    <span className="label">Placed on</span>
                    <strong>{result.created_at || '—'}</strong>
                    <p>When the order was first saved.</p>
                  </div>
                  <div className="tracking-meta-card">
                    <span className="label">Status note</span>
                    <strong>{result.status_message}</strong>
                    <p>Use the timeline below to see the progress stage.</p>
                  </div>
                </div>

                <div className="tracking-timeline">
                  {TIMELINE_STEPS.map((step, index) => (
                    <div
                      key={step.key}
                      className={`timeline-step ${timelineClass(status, step.key, index)}`}
                    >
                      <strong>{step.label}</strong>
                      <span>{step.description}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="tracking-empty tracking-error">{feedback}</div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
