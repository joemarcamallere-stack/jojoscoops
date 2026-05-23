import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminProducts, projectAsset } from '../../lib/adminApi';

export default function StaffProducts() {
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
    <AdminLayout role="staff" pageTitle="Staff Products" activePage="products">
      <div className="center-panel">
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Product Catalog</span></div>
              <div className="inv-brand-email">Staff: review pricing, stock, and flavors</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Products</div>
              <div className="inv-number">{count}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Access:</span><span className="val">Read-only inventory view</span></div>
              <div className="row"><span className="label">Details:</span><span className="val">Name, category, size, stock</span></div>
            </div>
            <Link className="btn-purple" to="/staff" style={{ width: 'auto', padding: '10px 16px' }}>Dashboard</Link>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Size</th><th>Price</th><th>Stock</th></tr></thead>
            <tbody>
              {products.length ? products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.image ? (
                      <img src={projectAsset(p.image)} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12 }} />
                    ) : (
                      <span style={{ fontSize: 12, color: '#666' }}>No image</span>
                    )}
                  </td>
                  <td>{p.name}</td><td>{p.category}</td><td>{p.size}</td>
                  <td>{Number(p.price).toFixed(2)}</td><td>{p.stock_label}</td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#777', padding: 20 }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <div className="rcard">
          <div className="rcard-header"><span className="rcard-title">Quick Links</span><button type="button" className="more-btn">⋯</button></div>
          <div className="page-summary" style={{ marginBottom: 14 }}>
            <div className="count">{count}</div>
            <div className="label">catalog items</div>
          </div>
          <div className="action-links">
            <Link className="action-link" to="/staff/orders">Orders</Link>
            <Link className="action-link" to="/staff">Dashboard</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
