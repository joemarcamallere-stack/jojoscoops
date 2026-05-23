import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ToastStack from '../components/ToastStack';
import '../styles/toast.css';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4500) => {
    const text = String(message || '').trim();
    if (!text) return;

    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message: text, type }]);

    if (duration > 0) {
      window.setTimeout(() => dismissToast(id), duration);
    }
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
