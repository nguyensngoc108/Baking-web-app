import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/httpServices';
import cartService from '../services/cartService';
import authService from '../services/authService';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/ProductPage.css';

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`accordion-chevron${open ? ' open' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ProductPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dropdownRef = useRef(null);
  const { currency, setCurrency, formatPrice } = useCurrency();

  const [cake, setCake]             = useState(null);
  const [related, setRelated]       = useState([]);
  const [quantity, setQuantity]     = useState(1);
  const [added, setAdded]           = useState(false);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState({ description: false, ingredients: false });

  const [cartCount, setCartCount]           = useState(() => cartService.getCount());
  const [isLoggedIn, setIsLoggedIn]         = useState(false);
  const [userName, setUserName]             = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Auth
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsLoggedIn(true);
      api.get('/user/profile')
        .then(({ data }) => setUserName([data.firstName, data.lastName].filter(Boolean).join(' ') || 'Account'))
        .catch(() => setUserName('Account'));
    }
  }, []);

  // Cart sync
  useEffect(() => {
    const sync = () => setCartCount(cartService.getCount());
    window.addEventListener('cartUpdated', sync);
    return () => window.removeEventListener('cartUpdated', sync);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch cake + related
  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    setOpen({ description: false, ingredients: false });

    api.get(`/cakes/${id}`)
      .then(({ data }) => {
        setCake(data);
        return api.get('/cakes').then(({ data: all }) => {
          const others = all.filter(c => c._id !== data._id && c.category === data.category && !c.deleted);
          const sorted = others.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRelated(sorted.slice(0, 4));
        });
      })
      .catch(() => setCake(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!cake) return;
    cartService.addItem(cake, quantity);
    setCartCount(cartService.getCount());
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-loading-screen">Loading…</div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="product-page">
        <div className="product-not-found">
          <p>Product not found.</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/')}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR" className="nav-logo" />
            <span className="nav-title">S2UGAR</span>
          </div>
          <div className="nav-menu">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
            <a href="/menu" onClick={(e) => { e.preventDefault(); navigate('/menu'); }}>Products</a>
          </div>
          <div className="nav-actions">
            <div className="nav-currency-toggle">
              <button className={`currency-btn${currency === 'NZD' ? ' active' : ''}`} onClick={() => setCurrency('NZD')}>NZD</button>
              <button className={`currency-btn${currency === 'USD' ? ' active' : ''}`} onClick={() => setCurrency('USD')}>USD</button>
            </div>
            <button className="nav-cart-btn" onClick={() => navigate('/cart')}>
              <BagIcon />
              {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
            </button>
            {isLoggedIn ? (
              <div className="nav-user-menu" ref={dropdownRef}>
                <button className="nav-user-btn" onClick={() => setShowUserDropdown(v => !v)}>
                  {userName} ▾
                </button>
                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <button className="dropdown-item" onClick={() => { navigate('/account'); setShowUserDropdown(false); }}>My Profile</button>
                    <button className="dropdown-item" onClick={() => { navigate('/orders'); setShowUserDropdown(false); }}>My Orders</button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={() => { authService.logout(); setIsLoggedIn(false); setShowUserDropdown(false); navigate('/'); }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav-login-btn" onClick={() => navigate('/signin')}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Product Detail ── */}
      <main className="product-main">
        <div className="product-container">

          {/* Breadcrumb */}
          <nav className="product-breadcrumb">
            <button onClick={() => navigate('/')}>Home</button>
            <span>/</span>
            <span>{cake.name}</span>
          </nav>

          {/* Detail grid */}
          <div className="product-detail-grid">

            {/* Left – image */}
            <div className="product-image-col">
              {cake.image
                ? <img src={cake.image} alt={cake.name} className="product-image" />
                : <div className="product-image-placeholder" />}
            </div>

            {/* Right – info */}
            <div className="product-info-col">
              {cake.category && <p className="product-category">{cake.category}</p>}
              <h1 className="product-name">{cake.name}</h1>
              <p className="product-price">{formatPrice(parseFloat(cake.price))}</p>

              {/* Quantity */}
              <div className="product-qty-row">
                <span className="product-qty-label">Quantity</span>
                <div className="product-qty-ctrl">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >−</button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => q + 1)}
                  >+</button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                className={`product-atc-btn${added ? ' added' : ''}`}
                onClick={handleAddToCart}
              >
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>

              {/* Accordions */}
              <div className="product-accordions">

                <div className="accordion-item">
                  <button className="accordion-trigger" onClick={() => toggle('description')}>
                    <span>Description</span>
                    <ChevronIcon open={open.description} />
                  </button>
                  {open.description && (
                    <div className="accordion-body">
                      <p>{cake.description || 'No description available.'}</p>
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button className="accordion-trigger" onClick={() => toggle('ingredients')}>
                    <span>Ingredients</span>
                    <ChevronIcon open={open.ingredients} />
                  </button>
                  {open.ingredients && (
                    <div className="accordion-body">
                      {cake.ingredients && cake.ingredients.length > 0 ? (
                        <ul className="ingredient-list">
                          {cake.ingredients.map((ing, i) => (
                            <li key={i}>{ing.ingredientId?.name ?? ing.name ?? 'Unknown'}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No ingredients listed.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── You May Also Like ── */}
          {related.length > 0 && (
            <section className="related-section">
              <h2 className="related-title">You May Also Like</h2>
              <div className="related-grid">
                {related.map(c => (
                  <div
                    key={c._id}
                    className="related-card"
                    onClick={() => navigate(`/product/${c._id}`)}
                  >
                    <div className="related-card-img">
                      {c.image
                        ? <img src={c.image} alt={c.name} />
                        : <div className="related-placeholder" />}
                    </div>
                    <div className="related-card-info">
                      <p className="related-name">{c.name}</p>
                      <p className="related-price">{formatPrice(parseFloat(c.price))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

    </div>
  );
};

export default ProductPage;
