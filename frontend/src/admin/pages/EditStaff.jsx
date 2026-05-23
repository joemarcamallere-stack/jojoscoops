import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchStaffMember, updateStaff } from '../../lib/adminApi';

export default function EditStaff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ fullname: '', email: '', username: '', password: '' });

  useEffect(() => {
    fetchStaffMember(id).then((data) => {
      if (data.success && data.staff) {
        setStaff(data.staff);
        setForm({ fullname: data.staff.fullname, email: data.staff.email || '', username: data.staff.username, password: '' });
      }
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateStaff({ id: Number(id), ...form });
    setMessage(res.message || '');
    if (res.success) navigate('/admin/staff');
  };

  if (!staff) {
    return (
      <AdminLayout role="admin" pageTitle="Edit Staff" activePage="staff">
        <div className="center-panel">Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="admin" pageTitle="Edit Staff" activePage="staff">
      <div className="center-panel">
        {message ? <div className="notice">{message}</div> : null}
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Edit Staff</span></div>
              <div className="inv-brand-email">Update staff account details using the same admin hub layout</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Staff ID</div>
              <div className="inv-number">#{staff.id}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Name:</span><span className="val">{staff.fullname}</span></div>
              <div className="row"><span className="label">Username:</span><span className="val">{staff.username}</span></div>
            </div>
            <Link className="btn-outline" to="/admin/staff" style={{ width: 'auto', padding: '10px 16px' }}>Back to Staff</Link>
          </div>
        </div>

        <div className="section-stack">
          <div className="section-card">
            <div className="section-card-title">Staff Details</div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-row full"><label className="form-label">Full Name</label><div className="form-input"><input required value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} /></div></div>
                <div className="form-row full"><label className="form-label">Email</label><div className="form-input"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
                <div className="form-row full"><label className="form-label">Username</label><div className="form-input"><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div></div>
                <div className="form-row full"><label className="form-label">New Password</label><div className="form-input"><input type="password" placeholder="Leave blank to keep current password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div></div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-purple" style={{ width: 'auto' }}>Update Staff</button>
                <Link className="btn-outline" to="/admin/staff" style={{ width: 'auto' }}>Cancel</Link>
              </div>
            </form>
          </div>
          <div className="section-card">
            <div className="section-card-title">Current Account</div>
            <div className="mini-list">
              <div className="mini-item"><strong>Full name</strong><span>{staff.fullname}</span></div>
              <div className="mini-item"><strong>Email</strong><span>{staff.email || 'Not set'}</span></div>
              <div className="mini-item"><strong>Username</strong><span>{staff.username}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
