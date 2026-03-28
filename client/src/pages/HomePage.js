import React, { useState, useEffect, useRef } from 'react';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const HomePage = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHowToBuyModal, setShowHowToBuyModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock data for cakes
  const cakeOfTheWeek = {
    name: 'Strawberry Dream Cake',
    description: 'Light and fluffy vanilla sponge layered with fresh strawberries and cream',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
  };

  const birthdayCakes = [
    {
      id: 1,
      name: 'Rainbow Celebration',
      price: 45.99,
      image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=300&h=300&fit=crop',
    },
    {
      id: 2,
      name: 'Chocolate Fantasy',
      price: 42.99,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=300&fit=crop',
    },
    {
      id: 3,
      name: 'Unicorn Magic',
      price: 48.99,
      image: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b39f15?w=300&h=300&fit=crop',
    },
  ];

  const customerFeedbacks = [
    {
      id: 1,
      name: 'Sarah M.',
      feedback: 'The best cake I ever tasted! Perfect for my daughter\'s birthday.',
      rating: 5,
    },
    {
      id: 2,
      name: 'John D.',
      feedback: 'Amazing quality and beautiful design. Highly recommend!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Emily R.',
      feedback: 'Delicious and made with love. Will order again!',
      rating: 5,
    },
  ];

  const cakeGallery = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop',
      customer: 'Wedding Celebration',
      comment: 'A stunning 3-tier chocolate masterpiece',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=300&fit=crop',
      customer: 'Anniversary Special',
      comment: 'Elegant vanilla cake with fresh roses',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&h=300&fit=crop',
      customer: 'Baby Shower',
      comment: 'Adorable pastel-themed cake',
    },
  ];

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR Logo" className="nav-logo" />
            <span className="nav-title">S2UGAR</span>
          </div>
          
          <div className="nav-actions">
            <button className="nav-cart-btn" onClick={() => navigate('/order')}>
              <span className="cart-icon">🛒</span>
              <span className="cart-badge">{cartCount}</span>
            </button>
            
            {isLoggedIn ? (
              <div className="nav-user-menu" ref={dropdownRef}>
                <button 
                  className="nav-user-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  👤 Account ▼
                </button>
                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/account');
                        setShowUserDropdown(false);
                      }}
                    >
                      My Profile
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/orders');
                        setShowUserDropdown(false);
                      }}
                    >
                      My Orders
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/settings');
                        setShowUserDropdown(false);
                      }}
                    >
                      Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-item"
                      onClick={() => {
                        authService.logout();
                        setIsLoggedIn(false);
                        setShowUserDropdown(false);
                        navigate('/');
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth-buttons">
                <button className="nav-login-btn" onClick={() => navigate('/signin')}>Sign In</button>
              </div>
            )}
            
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to S2UGAR</h1>
          <p className="hero-subtitle">Handcrafted cakes made with love, one slice at a time</p>
        </div>
      </section>

      {/* SECTION 1: Our Sweet Corner */}
      <section className="main-section section-sweet-corner">
        <div className="container">
          <h2 className="section-title">Our Sweet Corner</h2>
          <div className="two-column-grid">
            {/* About the Baker */}
            <div className="feature-card" onClick={() => setShowAboutModal(true)}>
              <div className="card-icon">🍰</div>
              <h3>About the Baker</h3>
              <p>Discover our story, passion, and commitment to creating the perfect cake for you</p>
              <button className="card-button">Learn More →</button>
            </div>

            {/* Cake Studio */}
            <div className="feature-card">
              <div className="card-icon">✨</div>
              <h3>Cake Studio</h3>
              <p>Browse our gallery of custom cakes and customer celebrations</p>
              <button className="card-button">View Gallery →</button>
            </div>
          </div>

          {/* Cake Gallery Preview */}
          <div className="gallery-preview">
            <h3 className="subsection-title">Recent Creations</h3>
            <div className="gallery-grid">
              {cakeGallery.map((item) => (
                <div key={item.id} className="gallery-item">
                  <img src={item.image} alt={item.customer} />
                  <div className="gallery-overlay">
                    <h4>{item.customer}</h4>
                    <p>{item.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Your Sweet Choice */}
      <section className="main-section section-sweet-choice">
        <div className="container">
          <h2 className="section-title">Your Sweet Choice</h2>
          
          {/* Cake of the Week */}
          <div className="featured-cake">
            <h3 className="subsection-title">Cake of the Week</h3>
            <div className="cake-showcase">
              <div className="cake-image-container">
                <img src={cakeOfTheWeek.image} alt={cakeOfTheWeek.name} />
                <span className="badge-special">Special</span>
              </div>
              <div className="cake-details">
                <h4>{cakeOfTheWeek.name}</h4>
                <p>{cakeOfTheWeek.description}</p>
                <div className="cake-price">${cakeOfTheWeek.price}</div>
                <button className="order-button" onClick={() => {
                  setCartCount(cartCount + 1);
                  navigate('/order');
                }}>Order Now</button>
              </div>
            </div>
          </div>

          {/* Birthday Cakes */}
          <div className="category-section">
            <h3 className="subsection-title">Birthday Cakes</h3>
            <div className="cakes-grid">
              {birthdayCakes.map((cake) => (
                <div key={cake.id} className="cake-card">
                  <img src={cake.image} alt={cake.name} />
                  <div className="cake-card-content">
                    <h4>{cake.name}</h4>
                    <div className="cake-card-price">${cake.price}</div>
                    <button className="cake-card-button" onClick={() => {
                      setCartCount(cartCount + 1);
                      navigate('/order');
                    }}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-container">
              <button className="view-all-button">View All Birthday Cakes →</button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Customer Corner */}
      <section className="main-section section-customer-corner">
        <div className="container">
          <h2 className="section-title">Customer Corner</h2>
          
          <div className="two-column-grid">
            {/* How to Buy */}
            <div className="info-card" onClick={() => setShowHowToBuyModal(true)}>
              <div className="info-icon">�</div>
              <h3>How to Buy</h3>
              <p>Step-by-step guide to ordering your perfect cake</p>
              <button className="info-button">Read Guide →</button>
            </div>

            {/* Small Feedback */}
            <div className="info-card">
              <div className="info-icon">⭐</div>
              <h3>Customer Reviews</h3>
              <p>See what our happy customers are saying</p>
              <button className="info-button">Read Reviews →</button>
            </div>
          </div>

          {/* Feedback Preview */}
          <div className="feedback-preview">
            <h3 className="subsection-title">What Our Customers Say</h3>
            <div className="feedback-grid">
              {customerFeedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-card">
                  <div className="stars">
                    {'⭐'.repeat(feedback.rating)}
                  </div>
                  <p className="feedback-text">"{feedback.feedback}"</p>
                  <p className="feedback-author">- {feedback.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Our Sweet Corner</h4>
              <p>Baking happiness since 2020</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: hello@oursweetcorner.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <div className="footer-section">
              <h4>Hours</h4>
              <p>Mon-Sat: 9am - 6pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 S2UGAR. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAboutModal(false)}>×</button>
            <h2>About the Baker</h2>
            <div className="modal-body">
              <p>
                Welcome to S2UGAR! We are a passionate team of bakers dedicated to creating 
                memorable moments through our handcrafted cakes.
              </p>
              <p>
                Every cake we create is made from scratch using only the finest ingredients. From 
                classic favorites to custom designs, we put our heart into every creation.
              </p>
              <h3>Our Story</h3>
              <p>
                Founded in 2020, S2UGAR started as a small home bakery with a big dream: 
                to bring joy to every celebration. Today, we're proud to serve our community with 
                delicious, beautiful cakes made with love.
              </p>
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

      {/* How to Buy Modal */}
      {showHowToBuyModal && (
        <div className="modal-overlay" onClick={() => setShowHowToBuyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowHowToBuyModal(false)}>×</button>
            <h2>How to Order Your Cake</h2>
            <div className="modal-body">
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Browse Our Selection</h3>
                    <p>Explore our cake categories and find the perfect design for your occasion.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Contact Us</h3>
                    <p>Reach out via email or phone with your cake choice and any customization requests.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Confirm Details</h3>
                    <p>We'll discuss flavors, size, design details, and delivery/pickup date.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Place Your Order</h3>
                    <p>Finalize your order with a deposit. We'll send you a confirmation email.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h3>Enjoy Your Cake!</h3>
                    <p>Pick up your cake or we'll deliver it fresh to your door. Celebrate!</p>
                  </div>
                </div>
              </div>
              <div className="contact-info-box">
                <h3>Ready to Order?</h3>
                <p>📧 Email: hello@s2ugar.com</p>
                <p>📞 Phone: (555) 123-4567</p>
                <p>⏰ Orders require 48 hours notice</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
