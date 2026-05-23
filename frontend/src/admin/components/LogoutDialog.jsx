export default function LogoutDialog({ open, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
      <div className="admin-modal">
        <div className="admin-modal-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h3 id="logout-dialog-title" className="admin-modal-title">Log out?</h3>
        <p className="admin-modal-text">
          Are you sure you want to end your session? You will need to sign in again to access the dashboard.
        </p>
        <div className="admin-modal-actions">
          <button type="button" className="btn-outline admin-modal-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-purple admin-modal-btn" onClick={onConfirm} disabled={loading}>
            {loading ? 'Logging out…' : 'Yes, log out'}
          </button>
        </div>
      </div>
    </div>
  );
}
