import { supabase } from './supabaseClient';
import { supabaseAdmin } from './supabaseAdminClient';
import { addToCart } from './cartApi';

export async function fetchOrders(highlight = null) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  let guestOrderIds = [];
  try {
    guestOrderIds = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    if (!Array.isArray(guestOrderIds)) guestOrderIds = [];
  } catch { guestOrderIds = []; }

  if (!userId && guestOrderIds.length === 0) {
    return {
      ok: true,
      orders: [],
      ongoing: [],
      history: [],
      summary: { total_spent: 0, total_orders: 0, last_order_date: '' },
      highlight_order_id: highlight,
      customer: { user_id: null, email: '', fullname: '' }
    };
  }

  // Fetch orders — combine user orders + guest orders
  let allOrders = [];

  if (userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('customer_user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching user orders:', error);
      return { ok: false, message: error.message };
    }
    allOrders = data || [];
  }

  if (guestOrderIds.length > 0) {
    const client = supabaseAdmin || supabase; // Fallback to normal client if admin client isn't available
    const { data, error } = await client
      .from('orders')
      .select('*, order_items(*, products(*))')
      .in('id', guestOrderIds)
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Merge, avoiding duplicates
      const existingIds = new Set(allOrders.map(o => o.id));
      for (const o of data) {
        if (!existingIds.has(o.id)) allOrders.push(o);
      }
    }
  }

  // Sort combined results by date descending
  allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const STATUS_LABELS = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const PAYMENT_LABELS = {
    cash_on_delivery: 'Cash on Delivery',
    cash_on_pickup: 'Cash on Pick Up',
  };

  const formatItem = (item) => ({
    product_id: item.product_id,
    id: item.product_id,
    name: item.products?.name,
    image: item.products?.image,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  });

  const orders = allOrders.map(o => {
    const items = (o.order_items || []).map(formatItem);
    const status = (o.status || 'pending').toLowerCase().trim();
    const isPickup = o.payment_method === 'cash_on_pickup';
    const quantityTotal = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      ...o,
      status, // Ensure status is lowercased and trimmed!
      date: new Date(o.created_at).toLocaleDateString(),
      items,
      status_label: STATUS_LABELS[status] || status,
      status_class: status,
      payment_method_label: PAYMENT_LABELS[o.payment_method] || o.payment_method,
      is_pickup: isPickup,
      quantity_total: quantityTotal,
      item_count: items.length,
    };
  });

  const ongoing = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status));
  const history = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  const totalSpent = history.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const latestStatus = orders.length > 0 ? (STATUS_LABELS[orders[0].status] || orders[0].status) : 'No orders yet';
  
  return {
    ok: true,
    orders,
    ongoing,
    history,
    summary: {
      total_spent: totalSpent,
      total_orders: orders.length,
      active_orders: ongoing.length,
      pending_orders: pendingOrders,
      history_orders: history.length,
      latest_status: latestStatus,
      last_order_date: orders.length > 0 ? orders[0].date : ''
    },
    highlight_order_id: highlight,
    customer: {
      user_id: userId || null,
      email: session?.user?.email || '',
    }
  };
}

export async function cancelOrder(orderId) {
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status, order_items(product_id, quantity)')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { ok: false, message: 'Order not found.' };
  }

  if (order.status !== 'pending') {
    return { ok: false, message: 'Only pending orders can be cancelled.' };
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  // Restore stock
  for (const item of order.order_items) {
    // using a direct select/update for simplicity, a transaction/rpc is safer
    const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
    if (p) {
      await supabase.from('products').update({ stock: p.stock + item.quantity }).eq('id', item.product_id);
    }
  }

  return { ok: true, message: 'Order has been successfully cancelled.', order_id: orderId };
}

export async function buyAgain(orderId) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('order_items(*, products(stock))')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { ok: false, message: 'Order not found.' };
  }

  let itemsAdded = 0;
  for (const item of order.order_items) {
    if (item.products?.stock >= item.quantity) {
      await addToCart({
        product_id: item.product_id,
        quantity: item.quantity,
      });
      itemsAdded++;
    }
  }

  if (itemsAdded === 0) {
    return { ok: false, message: 'None of the items from this order are currently available.' };
  }

  return {
    ok: true,
    message: `${itemsAdded} items added to your cart.`,
    redirect: '/cart#checkout',
  };
}
