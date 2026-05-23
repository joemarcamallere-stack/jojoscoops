import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminProducts } from '../../lib/adminApi';
import { projectAsset } from '../../lib/adminApi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchAdminProducts().then((data) => {
      if (data.success) {
        setProducts(data.products || []);
        setCount(data.count || 0);
      }
    });
  }, []);

  return (
    <AdminLayout role="admin" pageTitle="Product Management" activePage="products">
      <div className="center-panel">
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Product Management</span></div>
              <div className="inv-brand-email">Add, edit, and remove products from the store</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Current Products</div>
              <div className="inv-number">{count}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Action:</span><span className="val">Manage product catalog</span></div>
              <div className="row"><span className="label">Add:</span><span className="val">New product entry</span></div>
            </div>
            <Link className="btn-purple" to="/admin?section=products" style={{ width: 'auto', padding: '10px 16px' }}>Add Product</Link>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Size</th><th>Price</th><th>Stock</th><th>Action</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.image ? (
                      <img src={projectAsset(p.image)} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
                    ) : (
                      <span style={{ fontSize: 12, color: '#666' }}>No image</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.size}</td>
                  <td>{Number(p.price).toFixed(2)}</td>
                  <td>{p.stock_label}</td>
                  <td><div className="table-actions"><Link to={`/admin/products/${p.id}/edit`}>Edit</Link></div></td>
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
            <div className="label">products in catalog</div>
          </div>
          <div className="action-links">
            <Link className="action-link" to="/admin?section=products">Add Product</Link>
            <Link className="action-link" to="/admin">Dashboard</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
