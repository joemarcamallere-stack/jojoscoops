import { formatMoney, projectImage } from './checkoutUtils';

export { formatMoney, projectImage };

export const ORDER_STATUS_STEPS = [
  { key: 'pending', label: 'Pending', description: 'Order received and waiting for the first processing scan.' },
  { key: 'processing', label: 'Processing', description: 'Your order is being prepared by the store.' },
  { key: 'shipped', label: 'Shipped', description: 'The courier has picked up your package.' },
  { key: 'completed', label: 'Completed', description: 'The order has been successfully delivered.' },
];

export function orderStepClass(orderStatus, stepKey) {
  if (orderStatus === 'cancelled') {
    return stepKey === 'pending' ? 'is-cancelled' : 'is-upcoming';
  }
  const orderIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === orderStatus);
  const stepIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === stepKey);
  if (orderIndex < 0 || stepIndex < 0) return '';
  if (stepIndex < orderIndex) return 'is-complete';
  if (stepIndex === orderIndex) return 'is-current';
  return 'is-upcoming';
}

export function formatProductCount(count) {
  const n = Number(count) || 0;
  return `${n} product${n === 1 ? '' : 's'}`;
}

export async function copyText(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback */
  }
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', 'readonly');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(temp);
  return ok;
}
