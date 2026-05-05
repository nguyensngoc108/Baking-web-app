import React, { useState, useEffect, useRef } from 'react';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/httpServices';
import cartService from '../services/cartService';
import { useCurrency } from '../context/CurrencyContext';

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const HomePage = () => {
  const navigate                    = useNavigate();
  const dropdownRef                 = useRef(null);
  const { currency, setCurrency, formatPrice } = useCurrency();

  const [showAboutModal, setShowAboutModal]       = useState(false);
  const [showHowToBuyModal, setShowHowToBuyModal] = useState(false);
  const [cartCount, setCartCount]                 = useState(() => cartService.getCount());
  const [isLoggedIn, setIsLoggedIn]               = useState(false);
  const [showUserDropdown, setShowUserDropdown]   = useState(false);
  const [userName, setUserName]                   = useState('');
  const [categories, setCategories]               = useState([]);
  const [signatureCakes, setSignatureCakes]        = useState([]);

  // Auth check
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsLoggedIn(true);
      api.get('/user/profile')
        .then(({ data }) => {
          const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
          setUserName(name || 'Account');
        })
        .catch(() => setUserName('Account'));
    }
  }, []);

  // Scroll fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('scroll-fade-in'), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -8%' },
    );
    document.querySelectorAll('.main-section').forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Sync cart count when localStorage changes (other tabs or cartService.clearCart)
  useEffect(() => {
    const sync = () => setCartCount(cartService.getCount());
    window.addEventListener('cartUpdated', sync);
    return () => window.removeEventListener('cartUpdated', sync);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch categories and cakes from API
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {});

    api.get('/cakes')
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSignatureCakes(sorted.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const customerFeedbacks = [
    { id: 1, name: 'Sarah M.', feedback: 'The best cake I ever tasted! Perfect for my daughter\'s birthday.' },
    { id: 2, name: 'John D.',  feedback: 'Amazing quality and beautiful design. Highly recommend!' },
    { id: 3, name: 'Emily R.', feedback: 'Delicious and made with love. Will order again!' },
    { id: 4, name: 'Michael T.', feedback: 'Exceptional service and even better cakes. Worth every penny!' },
  ];


  return (
    <div className="home-page">

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
            <button onClick={() => setShowAboutModal(true)}>Our Story</button>
            <button onClick={() => setShowHowToBuyModal(true)}>Contact</button>
          </div>

          <div className="nav-actions">
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

            <button className="nav-cart-btn" onClick={() => navigate('/cart')}>
              <BagIcon />
              {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
            </button>

            {isLoggedIn ? (
              <div className="nav-user-menu" ref={dropdownRef}>
                <button
                  className="nav-user-btn"
                  onClick={() => setShowUserDropdown(v => !v)}
                >
                  {userName} ▾
                </button>
                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <button className="dropdown-item" onClick={() => { navigate('/account'); setShowUserDropdown(false); }}>My Profile</button>
                    <button className="dropdown-item" onClick={() => { navigate('/orders'); setShowUserDropdown(false); }}>My Orders</button>
                    <button className="dropdown-item" onClick={() => { navigate('/settings'); setShowUserDropdown(false); }}>Settings</button>
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

      {/* ── Hero ── */}
      <section className="hero-section main-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-heading">
              Handcrafted Cakes<br /><em>Made with Love</em>
            </h1>
            <p className="hero-subtext">
              One slice at a time, we bring joy to every celebration
            </p>
            <button className="hero-cta" onClick={() => navigate('/menu')}>
              Explore Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="categories-section main-section">
        <div className="container">
          <h2 className="section-title">Shop by Occasion</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <button key={cat._id} className="category-item" onClick={() => navigate(`/menu/${cat.slug}`)}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signature Cakes ── */}
      <section className="cakes-section main-section">
        <div className="container">
          <h2 className="section-title">Customers Love</h2>
          <p className="cakes-section-sub">Our signature cakes that keep customers coming back</p>
          <div className="cakes-grid">
            {signatureCakes.map((cake) => (
              <div key={cake._id} className="cake-card" onClick={() => navigate(`/product/${cake._id}`)}>
                <div className="cake-card-image">
                  {cake.image
                    ? <img src={cake.image} alt={cake.name} />
                    : <div className="cake-card-placeholder" />
                  }
                  <div className="cake-card-overlay">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      cartService.addItem(cake);
                      setCartCount(cartService.getCount());
                    }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="cake-card-info">
                  <h4 className="cake-card-name">{cake.name}</h4>
                  <p className="cake-card-price">{formatPrice(parseFloat(cake.price))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="reviews-section main-section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="feedback-grid">
            {customerFeedbacks.map((fb) => (
              <div key={fb.id} className="feedback-card">
                <p className="feedback-text">{fb.feedback}</p>
                <p className="feedback-author">{fb.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>S2UGAR</h4>
              <p>Handcrafted cakes made with love and passion</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>hello@s2ugar.com</p>
              <p>(555) 123-4567</p>
            </div>
            <div className="footer-section">
              <h4>Hours</h4>
              <p>Mon–Sat: 9am – 6pm</p>
              <p>Sunday: Closed</p>
            </div>
            <div className="footer-section">
              <h4>Follow</h4>
              <a href="https://www.instagram.com/s2ugarr" target="_blank" rel="noopener noreferrer" className="social-link">
                Instagram
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2025 S2UGAR. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ── About Modal ── */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAboutModal(false)}>×</button>
            <h2>About S2UGAR</h2>
            <div className="modal-body">
              <p>Welcome to S2UGAR! We are a passionate team of bakers dedicated to creating memorable moments through our handcrafted cakes.</p>
              <p>Every cake we create is made from scratch using only the finest ingredients. From classic favorites to custom designs, we put our heart into every creation.</p>
              <h3>Our Story</h3>
              <p>Founded in 2020, S2UGAR started as a small home bakery with a big dream: to bring joy to every celebration. Today, we're proud to serve our community with delicious, beautiful cakes made with love.</p>
              <h3>Our Promise</h3>
              <ul>
                <li>Fresh, high-quality ingredients</li>
                <li>Custom designs tailored to your vision</li>
                <li>Exceptional taste and presentation</li>
                <li>Timely delivery and excellent service</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── How to Order Modal ── */}
      {showHowToBuyModal && (
        <div className="modal-overlay" onClick={() => setShowHowToBuyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowHowToBuyModal(false)}>×</button>
            <h2>How to Order</h2>
            <div className="modal-body">
              <div className="steps">
                {[
                  { title: 'Browse Our Selection', desc: 'Explore our cake categories and find the perfect design for your occasion.' },
                  { title: 'Select Your Cake',     desc: 'Choose flavors, size, packaging, and any customizations.' },
                  { title: 'Add to Bag',           desc: 'Add your cake to bag and proceed to checkout.' },
                  { title: 'Place Your Order',     desc: 'Complete payment and provide delivery or pickup preferences.' },
                  { title: 'Enjoy Your Cake',      desc: 'Pick up or we\'ll deliver it fresh to your door. Celebrate!' },
                ].map((step, i) => (
                  <div key={i} className="step">
                    <div className="step-number">{i + 1}</div>
                    <div className="step-content">
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="contact-info-box">
                <h3>Questions? Get in Touch</h3>
                <p>Email: hello@s2ugar.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Orders require 48 hours notice</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
