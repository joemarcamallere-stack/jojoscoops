import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../lib/cartApi';
import { fetchProducts } from '../lib/productsApi';
import { projectImage } from '../lib/checkoutUtils';
import { useToast } from '../context/ToastContext';
import { showApiToast } from '../lib/toastHelpers';

const cardColors = ['pink-bg', 'orange-bg', 'red-bg', 'green-bg', 'choco-bg', 'blue-bg', 'white-bg', 'purple-bg', 'sky-blue-bg'];

export default function Menu() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');

  const normalizeCategory = (product) => {
    const text = [product.category, product.name, product.description].filter(Boolean).join(' ').toLowerCase();
    if (text.includes('chocolate') || text.includes('brownie')) return 'Chocolate';
    if (text.includes('mochi') || text.includes('cookie') || text.includes('poppables')) return 'Specialty';
    if (text.includes('frozen dessert') || text.includes('gelato') || text.includes('frozen yogurt')) return 'Frozen Dessert';
    if (text.includes('ice cream')) return 'Ice Cream';
    return product.category || 'Specialty';
  };

  useEffect(() => {
    fetchProducts()
      .then(data => {
        const normalized = data.map((p, i) => ({
          id: Number(p.id),
          name: p.name || 'Untitled Product',
          description: p.description || 'Fresh ice cream made to order.',
          price: Number(p.price) || 0,
          stock: Math.max(0, Number(p.stock) || 0),
          image: p.image || 'images/ice_cream.png',
          category: normalizeCategory(p),
          size: (p.size || '100 ml'),
          colorClass: cardColors[i % cardColors.length]
        }));
        setProducts(normalized);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (sizeFilter !== 'All' && p.size !== sizeFilter) return false;
    return true;
  });

  const handleAddToCart = async (e, product, buyNow = false) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    const qtyInput = form?.elements?.namedItem?.('quantity') ?? form?.querySelector('[name="quantity"]');
    const qty = Math.max(1, parseInt(qtyInput?.value || '1', 10));
    const size = product.size || '100 ml';
    try {
      const res = await addToCart({ product_id: product.id, quantity: qty, size });
      if (res.success) {
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: res.cart_count } }));
        if (buyNow) {
          showToast(res.message || `Added ${qty} × ${product.name}. Opening checkout…`, 'success');
          navigate(`/cart?buy=${product.id}`);
        } else {
          showApiToast(showToast, res, {
            success: `Added ${qty} × ${product.name} to your cart.`,
            error: 'Could not add to cart.',
          });
        }
      } else {
        showApiToast(showToast, res, { error: 'Could not add to cart.' });
      }
    } catch {
      showToast('Could not add to cart. Please try again later.', 'error');
    }
  };

  return (
    <>
      <section className="catalog-header" style={{ textAlign: 'center', paddingTop: '14px', paddingBottom: '6px' }}>
        <p className="subtitle">Shop</p>

        <nav className="filters" aria-label="Product filters" style={{ marginTop: '12px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div>
              {['All', 'Frozen Dessert', 'Ice Cream', 'Chocolate', 'Specialty'].map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
              <label htmlFor="size-filter" style={{ fontSize: '13px', color: '#444', marginRight: '6px' }}>Size</label>
              <select id="size-filter" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="100 ml">100 ml</option>
                <option value="200 ml">200 ml</option>
                <option value="500 ml">500 ml</option>
              </select>
            </div>
          </div>
        </nav>
      </section>

      <section className="catalog-summary" aria-label="Catalog summary">
        <div className="summary-pill"><span>Products</span><strong>{filteredProducts.length}</strong></div>
        <div className="summary-pill"><span>Live Stock</span><strong>{filteredProducts.reduce((sum, p) => sum + p.stock, 0)}</strong></div>
        <div className="summary-pill"><span>Checkout</span><strong>Cart or Buy Now</strong></div>
      </section>

      <main className="product-grid" id="products" aria-live="polite">
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">No products match this filter right now.</div>
        ) : (
          filteredProducts.map(product => (
            <article key={product.id} className={`product-card ${product.stock === 0 ? 'sold-out' : ''}`}>
              <div className={`image-container ${product.colorClass}`}>
                <span className="badge">{product.stock > 0 ? `${product.stock} in stock` : 'Not available'}</span>
                <img src={projectImage(product.image)} alt={product.name} />
              </div>
              <div className="product-card-body">
                <p className="product-category">{product.category} &bull; {product.size}</p>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="price-stock-row">
                  <div><span>Price</span><strong>PHP {product.price.toFixed(2)}</strong></div>
                  <div><span>Stock</span><strong>{product.stock}</strong></div>
                </div>
                <form className="purchase-form" onSubmit={(e) => handleAddToCart(e, product, false)}>
                  <label className="quantity-field">
                    <span>Qty</span>
                    <input type="number" name="quantity" min="1" max={Math.max(product.stock, 1)} defaultValue="1" disabled={product.stock === 0} />
                  </label>
                  <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button type="submit" name="action" value="add" className="details-btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#ffe6f0', color: '#ff4d8d', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} disabled={product.stock === 0}>Add to Cart</button>
                    <button type="button" className="details-btn filled" style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#ff4d8d', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} disabled={product.stock === 0} onClick={(e) => handleAddToCart(e, product, true)}>Buy Now</button>
                  </div>
                </form>
              </div>
            </article>
          ))
        )}
      </main>
    </>
  );
}
