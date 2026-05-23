export function normalizeStatus(status) {
  const s = (status || '').toLowerCase().trim();
  return s || 'pending';
}

export function normalizePayment(pm) {
  const s = (pm || '').toLowerCase().trim();
  return s || 'cash_on_delivery';
}

export function isPickup(order) {
  return normalizePayment(order.payment_method) === 'cash_on_pickup';
}

export function filterByPayment(orders, method) {
  const m = normalizePayment(method);
  return orders.filter((o) => normalizePayment(o.payment_method) === m);
}

export function filterByStatus(orders, statuses) {
  return orders.filter((o) => statuses.includes(normalizeStatus(o.status)));
}

export function formatMoney(n) {
  return `PHP ${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
