import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { deleteStaff, fetchStaffList } from '../../lib/adminApi';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  const load = () => {
    fetchStaffList().then((data) => {
      if (data.success) {
        setStaff(data.staff || []);
        setCount(data.count || 0);
      }
    });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete staff?')) return;
    const res = await deleteStaff(id);
    setMessage(res.message || '');
    if (res.success) load();
  };

  return (
    <AdminLayout role="admin" pageTitle="Staff Management" activePage="staff">
      <div className="center-panel">
        {message ? <div className="notice">{message}</div> : null}
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Staff Management</span></div>
              <div className="inv-brand-email">View, add, edit, and remove staff members</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Current Staff</div>
              <div className="inv-number">{count}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Action:</span><span className="val">Manage staff accounts</span></div>
              <div className="row"><span className="label">Add:</span><span className="val">New staff member</span></div>
            </div>
            <Link className="btn-purple" to="/admin?section=staff" style={{ width: 'auto', padding: '10px 16px' }}>Add Staff</Link>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Username</th><th>Action</th></tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.fullname}</td><td>{s.email}</td><td>{s.username}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/staff/${s.id}/edit`}>Edit</Link>
                      <button type="button" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <div className="rcard">
          <div className="rcard-header"><span className="rcard-title">Quick Actions</span><button type="button" className="more-btn">⋯</button></div>
          <div className="page-summary" style={{ marginBottom: 14 }}>
            <div className="count">{count}</div>
            <div className="label">staff members</div>
          </div>
          <div className="action-links">
            <Link className="action-link" to="/admin?section=staff">Add Staff</Link>
            <Link className="action-link" to="/admin">Dashboard</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
