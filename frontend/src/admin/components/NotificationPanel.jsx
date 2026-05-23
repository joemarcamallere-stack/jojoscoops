import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNotifications, notificationAction } from '../../lib/adminApi';

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState({ items: [], has_unread: false });
  const [openItemId, setOpenItemId] = useState(null);
  const wrapperRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications(20);
      if (data.items) setPayload(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setOpenItemId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setOpenItemId(null);
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const runAction = async (notification_action, notification_id = 0) => {
    await notificationAction({ notification_action, notification_id });
    setOpenItemId(null);
    await load();
  };

  return (
    <div className={`notification-wrapper ${open ? 'open' : ''}`} ref={wrapperRef}>
      <button
        type="button"
        className="icon-btn notification-btn"
        aria-label="Notifications"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {payload.has_unread ? <span className="notification-dot" /> : null}
      </button>
      <div className="notification-panel">
        <div className="notification-panel-header">
          <span>Notifications</span>
          <div className="notification-header-actions">
            {payload.items?.length > 0 ? (
              <button type="button" className="notification-icon-btn notification-delete-all" aria-label="Delete all" onClick={() => runAction('delete_all')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                </svg>
              </button>
            ) : null}
            {payload.has_unread ? (
              <button type="button" className="notification-form" style={{ border: 'none', background: 'transparent', color: 'var(--purple)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={() => runAction('mark_read')}>
                Mark all as read
              </button>
            ) : null}
            {/* Close button — visible only on mobile */}
            <button
              type="button"
              className="notification-close-btn"
              aria-label="Close notifications"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="notification-list">
          {payload.items?.length ? payload.items.map((item) => (
            <div key={item.id} className={`notification-item ${!item.is_read ? 'is-unread' : ''} ${openItemId === item.id ? 'open' : ''}`}>
              <div className="notification-item-actions">
                <button
                  type="button"
                  className="notification-item-menu-btn"
                  aria-label="Notification options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenItemId((id) => (id === item.id ? null : item.id));
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                <div className="notification-item-menu">
                  <button type="button" className="notification-menu-form" style={{ width: '100%', border: 'none', background: 'none', padding: '8px 10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => runAction('mark_read', item.id)}>Mark as read</button>
                  <button type="button" className="notification-menu-form" style={{ width: '100%', border: 'none', background: 'none', padding: '8px 10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => runAction('delete', item.id)}>Delete</button>
                </div>
              </div>
              <div className="notification-item-head">
                <span className={`notification-badge ${item.event_type === 'cancelled' ? 'cancelled' : ''}`}>{item.event_label}</span>
                <span className="notification-time">{item.created_at}</span>
              </div>
              <p>{item.message}</p>
            </div>
          )) : (
            <div className="notification-empty">No notifications yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
