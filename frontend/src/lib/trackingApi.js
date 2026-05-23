import { supabase } from './supabaseClient';

export async function fetchTracking(trackingId) {
  const normalized = String(trackingId || '').trim().toUpperCase().replace(/\s+/g, '');
  
  if (!normalized) {
    return { ok: false, message: 'Please enter a tracking ID.' };
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('tracking_id', normalized)
    .single();

  if (error || !order) {
    return { ok: false, message: 'Tracking ID not found.' };
  }

  function tracking_status_label(status) {
    switch (status) {
        case 'pending': return 'Pending';
        case 'processing': return 'Processing';
        case 'shipped': return 'Shipped';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  function tracking_status_message(status) {
      switch (status) {
          case 'pending': return 'Your order has been received and is waiting for the first processing scan.';
          case 'processing': return 'Your order is being prepared by the store.';
          case 'shipped': return 'Your order is already on the way with the courier.';
          case 'completed': return 'Your order has been delivered successfully.';
          case 'cancelled': return 'This order was cancelled before completion.';
          default: return 'We found your order, but the current status could not be categorized.';
      }
  }

  const items = (order.order_items || []).map(item => ({
    name: item.products?.name,
    image: item.products?.image,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  const status = (order.status || 'pending').toLowerCase().trim();

  return {
    ok: true,
    order: {
      ...order,
      order_id: order.id,
      status: status,
      status_label: tracking_status_label(status),
      status_message: tracking_status_message(status),
      created_at: new Date(order.created_at).toLocaleDateString(),
      items
    }
  };
}
