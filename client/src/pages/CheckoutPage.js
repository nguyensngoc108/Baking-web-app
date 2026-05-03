import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutPage.css';
import api from '../services/httpServices';
import cartService from '../services/cartService';
import authService from '../services/authService';
import { useCurrency } from '../context/CurrencyContext';

const SQUARE_SCRIPT_URL = process.env.REACT_APP_SQUARE_ENVIRONMENT === 'production'
  ? 'https://web.squarecdn.com/v1/square.js'
  : 'https://sandbox.web.squarecdn.com/v1/square.js';

const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MIN_DAYS_AHEAD = 2;
const DELIVERY_FEE_NZD = 5;

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + MIN_DAYS_AHEAD);
  return d.toISOString().split('T')[0];
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const squareCardRef = useRef(null);
  const squareInitRef = useRef(false);

  const [cartItems] = useState(() => cartService.getCart());
  const [prices, setPrices] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [squareMounted, setSquareMounted] = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [squareError, setSquareError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'New Zealand',
    deliveryDate: '',
    note: '',
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  // Auth — pre-fill contact info if logged in
  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;
    setIsLoggedIn(true);
    api.get('/user/profile')
      .then(({ data }) => {
        setUserName([data.firstName, data.lastName].filter(Boolean).join(' ') || 'Account');
        setForm(prev => ({
          ...prev,
          email: data.email || '',
          phone: data.phone || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        }));
      })
      .catch(() => setUserName('Account'));
  }, []);

  // Fetch real prices from server
  useEffect(() => {
    api.get('/cakes')
      .then(({ data }) => {
        const map = {};
        data.forEach(c => { map[c._id] = parseFloat(c.price); });
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  // Mount Square card container the first time Card is selected
  useEffect(() => {
    if (paymentMethod === 'square') setSquareMounted(true);
  }, [paymentMethod]);

  // Initialise Square card form once the container div is in the DOM
  useEffect(() => {
    if (!squareMounted || squareInitRef.current) return;

    const initCard = async () => {
      if (!window.Square) return;
      const appId = process.env.REACT_APP_SQUARE_APP_ID;
      const locationId = process.env.REACT_APP_SQUARE_LOCATION_ID;
      if (!appId || !locationId) {
        setSquareError('Square is not configured (missing REACT_APP_SQUARE_APP_ID or REACT_APP_SQUARE_LOCATION_ID in client .env).');
        return;
      }
      try {
        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card();
        await card.attach('#square-card-container');
        squareCardRef.current = card;
        squareInitRef.current = true;
        setSquareReady(true);
      } catch (err) {
        console.error('[Square] Card init error:', err);
        setSquareError(err?.message || 'Failed to load card form. Please use cash on delivery.');
      }
    };

    if (window.Square) { initCard(); return; }

    const existing = document.getElementById('sq-sdk');
    if (existing) {
      existing.addEventListener('load', initCard);
      return () => existing.removeEventListener('load', initCard);
    }

    const script = document.createElement('script');
    script.id = 'sq-sdk';
    script.src = SQUARE_SCRIPT_URL;
    script.addEventListener('load', initCard);
    script.addEventListener('error', () =>
      setSquareError('Failed to load Square SDK. Please use cash on delivery.'));
    document.head.appendChild(script);
  }, [squareMounted]);

  // Derived totals (prices from server, not localStorage)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (prices[item.cakeId] || 0) * item.quantity, 0,
  );
  const deliveryFee = deliveryOption === 'delivery' ? DELIVERY_FEE_NZD : 0;
  const discount = voucherApplied ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - discount;
  const minDate = getMinDate();

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleApplyVoucher = () => {
    if (voucherCode.trim()) setVoucherApplied(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError('');

    if (!form.deliveryDate) {
      setSubmitError('Please select a delivery or pickup date.');
      return;
    }

    if (deliveryOption === 'delivery' && !form.address.trim()) {
      setSubmitError('Please enter your delivery address.');
      return;
    }

    let squareSourceId = null;
    if (paymentMethod === 'square') {
      if (!squareReady || !squareCardRef.current) {
        setSubmitError('Card form is not ready. Please wait or choose cash on delivery.');
        return;
      }
      const tokenResult = await squareCardRef.current.tokenize();
      if (tokenResult.status !== 'OK') {
        setSubmitError(tokenResult.errors?.[0]?.message || 'Card tokenization failed.');
        return;
      }
      squareSourceId = tokenResult.token;
    }

    const fullAddress = deliveryOption === 'delivery'
      ? [form.address, form.apartment, form.city, form.postalCode, form.country]
          .filter(Boolean).join(', ')
      : 'In-store pickup';

    const payload = {
      items: cartService.getOrderItems(),
      address: fullAddress,
      deliveryDate: form.deliveryDate,
      note: form.note,
      guestEmail: form.email,
      guestPhone: form.phone,
      paymentMethod,
      ...(squareSourceId && { squareSourceId }),
    };

    setLoading(true);
    try {
      const { data } = await api.post('/orders', payload);
      cartService.clearCart();
      navigate('/order-success', {
        state: {
          order: data.data,
          items: cartItems,
          prices,
          paymentMethod,
          total,
        },
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">

      {/* ── Minimal Navbar ── */}
      <nav className="co-nav">
        <div className="co-nav-inner">
          <div className="co-nav-brand" onClick={() => navigate('/')}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR" className="co-nav-logo" />
            <span className="co-nav-title">S2UGAR</span>
          </div>
          <div className="co-nav-actions">
            <button className="co-nav-cart-btn" onClick={() => navigate('/cart')} aria-label="Cart">
              <BagIcon />
              {cartItems.length > 0 && (
                <span className="co-cart-badge">{cartService.getCount()}</span>
              )}
            </button>
            {isLoggedIn
              ? <span className="co-nav-user">{userName}</span>
              : <button className="co-nav-signin-btn" onClick={() => navigate('/signin')}>Sign In</button>
            }
          </div>
        </div>
      </nav>

      <div className="co-layout">

        {/* ── LEFT: Form ── */}
        <form className="co-form" onSubmit={handleSubmit} noValidate>

          {/* Contact */}
          <section className="co-section">
            <h2 className="co-section-title">Contact</h2>
            <div className="co-field">
              <label htmlFor="co-email">Email</label>
              <input
                id="co-email" type="email" name="email"
                value={form.email} onChange={handleChange}
                required placeholder="your@email.com" autoComplete="email"
              />
            </div>
            <div className="co-field">
              <label htmlFor="co-phone">Phone</label>
              <input
                id="co-phone" type="tel" name="phone"
                value={form.phone} onChange={handleChange}
                required placeholder="+64 21 000 0000" autoComplete="tel"
              />
            </div>
          </section>

          {/* Shipping */}
          <section className="co-section">
            <h2 className="co-section-title">Shipping</h2>

            <div className="co-delivery-toggle">
              <button
                type="button"
                className={`co-toggle-btn${deliveryOption === 'delivery' ? ' active' : ''}`}
                onClick={() => setDeliveryOption('delivery')}
              >Delivery</button>
              <button
                type="button"
                className={`co-toggle-btn${deliveryOption === 'pickup' ? ' active' : ''}`}
                onClick={() => setDeliveryOption('pickup')}
              >Pick Up</button>
            </div>

            {deliveryOption === 'delivery' && (
              <>
                <div className="co-field">
                  <label htmlFor="co-country">Country / Region</label>
                  <select id="co-country" name="country" value={form.country} onChange={handleChange}>
                    <option value="New Zealand">New Zealand</option>
                  </select>
                </div>

                <div className="co-row">
                  <div className="co-field">
                    <label htmlFor="co-first">First Name</label>
                    <input
                      id="co-first" type="text" name="firstName"
                      value={form.firstName} onChange={handleChange}
                      required placeholder="First name" autoComplete="given-name"
                    />
                  </div>
                  <div className="co-field">
                    <label htmlFor="co-last">Last Name</label>
                    <input
                      id="co-last" type="text" name="lastName"
                      value={form.lastName} onChange={handleChange}
                      required placeholder="Last name" autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="co-field">
                  <label htmlFor="co-addr">Address</label>
                  <input
                    id="co-addr" type="text" name="address"
                    value={form.address} onChange={handleChange}
                    required placeholder="Street address" autoComplete="street-address"
                  />
                </div>

                <div className="co-field">
                  <label htmlFor="co-apt">
                    Apartment, suite, etc. <span className="co-optional">(optional)</span>
                  </label>
                  <input
                    id="co-apt" type="text" name="apartment"
                    value={form.apartment} onChange={handleChange}
                    placeholder="Apt, unit, suite…" autoComplete="address-line2"
                  />
                </div>

                <div className="co-row">
                  <div className="co-field">
                    <label htmlFor="co-city">City</label>
                    <input
                      id="co-city" type="text" name="city"
                      value={form.city} onChange={handleChange}
                      required placeholder="Auckland" autoComplete="address-level2"
                    />
                  </div>
                  <div className="co-field">
                    <label htmlFor="co-postal">Postal Code</label>
                    <input
                      id="co-postal" type="text" name="postalCode"
                      value={form.postalCode} onChange={handleChange}
                      required placeholder="1010" autoComplete="postal-code"
                    />
                  </div>
                </div>
              </>
            )}

            {deliveryOption === 'pickup' && (
              <p className="co-pickup-note">
                You'll pick up your order from our store. We'll be in touch to confirm your pickup time.
              </p>
            )}

            <div className="co-field">
              <label htmlFor="co-date">
                {deliveryOption === 'delivery' ? 'Delivery Date' : 'Pickup Date'}
              </label>
              <input
                id="co-date" type="date" name="deliveryDate"
                value={form.deliveryDate} onChange={handleChange}
                required min={minDate}
              />
              <span className="co-hint">Minimum 48 hours notice required</span>
            </div>

            <div className="co-field">
              <label htmlFor="co-note">
                Note <span className="co-optional">(optional)</span>
              </label>
              <textarea
                id="co-note" name="note"
                value={form.note} onChange={handleChange}
                placeholder="Allergies, special instructions, cake message…"
                rows={3}
              />
            </div>
          </section>

          {/* Payment */}
          <section className="co-section">
            <h2 className="co-section-title">Payment</h2>

            <div className="co-payment-options">
              <label className={`co-payment-opt${paymentMethod === 'square' ? ' active' : ''}`}>
                <input
                  type="radio" name="pm" value="square"
                  checked={paymentMethod === 'square'}
                  onChange={() => setPaymentMethod('square')}
                />
                <div className="co-pm-label">
                  <span className="co-pm-name">Card</span>
                  <span className="co-pm-sub">Visa, Mastercard via Square</span>
                </div>
              </label>

              <label className={`co-payment-opt${paymentMethod === 'cash_on_delivery' ? ' active' : ''}`}>
                <input
                  type="radio" name="pm" value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                />
                <div className="co-pm-label">
                  <span className="co-pm-name">Cash on Delivery</span>
                  <span className="co-pm-sub">Pay when you receive or pick up</span>
                </div>
              </label>
            </div>

            {/* Square card form — always kept in DOM once mounted to prevent re-init */}
            {squareMounted && (
              <div className={`co-square-wrap${paymentMethod !== 'square' ? ' co-sq-hidden' : ''}`}>
                <div id="square-card-container" />
                {!squareReady && !squareError && (
                  <p className="co-sq-loading">Loading secure card form…</p>
                )}
                {squareError && <p className="co-sq-error">{squareError}</p>}
              </div>
            )}

            {paymentMethod === 'cash_on_delivery' && (
              <p className="co-cod-note">Pay in cash when your order is delivered or picked up.</p>
            )}
          </section>

          {submitError && <div className="co-error">{submitError}</div>}

          <button
            type="submit"
            className="co-pay-btn"
            disabled={loading || cartItems.length === 0}
          >
            {loading ? 'Processing…' : `Pay ${formatPrice(total)}`}
          </button>
        </form>

        {/* ── RIGHT: Order Summary ── */}
        <aside className="co-summary">

          <div className="co-items">
            {cartItems.map(item => {
              const price = prices[item.cakeId] || 0;
              return (
                <div key={item.cakeId} className="co-item">
                  <div className="co-item-img-wrap">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="co-item-img" />
                      : <div className="co-item-img-ph" />
                    }
                    <span className="co-item-qty">{item.quantity}</span>
                  </div>
                  <p className="co-item-name">{item.name}</p>
                  <p className="co-item-price">{price > 0 ? formatPrice(price * item.quantity) : '—'}</p>
                </div>
              );
            })}
          </div>

          <div className="co-voucher">
            <input
              type="text"
              className="co-voucher-input"
              placeholder="Discount code"
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value)}
              disabled={voucherApplied}
            />
            <button
              type="button"
              className="co-voucher-btn"
              onClick={handleApplyVoucher}
              disabled={voucherApplied || !voucherCode.trim()}
            >
              {voucherApplied ? '✓ Applied' : 'Apply'}
            </button>
          </div>

          <div className="co-totals">
            <div className="co-total-row">
              <span>Subtotal</span>
              <span>{subtotal > 0 ? formatPrice(subtotal) : '—'}</span>
            </div>
            <div className="co-total-row">
              <span>Delivery</span>
              <span>{deliveryOption === 'delivery' ? formatPrice(deliveryFee) : 'Free'}</span>
            </div>
            {voucherApplied && (
              <div className="co-total-row co-discount">
                <span>Discount (10%)</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="co-total-row co-grand">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            {paymentMethod === 'square' && (
              <p className="co-currency-note">All charges in NZD.</p>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
