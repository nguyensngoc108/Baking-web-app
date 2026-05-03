import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import api from '../services/httpServices';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/CartPage.css';

const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CartPage = () => {
  const navigate = useNavigate();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [cartItems, setCartItems] = useState(cartService.getCart());
  // prices keyed by cakeId — fetched from server, never from localStorage
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    const stored = cartService.getCart();
    if (stored.length === 0) { setLoadingPrices(false); return; }

    api.get('/cakes')
      .then(({ data }) => {
        const map = {};
        data.forEach(c => { map[c._id] = parseFloat(c.price); });
        setPrices(map);
      })
      .catch(() => {})
      .finally(() => setLoadingPrices(false));
  }, []);

  const handleQty = (cakeId, delta) => {
    const item = cartItems.find(i => i.cakeId === cakeId);
    if (!item) return;
    setCartItems(cartService.updateQuantity(cakeId, item.quantity + delta));
  };

  const handleRemove = (cakeId) => {
    setCartItems(cartService.removeItem(cakeId));
  };

  const total = cartItems.reduce((sum, i) => sum + (prices[i.cakeId] ?? 0) * i.quantity, 0);
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const pricesReady = !loadingPrices;

  return (
    <div className="cart-page">

      {/* Header */}
      <header className="cart-nav">
        <div className="cart-nav-inner">
          <div className="cart-nav-brand" onClick={() => navigate('/')}>
            <span className="cart-nav-title">S2UGAR</span>
          </div>
          <div className="nav-currency-toggle">
            <button
              className={`currency-btn${currency === 'NZD' ? ' active' : ''}`}
              onClick={() => setCurrency('NZD')}
            >NZD</button>
            <button
              className={`currency-btn${currency === 'USD' ? ' active' : ''}`}
              onClick={() => setCurrency('USD')}
            >USD</button>
          </div>

          <button className="cart-nav-back" onClick={() => navigate(-1)}>
            ← Continue Shopping
          </button>
        </div>
      </header>

      <main className="cart-main">
        <div className="cart-container">

          <div className="cart-heading">
            <BagIcon />
            <h1>Your Cart</h1>
            {count > 0 && <span className="cart-count-pill">{count} {count === 1 ? 'item' : 'items'}</span>}
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p className="cart-empty-text">Your cart is empty.</p>
              <button className="cart-empty-cta" onClick={() => navigate('/')}>
                Browse Cakes
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(item => {
                  const unitPrice = prices[item.cakeId];
                  return (
                    <div key={item.cakeId} className="cart-item">
                      <div className="cart-item-img">
                        {item.image
                          ? <img src={item.image} alt={item.name} />
                          : <div className="cart-item-placeholder" />}
                      </div>
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-unit">
                          {pricesReady
                            ? (unitPrice != null ? `${formatPrice(unitPrice)} each` : 'Price unavailable')
                            : '—'}
                        </p>
                      </div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => handleQty(item.cakeId, -1)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleQty(item.cakeId, 1)}>+</button>
                      </div>
                      <p className="cart-item-subtotal">
                        {pricesReady && unitPrice != null
                          ? formatPrice(unitPrice * item.quantity)
                          : '—'}
                      </p>
                      <button className="cart-item-remove" onClick={() => handleRemove(item.cakeId)} aria-label="Remove">×</button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Subtotal</span>
                  <span className="cart-total-value">
                    {pricesReady ? formatPrice(total) : '—'}
                  </span>
                </div>
                <p className="cart-note">Final price may vary based on size and customization</p>
                <button className="cart-checkout-btn" onClick={() => navigate('/order')}>
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </main>

    </div>
  );
};

export default CartPage;
