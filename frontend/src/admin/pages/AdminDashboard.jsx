import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import OrderStatusControl from '../components/OrderStatusControl';
import {
  addProduct, addStaff, deleteStaff, fetchAdminProducts, fetchOrders, fetchStaffList, fetchStats, fetchUsers,
  resetUserPassword, updateUser,
} from '../../lib/adminApi';
import { formatMoney } from '../utils/orders';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'products', label: 'Products' },
  { id: 'staff', label: 'Staff' },
  { id: 'orders', label: 'Orders' },
];

const CATEGORIES = ['Frozen Dessert', 'Ice Cream', 'Chocolate', 'Specialty'];
const SIZES = ['100 ml', '200 ml', '500 ml'];

export default function AdminDashboard() {
  const [params, setParams] = useSearchParams();
  const section = params.get('section') || 'overview';
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(Number(params.get('edit') || 0));
  const [userForm, setUserForm] = useState({ fullname: '', email: '', username: '', role: 'user' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '0', category: 'Ice Cream', size: '100 ml', image: null });
  const [staffForm, setStaffForm] = useState({ fullname: '', email: '', username: '', password: '' });

  const load = useCallback(async () => {
    const s = await fetchStats();
    if (s.success) setStats(s);
    if (section === 'users' || section === 'overview') {
      const u = await fetchUsers();
      if (u.success) setUsers(u.users || []);
    }
    if (section === 'products' || section === 'overview') {
      const p = await fetchAdminProducts();
      if (p.success) setProducts(p.products || []);
    }
    if (section === 'orders') {
      const o = await fetchOrders();
      if (o.success) setOrders(o.orders || []);
    }
    if (section === 'staff') {
      const st = await fetchStaffList();
      if (st.success) setStaffList(st.staff || []);
    }
  }, [section]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = Number(params.get('edit') || 0);
    setEditId(id);
    if (id && section === 'users') {
      const u = users.find((x) => Number(x.id) === id);
      if (u) setUserForm({ fullname: u.fullname, email: u.email, username: u.username, role: u.role });
    }
  }, [params, users, section]);

  const setSection = (id) => {
    const next = new URLSearchParams();
    if (id !== 'overview') next.set('section', id);
    setParams(next);
  };

  const showMsg = (res) => {
    setMessage(res.message || (res.success ? 'Saved.' : 'Action failed.'));
    if (res.success) load();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    showMsg(await updateUser({ id: editId, ...userForm }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', productForm.name);
    fd.append('description', productForm.description);
    fd.append('price', productForm.price);
    fd.append('stock', productForm.stock);
    fd.append('category', productForm.category);
    fd.append('size', productForm.size);
    if (productForm.image) fd.append('image', productForm.image);
    showMsg(await addProduct(fd));
    setProductForm({ name: '', description: '', price: '', stock: '0', category: 'Ice Cream', size: '100 ml', image: null });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    showMsg(await addStaff(staffForm));
    setStaffForm({ fullname: '', email: '', username: '', password: '' });
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset this user password to default (12345)?')) return;
    showMsg(await resetUserPassword(id));
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete staff?')) return;
    showMsg(await deleteStaff(id));
  };

  if (!stats) {
    return (
      <AdminLayout role="admin" pageTitle="Jojo's Admin Hub" activePage="dashboard">
        <div className="center-panel">Loading…</div>
      </AdminLayout>
    );
  }

  const activePage = section === 'overview' ? 'dashboard' : section;

  return (
    <AdminLayout role="admin" pageTitle="Jojo's Admin Hub" activePage={activePage}>
      <div className="center-panel dashboard-shell">
        {message ? <div className="notice">{message}</div> : null}

        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Jojo's Admin Hub</span></div>
              <div className="inv-brand-email">Manage products, staff, and orders in one interface</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Welcome, Admin</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Products:</span><span className="val">{stats.products_count}</span></div>
              <div className="row"><span className="label">Staff:</span><span className="val">{stats.staff_count}</span></div>
              <div className="row"><span className="label">Orders:</span><span className="val">{stats.orders_count}</span></div>
              <div className="row"><span className="label">Sales:</span><span className="val">{formatMoney(stats.completed_sales_total)}</span></div>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`dashboard-tab ${section === t.id ? 'active' : ''}`} onClick={() => setSection(t.id)}>{t.label}</button>
          ))}
        </div>

        <div className="summary-grid">
          <div className="summary-card"><div className="label">Users</div><div className="value">{stats.users_count}</div><div className="hint">Registered shoppers</div></div>
          <div className="summary-card"><div className="label">Products</div><div className="value">{stats.products_count}</div><div className="hint">Ice cream catalog entries</div></div>
          <div className="summary-card"><div className="label">Staff</div><div className="value">{stats.staff_count}</div><div className="hint">Active staff accounts</div></div>
          <div className="summary-card"><div className="label">Sales</div><div className="value">{formatMoney(stats.completed_sales_total)}</div><div className="hint">{stats.completed_purchases_count} completed purchases</div></div>
          <div className="summary-card"><div className="label">Orders</div><div className="value">{stats.orders_count}</div><div className="hint">Purchase requests</div></div>
          <div className="summary-card"><div className="label">Pickup</div><div className="value">{stats.pickup_orders_count}</div><div className="hint">Cash on pick up</div></div>
          <div className="summary-card"><div className="label">Delivery</div><div className="value">{stats.delivery_orders_count}</div><div className="hint">Cash on delivery</div></div>
        </div>

        {section === 'overview' && (
          <div className="section-stack">
            <div className="section-card">
              <div className="section-card-title">Choose a management area</div>
              <div className="section-card-subtitle">Open any section below to add products, add staff members, or manage order status.</div>
              <div className="section-actions">
                <Link className="btn-outline" to="/admin/users" style={{ width: 'auto' }}>Edit Users</Link>
                <button type="button" className="btn-purple" style={{ width: 'auto' }} onClick={() => setSection('products')}>Manage Products</button>
                <button type="button" className="btn-outline" style={{ width: 'auto' }} onClick={() => setSection('staff')}>Manage Staff</button>
                <Link className="btn-outline" to="/admin/orders?view=pickup" style={{ width: 'auto' }}>Pickup Orders</Link>
                <Link className="btn-outline" to="/admin/orders?view=delivery" style={{ width: 'auto' }}>Delivery Orders</Link>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-title">Quick Snapshot</div>
              <div className="mini-list">
                <div className="mini-item"><strong>Product catalog</strong><span>{stats.products_count} items</span></div>
                <div className="mini-item"><strong>Staff roster</strong><span>{stats.staff_count} members</span></div>
                <div className="mini-item"><strong>Sales total</strong><span>{formatMoney(stats.completed_sales_total)} from completed purchases</span></div>
                <div className="mini-item"><strong>Pickup queue</strong><span>{stats.pickup_orders_count} requests</span></div>
                <div className="mini-item"><strong>Delivery queue</strong><span>{stats.delivery_orders_count} requests</span></div>
              </div>
            </div>
          </div>
        )}

        {section === 'users' && (
          <div className="section-stack">
            <div className="section-card">
              <div className="section-card-title">Edit User</div>
              {editId ? (
                <form onSubmit={handleUpdateUser}>
                  <div className="form-grid">
                    <div className="form-row"><label className="form-label">Full Name</label><div className="form-input"><input required value={userForm.fullname} onChange={(e) => setUserForm({ ...userForm, fullname: e.target.value })} /></div></div>
                    <div className="form-row"><label className="form-label">Email</label><div className="form-input"><input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div></div>
                    <div className="form-row"><label className="form-label">Username</label><div className="form-input"><input required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} /></div></div>
                    <div className="form-row"><label className="form-label">Role</label><div className="form-input"><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></div></div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn-purple" style={{ width: 'auto' }}>Update User</button>
                    <button type="button" className="btn-outline" style={{ width: 'auto' }} onClick={() => { setEditId(0); setParams({ section: 'users' }); }}>Clear Selection</button>
                  </div>
                </form>
              ) : (
                <p className="section-card-subtitle">Select a user from the table below.</p>
              )}
            </div>
            <div className="table-card">
              <table>
                <thead><tr><th>Full Name</th><th>Email</th><th>Username</th><th>Role</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.fullname}</td><td>{u.email}</td><td>{u.username}</td><td>{u.role}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => { setEditId(u.id); setParams({ section: 'users', edit: u.id }); setUserForm({ fullname: u.fullname || '', email: u.email || '', username: u.username || '', role: u.role || 'user' }); }}>Edit</button>
                          {u.role === 'user' ? <button type="button" onClick={() => handleResetPassword(u.id)}>Reset Password</button> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'products' && (
          <div className="section-stack">
            <div className="section-card">
              <div className="section-card-title">Add Product</div>
              <form onSubmit={handleAddProduct}>
                <div className="form-grid">
                  <div className="form-row"><label className="form-label">Name</label><div className="form-input"><input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></div></div>
                  <div className="form-row"><label className="form-label">Price</label><div className="form-input"><input type="number" step="0.01" min="0" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></div></div>
                  <div className="form-row"><label className="form-label">Stock</label><div className="form-input"><input type="number" min="0" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /></div></div>
                  <div className="form-row"><label className="form-label">Category</label><div className="form-input"><select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div></div>
                  <div className="form-row"><label className="form-label">Size</label><div className="form-input"><select value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}>{SIZES.map((s) => <option key={s}>{s}</option>)}</select></div></div>
                  <div className="form-row full"><label className="form-label">Description</label><div className="form-input"><textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></div></div>
                  <div className="form-row full"><label className="form-label">Product Image</label><div className="form-input"><input type="file" accept="image/*" onChange={(e) => setProductForm({ ...productForm, image: e.target.files?.[0] || null })} /></div></div>
                </div>
                <div style={{ marginTop: 14 }}><button type="submit" className="btn-purple" style={{ width: 'auto' }}>Add Product</button></div>
              </form>
            </div>
            <div className="table-card">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td><td>{p.name}</td><td>{p.description}</td><td>{Number(p.price).toFixed(2)}</td><td>{p.stock_label}</td>
                      <td><div className="table-actions"><Link to={`/admin/products/${p.id}/edit`}>Edit</Link></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'staff' && (
          <div className="section-stack">
            <div className="section-card">
              <div className="section-card-title">Add Staff</div>
              <form onSubmit={handleAddStaff}>
                <div className="form-grid">
                  <div className="form-row"><label className="form-label">Full Name</label><div className="form-input"><input required value={staffForm.fullname} onChange={(e) => setStaffForm({ ...staffForm, fullname: e.target.value })} /></div></div>
                  <div className="form-row"><label className="form-label">Email</label><div className="form-input"><input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></div></div>
                  <div className="form-row"><label className="form-label">Username</label><div className="form-input"><input required value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} /></div></div>
                  <div className="form-row"><label className="form-label">Password</label><div className="form-input"><input type="password" required value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} /></div></div>
                </div>
                <div style={{ marginTop: 14 }}><button type="submit" className="btn-purple" style={{ width: 'auto' }}>Add Staff</button></div>
              </form>
            </div>
            <div className="table-card">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Username</th><th>Action</th></tr></thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td><td>{s.fullname}</td><td>{s.email}</td><td>{s.username}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/staff/${s.id}/edit`}>Edit</Link>
                          <button type="button" onClick={() => handleDeleteStaff(s.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'orders' && (
          <div className="section-stack">
            <div className="section-card">
              <div className="section-card-title">Manage Orders</div>
              <div className="section-actions">
                <Link className="btn-outline" to="/admin/orders" style={{ width: 'auto' }}>Full Orders Page</Link>
              </div>
            </div>
            <div className="table-card orders-status-card">
              <div className="orders-table-scroll">
                <table className="orders-status-table orders-table-compact">
                  <thead><tr><th>ID</th><th>Customer</th><th>Contact</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td><td>{o.customer_name}</td><td>{o.contact_number}</td><td>{Number(o.total).toFixed(2)}</td><td>{o.status}</td><td>{o.created_at}</td>
                        <td className="orders-action-cell">
                          <OrderStatusControl order={o} onUpdated={(msg) => { setMessage(msg); load(); }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
