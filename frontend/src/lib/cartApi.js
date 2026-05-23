import { supabase } from './supabaseClient';

// Constants to match PHP backend
const STANDARD_SHIPPING_FEE = 45.00;
const DELIVERY_SERVICE_AREAS = ['Loon, Bohol', 'Calape, Bohol', 'Tubigon, Bohol'];
const PICKUP_BRANCHES = [
  { value: 'Barangay Poblacion, Loon, Bohol', label: 'Loon Branch' },
  { value: 'Barangay Poblacion, Calape, Bohol', label: 'Calape Branch' },
  { value: 'Barangay Poblacion, Tubigon, Bohol', label: 'Tubigon Branch' },
];

function getCartToken() {
  let token = localStorage.getItem('creamy_cart_token');
  if (!token) {
    token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('creamy_cart_token', token);
  }
  return token;
}

export async function fetchCartConfig() {
  return {
    success: true,
    standard_shipping_fee: STANDARD_SHIPPING_FEE,
    delivery_service_areas: DELIVERY_SERVICE_AREAS,
    pickup_branches: PICKUP_BRANCHES,
    payment_methods: [
      { value: 'cash_on_delivery', label: 'Cash on Delivery' },
      { value: 'cash_on_pickup', label: 'Cash on Pick Up' },
    ],
  };
}

export async function fetchCartCount() {
  const token = getCartToken();
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('cart_token', token);

  if (error) {
    return { count: 0 };
  }
  
  const count = data.reduce((sum, item) => sum + item.quantity, 0);
  return { count };
}

export async function fetchCart(buyId = null) {
  const token = getCartToken();
  
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('cart_token', token);

  if (error) {
    console.error('Error fetching cart:', error);
    return { success: false, cart: null };
  }

  let total = 0;
  let selectedTotal = 0;
  let selectedCount = 0;
  let totalItems = 0;

  const items = cartItems.map(item => {
    const product = item.products;
    const qty = item.quantity;
    const subtotal = qty * product.price;
    const selected = buyId ? (product.id === Number(buyId)) : true;
    
    total += subtotal;
    totalItems += qty;
    if (selected) {
      selectedTotal += subtotal;
      selectedCount += qty;
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image,
      size: item.size || product.size,
      quantity: qty,
      subtotal,
      available_stock: product.stock,
      selected
    };
  });

  const { data: { session } } = await supabase.auth.getSession();
  let profile = {
    name: '',
    contact_number: '',
    address: '',
    delivery_address: '',
    pickup_branch: '',
    latitude: '',
    longitude: '',
    payment_method: 'cash_on_delivery',
  };

  if (session?.user) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userProfile) {
      profile.name = userProfile.fullname || '';
      profile.contact_number = userProfile.contact_number || '';
      profile.address = userProfile.shipping_address || '';
      profile.delivery_address = userProfile.shipping_address || '';
      profile.latitude = userProfile.shipping_latitude || '';
      profile.longitude = userProfile.shipping_longitude || '';
    }
  }

  return {
    success: true,
    cart: {
      items,
      total,
      selected_total: selectedTotal,
      selected_count: selectedCount,
      shipping_fee: STANDARD_SHIPPING_FEE,
      grand_total: selectedTotal + (items.length > 0 ? STANDARD_SHIPPING_FEE : 0),
      profile,
      total_items: totalItems,
    },
    config: {
      standard_shipping_fee: STANDARD_SHIPPING_FEE,
      delivery_service_areas: DELIVERY_SERVICE_AREAS,
      pickup_branches: PICKUP_BRANCHES,
    }
  };
}

export async function addToCart(payload) {
  const token = getCartToken();
  const { product_id, quantity = 1, size = '' } = payload;

  // Check existing item
  const { data: existing } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('cart_token', token)
    .eq('product_id', product_id)
    .single();

  const newQty = existing ? existing.quantity + quantity : quantity;

  const { error } = await supabase
    .from('cart_items')
    .upsert({
      cart_token: token,
      product_id,
      quantity: newQty,
      size,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Added to cart.' };
}

export async function updateCartItem(payload) {
  const token = getCartToken();
  const { product_id, quantity, size } = payload;

  if (quantity <= 0) {
    return removeCartItem(product_id);
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity, size, updated_at: new Date().toISOString() })
    .eq('cart_token', token)
    .eq('product_id', product_id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Cart updated.' };
}

export async function removeCartItem(productId) {
  const token = getCartToken();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_token', token)
    .eq('product_id', productId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Item removed.' };
}

export async function clearCart() {
  const token = getCartToken();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_token', token);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Cart cleared.' };
}

export async function placeOrder(payload) {
  // This logic is mostly moved to ordersApi.js or handled here.
  // The PHP backend did checkout in place_order of cart_api.php.
  // I will leave this wrapper, we can implement it in ordersApi.js to avoid giant file.
  // Actually, wait, let's implement the place_order here since the frontend calls `cartApi.placeOrder`.
  
  const token = getCartToken();
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('cart_token', token);

  if (!cartItems || cartItems.length === 0) {
    return { success: false, message: 'Your cart is empty.' };
  }

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;

  const selectedIds = payload.selected_products?.map(Number) || [];
  const itemsToOrder = cartItems.filter(item => selectedIds.includes(item.product_id));

  if (itemsToOrder.length === 0) {
    return { success: false, message: 'Select at least one cart item.' };
  }

  const total = itemsToOrder.reduce((sum, item) => sum + (item.quantity * item.products.price), 0);
  const shippingFee = payload.payment_method === 'cash_on_pickup' ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = total + shippingFee;
  const trackingId = 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_user_id: userId,
      customer_name: payload.name || '',
      customer_email: payload.email || '',
      contact_number: payload.contact_number || '',
      payment_method: payload.payment_method || 'cash_on_delivery',
      shipping_fee: shippingFee,
      shipping_address: payload.payment_method === 'cash_on_pickup' ? payload.pickup_branch : (payload.delivery_address || payload.shipping_address),
      shipping_latitude: payload.shipping_latitude ? Number(payload.shipping_latitude) : null,
      shipping_longitude: payload.shipping_longitude ? Number(payload.shipping_longitude) : null,
      total: grandTotal,
      tracking_id: trackingId,
      status: 'pending'
    })
    .select()
    .single();

  if (orderError) {
    return { success: false, message: orderError.message };
  }

  // Create Order Items
  const orderItemsInsert = itemsToOrder.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.products.price
  }));

  await supabase.from('order_items').insert(orderItemsInsert);

  // Clear ordered items from cart
  for (const item of itemsToOrder) {
    await supabase.from('cart_items').delete().eq('cart_token', token).eq('product_id', item.product_id);
  }

  // Update product stock
  for (const item of itemsToOrder) {
    await supabase.rpc('decrement_stock', { p_id: item.product_id, amount: item.quantity }); 
    // We'll need a decrement_stock RPC, or just ignore stock strictly for now if RPC doesn't exist.
    // For now we'll do a simple update, though it's prone to race conditions without RPC.
    const newStock = item.products.stock - item.quantity;
    await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
  }

  if (!userId) {
    const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    guestOrders.push(order.id);
    localStorage.setItem('guest_orders', JSON.stringify(guestOrders));
  }

  return {
    success: true,
    message: 'Order placed successfully.',
    order_id: order.id,
    tracking_id: trackingId,
    redirect: '/orders?highlight=' + order.id
  };
}
