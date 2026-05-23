import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  clearCart,
  fetchCart,
  fetchCartCount,
  placeOrder,
  removeCartItem,
  updateCartItem,
} from '../lib/cartApi';
import {
  DELIVERY_SERVICE_AREAS,
  PICKUP_BRANCHES,
  STANDARD_SHIPPING_FEE,
  formatMoney,
  isAllowedDeliveryLocation,
  projectImage,
} from '../lib/checkoutUtils';
import { useToast } from '../context/ToastContext';
import { showApiToast } from '../lib/toastHelpers';

const SIZES = ['100 ml', '200 ml', '500 ml'];
const CHECKOUT_DRAFT_KEY = 'activity_checkout_draft';
const CART_SELECTION_KEY = 'activity_cart_selection';

function loadSelection(idsFromServer) {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_SELECTION_KEY) || 'null');
    if (Array.isArray(stored)) return new Set(stored.map(String));
  } catch {
    /* ignore */
  }
  return new Set(idsFromServer.map((id) => String(id)));
}

function saveSelection(set) {
  localStorage.setItem(CART_SELECTION_KEY, JSON.stringify([...set]));
}

function saveCheckoutDraft(draft) {
  localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

function loadCheckoutDraft() {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function Cart() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const buyId = searchParams.get('buy');

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [pickupBranches, setPickupBranches] = useState(PICKUP_BRANCHES);

  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupBranch, setPickupBranch] = useState('');
  const [shippingLatitude, setShippingLatitude] = useState('');
  const [shippingLongitude, setShippingLongitude] = useState('');
  const [locationStatus, setLocationStatus] = useState('Location will be detected automatically when available.');
  const [locationError, setLocationError] = useState(false);
  const [placing, setPlacing] = useState(false);

  const isPickup = paymentMethod === 'cash_on_pickup';

  const applyCartResponse = useCallback((data, preserveSelection = true, flashMessage = false) => {
    if (!data.success) {
      showToast(data.message || 'Unable to load cart.', 'error');
      return;
    }
    const cartItems = data.cart?.items || [];
    setItems(cartItems);
    if (flashMessage && data.message) showToast(data.message, 'success');
    if (data.config?.pickup_branches) setPickupBranches(data.config.pickup_branches);

    const profile = data.cart?.profile || {};
    const draft = loadCheckoutDraft();
    setName(profile.name || draft.name || '');
    setContactNumber(profile.contact_number || draft.contact_number || '');
    setPaymentMethod(profile.payment_method || draft.payment_method || 'cash_on_delivery');
    setDeliveryAddress(profile.delivery_address || draft.delivery_address || '');
    setPickupBranch(profile.pickup_branch || draft.pickup_branch || data.config?.pickup_branches?.[0]?.value || '');
    setShippingLatitude(profile.latitude || draft.shipping_latitude || '');
    setShippingLongitude(profile.longitude || draft.shipping_longitude || '');

    const defaultSelected = cartItems.filter((i) => i.selected).map((i) => String(i.id));
    if (buyId) {
      const next = new Set([String(buyId)]);
      setSelected(next);
      saveSelection(next);
    } else if (preserveSelection) {
      const currentIds = cartItems.map((i) => String(i.id));
      const prev = loadSelection(defaultSelected.length ? defaultSelected : currentIds);
      const filtered = new Set([...prev].filter((id) => currentIds.includes(id)));
      if (filtered.size === 0 && currentIds.length) {
        currentIds.forEach((id) => filtered.add(id));
      }
      setSelected(filtered);
      saveSelection(filtered);
    }
  }, [buyId, showToast]);

  const reload = useCallback(async () => {
    const data = await fetchCart(buyId ? Number(buyId) : null);
    applyCartResponse(data);
  }, [applyCartResponse, buyId]);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  useEffect(() => {
    if (isPickup) {
      setLocationStatus('Choose one of the pickup branches below.');
      setLocationError(false);
    } else if (!deliveryAddress.trim()) {
      setLocationStatus('Location will be detected automatically when available.');
      setLocationError(false);
    } else if (!isAllowedDeliveryLocation(deliveryAddress)) {
      setLocationStatus('Delivery is available only in Loon, Calape, and Tubigon, Bohol.');
      setLocationError(true);
    } else {
      setLocationStatus('Delivery address is within the service area.');
      setLocationError(false);
    }
  }, [isPickup, deliveryAddress]);

  useEffect(() => {
    if (isPickup && pickupBranches.length > 0) {
      const valid = pickupBranches.some((b) => b.value === pickupBranch);
      if (!pickupBranch.trim() || !valid) {
        setPickupBranch(pickupBranches[0].value);
      }
    }
  }, [isPickup, pickupBranches, pickupBranch]);

  useEffect(() => {
    saveCheckoutDraft({
      name,
      contact_number: contactNumber,
      payment_method: paymentMethod,
      delivery_address: deliveryAddress,
      pickup_branch: pickupBranch,
      shipping_latitude: shippingLatitude,
      shipping_longitude: shippingLongitude,
    });
  }, [name, contactNumber, paymentMethod, deliveryAddress, pickupBranch, shippingLatitude, shippingLongitude]);

  const total = useMemo(() => items.reduce((s, i) => s + Number(i.subtotal || 0), 0), [items]);

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(String(i.id)) && Number(i.available_stock) > 0),
    [items, selected]
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((s, i) => s + Number(i.subtotal || 0), 0),
    [selectedItems]
  );

  const selectedQty = useMemo(
    () => selectedItems.reduce((s, i) => s + Number(i.quantity || 0), 0),
    [selectedItems]
  );

  const shippingFee = selectedItems.length > 0 ? (isPickup ? 0 : STANDARD_SHIPPING_FEE) : 0;
  const grandTotal = selectedSubtotal + shippingFee;

  const deliveryBlocked = !isPickup && deliveryAddress.trim() !== '' && !isAllowedDeliveryLocation(deliveryAddress);
  const canPlaceOrder = selectedItems.length > 0
    && !deliveryBlocked
    && (isPickup ? pickupBranch.trim() !== '' : deliveryAddress.trim() !== '' && isAllowedDeliveryLocation(deliveryAddress));

  const toggleSelect = (id, checked) => {
    const next = new Set(selected);
    if (checked) next.add(String(id));
    else next.delete(String(id));
    setSelected(next);
    saveSelection(next);
  };

  const handleQtyChange = async (item, quantity, size) => {
    try {
      const res = await updateCartItem({
        product_id: item.id,
        quantity: Math.max(1, Number(quantity)),
        size,
      });
      if (res.cart) {
        applyCartResponse({
          success: true,
          message: res.message,
          cart: res.cart,
          config: { pickup_branches: pickupBranches },
        }, true, true);
      } else {
        if (res.success) {
          reload();
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: await fetchCartCount().then(d => d.count) } }));
        }
        showApiToast(showToast, res, { success: 'Cart updated.', error: 'Could not update cart.' });
      }
    } catch {
      showToast('Could not update cart. Please try again later.', 'error');
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await removeCartItem(id);
      const next = new Set(selected);
      next.delete(String(id));
      setSelected(next);
      saveSelection(next);
      if (res.cart) {
        applyCartResponse({
          success: true,
          message: res.message,
          cart: res.cart,
          config: { pickup_branches: pickupBranches },
        }, false, true);
      } else {
        showApiToast(showToast, res, { success: 'Item removed from cart.', error: 'Could not remove item.' });
        if (res.success) {
          reload();
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: await fetchCartCount().then(d => d.count) } }));
        }
      }
    } catch {
      showToast('Could not remove item. Please try again later.', 'error');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    try {
      const res = await clearCart();
      showApiToast(showToast, res, { success: 'Cart cleared.', error: 'Could not clear cart.' });
      setSelected(new Set());
      saveSelection(new Set());
      reload();
    } catch {
      showToast('Could not clear cart. Please try again later.', 'error');
    }
  };

  const validateCheckout = () => {
    if (isPickup) {
      if (!pickupBranch.trim()) {
        setLocationStatus('Please choose one of the pickup branches before placing the order.', true);
        setLocationError(true);
        return false;
      }
      const valid = pickupBranches.some((b) => b.value === pickupBranch);
      if (pickupBranches.length && !valid) {
        setLocationStatus('Please choose one of the available pickup branches.', true);
        setLocationError(true);
        return false;
      }
      return true;
    }

    const addr = deliveryAddress.trim();
    if (!addr) {
      setLocationStatus('Please provide your delivery address.', true);
      setLocationError(true);
      return false;
    }
    if (!isAllowedDeliveryLocation(addr)) {
      setLocationStatus('Delivery is available only in Loon, Calape, and Tubigon, Bohol.', true);
      setLocationError(true);
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateCheckout()) return;
    if (selectedItems.length === 0) {
      showToast('Select at least one cart item before checking out.', 'error');
      return;
    }

    setPlacing(true);
    try {
      const res = await placeOrder({
        name: name.trim(),
        contact_number: contactNumber.trim(),
        payment_method: paymentMethod,
        delivery_address: deliveryAddress.trim(),
        pickup_branch: pickupBranch.trim(),
        shipping_latitude: shippingLatitude,
        shipping_longitude: shippingLongitude,
        selected_products: selectedItems.map((i) => i.id),
      });

      if (res.success) {
        localStorage.removeItem(CART_SELECTION_KEY);
        localStorage.removeItem(CHECKOUT_DRAFT_KEY);
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: 0 } }));
        navigate(res.redirect || `/orders?highlight=${res.order_id}`, { replace: true, state: { orderMessage: res.message } });
      } else {
        showApiToast(showToast, res, { error: 'Unable to place order.' });
      }
    } catch {
      showToast('Could not place order. Please try again later.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const useCurrentLocation = () => {
    if (isPickup) {
      setLocationStatus('Pickup orders use the branch list instead of location detection.', true);
      setLocationError(true);
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus('Location tracking is not available in this browser.', true);
      setLocationError(true);
      return;
    }
    setLocationStatus('Detecting your current location...');
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setShippingLatitude(lat);
        setShippingLongitude(lon);
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          const data = await response.json();
          const address = data?.address || {};
          const barangay = address.barangay || address.suburb || address.neighbourhood || address.city_district || '';
          const locality = address.city || address.town || address.municipality || address.village || '';
          const parts = [
            address.house_number,
            address.road,
            barangay ? `Barangay ${barangay}` : '',
            locality,
            address.state,
            address.country,
          ].filter(Boolean);
          const placeName = parts.length ? parts.join(', ') : (data.display_name || 'Current location');
          setDeliveryAddress(placeName);
          if (!isAllowedDeliveryLocation(placeName)) {
            setLocationStatus('Delivery is available only in Loon, Calape, and Tubigon, Bohol.', true);
            setLocationError(true);
          } else {
            setLocationStatus(`Location detected: ${placeName}`);
            setLocationError(false);
          }
        } catch {
          setDeliveryAddress('Current location');
          setLocationStatus('Location detected, but the place name could not be resolved. Edit the address if needed.', true);
          setLocationError(true);
        }
      },
      () => {
        setLocationStatus('Unable to detect your current location. You can enter it manually.', true);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return <main className="cart-page"><div style={{ padding: 40, textAlign: 'center' }}>Loading cart…</div></main>;
  }

  return (
    <main className="cart-page" id="home">
      <section className="cart-hero">
        <div className="cart-hero-copy">
          <p className="section-kicker">TikTok Shop style cart</p>
          <h1>Your Ice Cream Cart</h1>
          <p>Manage quantity with automatic saves, choose which items to buy, and checkout from a cleaner shopping layout.</p>
          <div className="cart-hero-actions">
            <Link className="btn-shop" to="/products">Continue Shopping</Link>
            <Link className="btn-shop cart-secondary-btn" to="/orders">My Orders</Link>
          </div>
        </div>
        <div className="cart-hero-summary">
          <div className="cart-metric"><span>Total Items</span><strong>{items.reduce((s, i) => s + Number(i.quantity), 0)}</strong></div>
          <div className="cart-metric"><span>Current Total</span><strong>{formatMoney(total)}</strong></div>
          <div className="cart-metric"><span>Selected Total</span><strong>{formatMoney(selectedSubtotal)}</strong></div>
        </div>
      </section>

      <section className="cart-layout" id="checkout">
        <div className="cart-items-panel">
          <div className="section-heading cart-section-heading">
            <div>
              <p className="section-kicker">Cart Items</p>
              <h2>Review your products</h2>
            </div>
            <div className="section-actions">
              <Link className="section-link" to="/products">Back to Shop</Link>
              {items.length > 0 ? (
                <button type="button" className="section-link" onClick={handleClear}>Clear Cart</button>
              ) : null}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-cart-card">
              <h3>Your cart is empty</h3>
              <p>Browse the shop and add your favorite flavors.</p>
              <Link className="btn-shop" to="/products">Shop now</Link>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => {
                const outOfStock = Number(item.available_stock) <= 0;
                const checked = selected.has(String(item.id));
                return (
                  <article key={item.id} className={`cart-item-card ${checked ? 'is-selected' : ''}`} data-cart-row data-product-id={item.id}>
                    <div className="cart-item-media">
                      <img src={projectImage(item.image)} alt={item.name} />
                      {outOfStock ? <span className="cart-stock-badge stock-empty">Not available</span> : (
                        <span className="cart-stock-badge">{item.available_stock} in stock</span>
                      )}
                    </div>
                    <div className="cart-item-body">
                      <div className="cart-item-top">
                        <div>
                          <p className="cart-item-seller">Creamy Official Store</p>
                          <h3>{item.name}</h3>
                        </div>
                        <label className="cart-select-label">
                          <input
                            type="checkbox"
                            className="cart-item-checkbox"
                            checked={checked}
                            disabled={outOfStock}
                            onChange={(e) => toggleSelect(item.id, e.target.checked)}
                          />
                          <span>Checkout</span>
                        </label>
                        <button type="button" className="cart-remove-btn" onClick={() => handleRemove(item.id)}>Remove</button>
                      </div>
                      <div className="cart-item-price-row">
                        <div><span>Price</span><strong>{formatMoney(item.price)}</strong></div>
                        <div><span>Subtotal</span><strong>{formatMoney(item.subtotal)}</strong></div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-qty-control">
                          <div>
                            <label htmlFor={`qty-${item.id}`}>Quantity</label>
                            <input
                              id={`qty-${item.id}`}
                              className="cart-qty-input"
                              type="number"
                              min="1"
                              max={Math.max(1, item.available_stock)}
                              value={item.quantity}
                              disabled={outOfStock}
                              onChange={(e) => handleQtyChange(item, e.target.value, item.size)}
                            />
                          </div>
                          <div>
                            <label htmlFor={`size-${item.id}`}>Size</label>
                            <select
                              id={`size-${item.id}`}
                              value={item.size || '100 ml'}
                              disabled={outOfStock}
                              onChange={(e) => handleQtyChange(item, item.quantity, e.target.value)}
                            >
                              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="checkout-sidebar">
          <div className="checkout-card sticky-card">
            <p className="section-kicker">Order Summary</p>
            <h2>Checkout</h2>
            <div className="summary-breakdown">
              <div><span>Selected Items</span><strong>{selectedQty}</strong></div>
              <div><span>Selected Subtotal</span><strong>{formatMoney(selectedSubtotal)}</strong></div>
              <div><span>Shipping Fee</span><strong>{formatMoney(shippingFee)}</strong></div>
            </div>
            <div className="summary-total">
              <span>Grand Total</span>
              <strong>{formatMoney(grandTotal)}</strong>
            </div>
            <p className="checkout-note">
              Only checked items will be included in this order. Pickup has no shipping fee.
              Delivery is limited to {DELIVERY_SERVICE_AREAS.join(', ')}.
            </p>

            {items.length > 0 ? (
              <form id="checkout-form" className="checkout-form" onSubmit={handlePlaceOrder}>
                <label>Your name
                  <input name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label>Contact number
                  <input name="contact_number" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="09xxxxxxxxx" required />
                </label>
                <label>Payment method
                  <select id="payment-method" name="payment_method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="cash_on_pickup">Cash on Pick Up</option>
                  </select>
                </label>

                {!isPickup && (
                  <label id="delivery-address-field">Delivery address / location
                    <textarea
                      id="shipping-address"
                      name="delivery_address"
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                    />
                  </label>
                )}

                {isPickup && (
                  <label id="pickup-branch-field">Pickup branch
                    <select
                      id="pickup-branch"
                      name="pickup_branch"
                      value={pickupBranch}
                      onChange={(e) => setPickupBranch(e.target.value)}
                      required
                    >
                      {pickupBranches.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branch.label} — {branch.value}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {!isPickup && (
                  <div className="location-inline" id="delivery-location-tools">
                    <button type="button" id="use-location-btn" className="location-btn" onClick={useCurrentLocation}>
                      Use My Current Location
                    </button>
                    <p className={`location-status ${locationError ? 'is-error' : ''}`} id="location-status">
                      {locationStatus}
                    </p>
                    <p className="checkout-area-hint">
                      Service areas: {DELIVERY_SERVICE_AREAS.join(' · ')}
                    </p>
                  </div>
                )}

                {isPickup && (
                  <p className={`location-status ${locationError ? 'is-error' : ''}`}>{locationStatus}</p>
                )}

                <input type="hidden" name="shipping_latitude" value={shippingLatitude} />
                <input type="hidden" name="shipping_longitude" value={shippingLongitude} />

                <button
                  type="submit"
                  className="btn-submit checkout-btn-submit"
                  data-checkout-submit
                  disabled={!canPlaceOrder || placing}
                >
                  {placing ? 'Placing order…' : 'Place Order'}
                </button>
                {deliveryBlocked ? (
                  <p className="checkout-blocked-msg">You cannot checkout: delivery address is outside Loon, Calape, or Tubigon, Bohol.</p>
                ) : null}
              </form>
            ) : (
              <p className="checkout-empty">Add items to unlock checkout.</p>
            )}
          </div>
        </aside>
      </section>

      {/* Mobile Floating Checkout Button */}
      {items.length > 0 && selectedItems.length > 0 && (
        <div className="mobile-checkout-bar">
          <div className="mobile-checkout-summary">
            <span>Total: <strong>{formatMoney(grandTotal)}</strong></span>
            <span className="mobile-checkout-qty">{selectedQty} items</span>
          </div>
          <button 
            type="button" 
            className="btn-submit" 
            onClick={() => {
              const el = document.querySelector('.checkout-sidebar');
              if (el) {
                // Ensure it's scrolled enough to clear the floating bar
                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
          >
            Checkout Details
          </button>
        </div>
      )}
    </main>
  );
}
