import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchProduct, projectAsset, updateProduct } from '../../lib/adminApi';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image: null });

  useEffect(() => {
    fetchProduct(id).then((data) => {
      if (data.success && data.product) {
        setProduct(data.product);
        setForm({
          name: data.product.name,
          description: data.product.description || '',
          price: String(data.product.price),
          stock: String(data.product.stock ?? 0),
          image: null,
        });
      }
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('id', id);
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    if (form.image) fd.append('image', form.image);
    const res = await updateProduct(fd);
    setMessage(res.message || '');
    if (res.success) navigate('/admin/products');
  };

  if (!product) {
    return (
      <AdminLayout role="admin" pageTitle="Edit Product" activePage="products">
        <div className="center-panel">Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="admin" pageTitle="Edit Product" activePage="products">
      <div className="center-panel">
        {message ? <div className="notice">{message}</div> : null}
        <div className="invoice-header-card">
          <div className="inv-header-top">
            <div>
              <div className="inv-brand"><div className="inv-brand-dot" /><span className="inv-brand-name">Edit Product</span></div>
              <div className="inv-brand-email">Update the catalog entry using the same admin dashboard style</div>
            </div>
            <div className="inv-admin-info">
              <div className="inv-admin-label">Product ID</div>
              <div className="inv-number">#{product.id}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-rows">
              <div className="row"><span className="label">Name:</span><span className="val">{product.name}</span></div>
              <div className="row"><span className="label">Price:</span><span className="val">${Number(product.price).toFixed(2)}</span></div>
            </div>
            <Link className="btn-outline" to="/admin/products" style={{ width: 'auto', padding: '10px 16px' }}>Back to Products</Link>
          </div>
        </div>

        <div className="section-stack">
          <div className="section-card">
            <div className="section-card-title">Product Details</div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-row full"><label className="form-label">Name</label><div className="form-input"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div></div>
                <div className="form-row full"><label className="form-label">Description</label><div className="form-input"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div></div>
                <div className="form-row"><label className="form-label">Price</label><div className="form-input"><input type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div></div>
                <div className="form-row"><label className="form-label">Stock</label><div className="form-input"><input type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div></div>
                <div className="form-row full"><label className="form-label">Image</label><div className="form-input"><input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} /></div></div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-purple" style={{ width: 'auto' }}>Update Product</button>
                <Link className="btn-outline" to="/admin/products" style={{ width: 'auto' }}>Cancel</Link>
              </div>
            </form>
          </div>
          {product.image ? (
            <div className="section-card">
              <div className="section-card-title">Current Image</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: '#fbfaff' }}>
                <img src={projectAsset(product.image)} alt={product.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 16 }} />
                <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>{product.image}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
