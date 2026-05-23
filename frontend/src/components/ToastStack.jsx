export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="status"
        >
          <span className="toast-icon" aria-hidden="true">
            {toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}
          </span>
          <p className="toast-message">{toast.message}</p>
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss message"
            onClick={() => onDismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
