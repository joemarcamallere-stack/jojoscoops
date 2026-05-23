import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchUsers, resetUserPassword, updateUser } from '../../lib/adminApi';

export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const editId = Number(params.get('edit') || 0);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userForm, setUserForm] = useState({ fullname: '', email: '', username: '', role: 'user' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchUsers();
      if (res.success) {
        setUsers(res.users || []);
      } else {
        setError(res.message || 'Failed to load users.');
        setUsers([]);
      }
    } catch {
      setError('Could not connect to the server. Please try again later.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (editId > 0) {
      const u = users.find((x) => Number(x.id) === editId);
      if (u) {
        setUserForm({
          fullname: u.fullname || '',
          email: u.email || '',
          username: u.username || '',
          role: u.role || 'user',
        });
      }
    } else {
      setUserForm({ fullname: '', email: '', username: '', role: 'user' });
    }
  }, [editId, users]);

  const showMsg = (res) => {
    setMessage(res.message || (res.success ? 'Saved.' : 'Action failed.'));
    if (!res.success) setError(res.message || 'Action failed.');
    if (res.success) load();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editId) return;
    showMsg(await updateUser({ id: editId, ...userForm }));
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset this user password to default (12345)?')) return;
    showMsg(await resetUserPassword(id));
  };

  return (
    <AdminLayout role="admin" pageTitle="User Management" activePage="users">
      <div className="center-panel dashboard-shell">
        {message ? <div className="notice">{message}</div> : null}
        {error ? <div className="notice" style={{ background: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' }}>{error}</div> : null}

        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">User Management</span></div>
              <div className="inv-brand-email">Edit registered shoppers and reset passwords</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Users</div>
              <div className="inv-number">{users.length}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Action:</span><span className="val">Edit user details</span></div>
              <div className="row"><span className="label">Reset:</span><span className="val">Default password for role user</span></div>
            </div>
            <Link className="btn-purple" to="/admin" style={{ width: 'auto', padding: '10px 16px' }}>Dashboard</Link>
          </div>
        </div>

        <div className="section-stack">
          <div className="section-card">
            <div className="section-card-title">Edit User</div>
            <div className="section-card-subtitle">Select a user from the table below, then update their details here.</div>
            {editId > 0 ? (
              <form onSubmit={handleUpdateUser}>
                <div className="form-grid">
                  <div className="form-row">
                    <label className="form-label">Full Name</label>
                    <div className="form-input"><input required value={userForm.fullname} onChange={(e) => setUserForm({ ...userForm, fullname: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Email</label>
                    <div className="form-input"><input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Username</label>
                    <div className="form-input"><input required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Role</label>
                    <div className="form-input">
                      <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="submit" className="btn-purple" style={{ width: 'auto' }}>Update User</button>
                  <button type="button" className="btn-outline" style={{ width: 'auto' }} onClick={() => setParams({})}>Clear Selection</button>
                </div>
              </form>
            ) : (
              <p className="section-card-subtitle" style={{ marginBottom: 0 }}>Select a user from the table below.</p>
            )}
          </div>

          <div className="table-card">
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-mid)' }}>Loading users…</div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Username</th><th>Role</th><th>Date Registered</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: '#777' }}>No users found.</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.fullname}</td>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>{u.role}</td>
                      <td>{u.date_registered || u.created_at || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => setParams({ edit: String(u.id) })}>Edit</button>
                          {u.role === 'user' ? (
                            <button type="button" onClick={() => handleResetPassword(u.id)}>Reset Password</button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="rcard">
          <div className="rcard-header"><span className="rcard-title">Quick Actions</span><button type="button" className="more-btn">⋯</button></div>
          <div className="page-summary" style={{ marginBottom: 14 }}>
            <div className="count">{users.length}</div>
            <div className="label">registered users</div>
          </div>
          <div className="action-links">
            <Link className="action-link" to="/admin">Dashboard</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
