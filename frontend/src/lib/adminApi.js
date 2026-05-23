import { supabase } from './supabaseClient';
import { supabaseAdmin } from './supabaseAdminClient';

export function projectAsset(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  if (path.startsWith('product-images/')) {
    const { data } = supabase.storage.from('product-images').getPublicUrl(path.replace('product-images/', ''));
    return data.publicUrl;
  }
  
  if (path.startsWith('images/')) {
    const { data } = supabase.storage.from('website-assets').getPublicUrl(path.replace('images/', ''));
    return data.publicUrl;
  }
  
  return `/${path.replace(/^\//, '')}`;
}

export async function fetchStats() {
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: staffCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'staff']);
  const { data: orders } = await supabase.from('orders').select('status, total, payment_method');
  
  let completed_sales_total = 0;
  let completed_purchases_count = 0;
  let pickup_orders_count = 0;
  let delivery_orders_count = 0;

  if (orders) {
    for (const o of orders) {
      if (['cash_on_pickup'].includes(o.payment_method)) {
        pickup_orders_count++;
      } else {
        delivery_orders_count++;
      }
      
      if (o.status === 'completed') {
        completed_purchases_count++;
        completed_sales_total += Number(o.total);
      }
    }
  }

  return {
    success: true,
    users_count: usersCount || 0,
    products_count: productsCount || 0,
    staff_count: staffCount || 0,
    orders_count: orders?.length || 0,
    pickup_orders_count,
    delivery_orders_count,
    completed_sales_total,
    completed_purchases_count
  };
}

export async function fetchNotifications(limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .in('audience', ['admin', 'staff'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { success: false, notifications: [] };
  return { success: true, notifications: data };
}

export async function notificationAction(payload) {
  if (payload.action_type === 'mark_read') {
    await supabase.from('notifications').update({ is_read: true }).eq('id', payload.notification_id);
    return { success: true };
  }
  return { success: false };
}

export async function fetchUsers() {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'user');
  return { success: !error, users: data || [] };
}

export async function fetchUser(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  return { success: !error, user: data };
}

export async function updateUser(payload) {
  const { id, fullname, email, username, role } = payload;
  
  if (supabaseAdmin && email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      user_metadata: { fullname, username, role }
    });
    if (authError && authError.code !== 'user_already_exists') {
      return { success: false, message: authError.message };
    }
  }

  const { error } = await supabase.from('profiles').update({
    fullname,
    email,
    username,
    role
  }).eq('id', id);
  
  return { success: !error, message: error ? error.message : 'User updated.' };
}

export async function resetUserPassword(id) {
  if (!supabaseAdmin) {
    return { success: false, message: 'Service Role Key is missing. Cannot reset passwords.' };
  }
  
  // Get the user's Auth UUID from profiles
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', id).single();
  if (!profile) return { success: false, message: 'User not found.' };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
    password: '12345'
  });
  
  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Password has been reset to 12345.' };
}

export async function fetchAdminProducts() {
  const { data, error } = await supabase.from('products').select('*').order('name');
  const products = (data || []).map(p => ({
    ...p,
    stock_label: Number(p.stock) > 0 ? `${p.stock} in stock` : 'Out of stock',
  }));
  return { success: !error, products, count: products.length };
}

export async function fetchProduct(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  return { success: !error, product: data };
}

async function uploadImage(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage.from('product-images').upload(filePath, file);
  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function addProduct(formData) {
  try {
    let imageUrl = null;
    if (formData.get('image')) {
      imageUrl = await uploadImage(formData.get('image'));
    }

    const newProduct = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      stock: formData.get('stock'),
      category: formData.get('category'),
      size: formData.get('size'),
    };
    if (imageUrl) newProduct.image = imageUrl;

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) throw error;

    return { success: true, message: 'Product added successfully.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updateProduct(formData) {
  try {
    const id = formData.get('id');
    let imageUrl = null;
    if (formData.get('image') && formData.get('image').size > 0) {
      imageUrl = await uploadImage(formData.get('image'));
    }

    const updates = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      stock: formData.get('stock'),
      category: formData.get('category'),
      size: formData.get('size'),
    };
    if (imageUrl) updates.image = imageUrl;

    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;

    return { success: true, message: 'Product updated successfully.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchStaffList() {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'staff');
  return { success: !error, staff: data || [] };
}

export async function fetchStaffMember(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  return { success: !error, member: data };
}

export async function addStaff(payload) {
  if (!supabaseAdmin) {
    return { success: false, message: 'Service Role Key is missing. Cannot add staff directly.' };
  }

  const { fullname, email, username, password } = payload;
  const targetEmail = email || `${username}@jojos.com`;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: targetEmail,
    password: password,
    email_confirm: true,
    user_metadata: {
      fullname,
      username,
      role: 'staff'
    }
  });

  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Staff member added successfully.' };
}

export async function updateStaff(payload) {
  const { id, fullname, role, password } = payload;
  
  if (password && supabaseAdmin) {
    // If password provided, update via Admin API
    const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
    if (pwdError) return { success: false, message: pwdError.message };
  }

  const { error } = await supabase.from('profiles').update({ fullname, role }).eq('id', id);
  return { success: !error, message: error ? error.message : 'Staff updated.' };
}

export async function deleteStaff(id) {
  if (!supabaseAdmin) {
    return { success: false, message: 'Service Role Key is missing. Cannot delete staff.' };
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  return { success: !error, message: error ? error.message : 'Staff profile deleted.' };
}

const STATUS_FLOW = {
  pending: [{ value: 'processing', label: 'Mark Processing' }],
  processing: [{ value: 'shipped', label: 'Mark Shipped' }],
  shipped: [{ value: 'completed', label: 'Mark Completed' }],
  completed: [],
  cancelled: [],
};

export async function fetchOrders() {
  const { data, error } = await supabase.from('orders').select('*, order_items(*, products(name))').order('created_at', { ascending: false });
  if (error) return { success: false, orders: [] };

  const orders = data.map(o => {
    const status = (o.status || 'pending').toLowerCase();
    return {
      ...o,
      date: new Date(o.created_at).toLocaleDateString(),
      status_options: STATUS_FLOW[status] || [],
      items: (o.order_items || []).map(item => ({
        product_name: item.products?.name,
        quantity: item.quantity,
      }))
    };
  });
  return { success: true, orders };
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  return { success: !error, message: error ? error.message : 'Order status updated.' };
}

// Stubs for auth functions that are now handled by AuthContext
export async function checkAuth() { return { authenticated: true }; }
export async function logout() { await supabase.auth.signOut(); return { ok: true }; }
export function clearAuthClientState() {}
export function markAuthClientState() {}

export default { fetchStats, fetchOrders, fetchAdminProducts };
