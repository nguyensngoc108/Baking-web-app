import React, { useState, useEffect, useRef } from 'react';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/httpServices';

const HomePage = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHowToBuyModal, setShowHowToBuyModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userName, setUserName] = useState('user');
  const [categories, setCategories] = useState([
    'Birthday_Cakes', 'Wedding_Cakes', 'Anniversary_Cakes', 'Graduation_Cakes', 'Custom_Cakes', 'Seasonal_Cakes'
  ]);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsLoggedIn(true);
      // Fetch user profile data
      api.get('/user/profile')
        .then((response) => {
          const { firstName, lastName } = response.data;
          if (firstName && lastName) {
            setUserName(`${firstName} ${lastName}`);
          } else if (firstName) {
            setUserName(firstName);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch user profile:', error);
          setUserName('user');
        });
    }
  }, []);

  // Scroll animation setup - with responsive trigger points
  useEffect(() => {
    // Adjust rootMargin based on screen size for responsive animations
    const rootMargin = window.innerHeight < 768 ? '0px 0px -30%' : '0px 0px -10%';
    
    const observerOptions = {
      threshold: 0.05,
      rootMargin: rootMargin
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add slight delay for staggered animation effect
          setTimeout(() => {
            entry.target.classList.add('scroll-fade-in');
          }, index * 100); // 100ms delay between sections
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all main-section elements
    const sections = document.querySelectorAll('.main-section');
    sections.forEach((section) => {
      observer.observe(section);
    });

    // Handle window resize for responsive observer
    const handleResize = () => {
      // Update observer on resize if needed
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
      window.removeEventListener('resize', handleResize);
    };
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
  const signatureCakes = [
    {
      id: 1,
      name: 'Strawberry Dream',
      price: 32.99,
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
      description: 'Light vanilla sponge with fresh strawberries and cream'
    },
    {
      id: 2,
      name: 'Chocolate Symphony',
      price: 35.99,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
      description: 'Rich dark chocolate layers with ganache'
    },
    {
      id: 3,
      name: 'Vanilla Bliss',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
      description: 'Classic vanilla cake with buttercream frosting'
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
    {
      id: 4,
      name: 'Michael T.',
      feedback: 'Exceptional service and even better cakes. Worth every penny!',
      rating: 5,
    },
  ];

  const handleCategoryClick = (category) => {
    navigate(`/menu/${category.toLowerCase()}`);
  };

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR Logo" className="nav-logo" />
            <span className="nav-title">S2UGAR</span>
          </div>
          
          <div className="nav-menu">
            <a href="#home" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
            <a href="#menu" onClick={(e) => { e.preventDefault(); navigate('/menu'); }}>Products</a>
            <button onClick={() => setShowAboutModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 500 }}>
              Our Story
            </button>
            <button onClick={() => setShowHowToBuyModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 500 }}>
              Contact
            </button>
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
                  Hello, {userName} ▼
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

      {/* SECTION 1: Intro Section */}
      <section className="main-section" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent-color) 100%)', padding: 'clamp(60px, 10vh, 100px) 0' }}>
        <div className="container">
          <div className="hero-content" style={{ textAlign: 'center' }}>
            <h1 className="hero-title" style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>Handcrafted Cakes Made with Love</h1>
            <p className="hero-subtitle" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', marginBottom: '30px' }}>
              One slice at a time, we bring joy to every celebration
            </p>
            <button 
              onClick={() => navigate('/menu')}
              style={{
                background: 'var(--white)',
                color: 'var(--primary-color)',
                border: 'none',
                padding: '15px 40px',
                borderRadius: '30px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 20px rgba(218, 171, 181, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Explore Menu →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Categories Section */}
      <section className="main-section" style={{ background: 'var(--white)', padding: 'clamp(50px, 8vh, 80px) 0' }}>
        <div className="container">
          <h2 className="section-title">Explore Our Categories</h2>
          <div className="categories-grid">
            {categories.map((category, index) => {
              const categoryName = category.replace(/_/g, ' ');
              const categoryPath = categoryName.split(' ')[0].toLowerCase();
              return (
                <div 
                  key={index}
                  className="category-item"
                  onClick={() => navigate(`/menu/${categoryPath}`)}
                  title={categoryName}
                >
                  {category}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Customers Love Section */}
      <section className="main-section" style={{ background: 'var(--cream)', padding: 'clamp(50px, 8vh, 80px) 0' }}>
        <div className="container">
          <h2 className="section-title">Customers Love</h2>
          <p style={{ textAlign: 'center', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', color: 'var(--text-light)', marginBottom: 'clamp(30px, 5vh, 40px)' }}>
            Our signature cakes that keep customers coming back
          </p>
          <div className="cakes-grid">
            {signatureCakes.map((cake) => (
              <div key={cake.id} className="cake-card">
                <img src={cake.image} alt={cake.name} />
                <div className="cake-card-content">
                  <div>
                    <h4>{cake.name}</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '10px' }}>{cake.description}</p>
                  </div>
                  <div className="cake-card-bottom">
                    <div className="cake-card-price">${cake.price}</div>
                    <button className="cake-card-button" onClick={() => {
                      setCartCount(cartCount + 1);
                      navigate('/order');
                    }} title="Add to Cart">
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Reviews Section */}
      <section className="main-section" style={{ background: 'var(--accent-color)', padding: 'clamp(50px, 8vh, 80px) 0' }}>
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
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
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>S2UGAR</h4>
              <p>Handcrafted cakes made with love and passion</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: hello@s2ugar.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <div className="footer-section">
              <h4>Hours</h4>
              <p>Mon-Sat: 9am - 6pm</p>
              <p>Sunday: Closed</p>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <a href="https://www.instagram.com/s2ugarr" target="_blank" rel="noopener noreferrer" className="social-link">
                Instagram
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 S2UGAR. All rights reserved. | Crafted with 💕</p>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAboutModal(false)}>×</button>
            <h2>About S2UGAR</h2>
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

      {/* Contact/How to Buy Modal */}
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
                    <h3>Select Your Cake</h3>
                    <p>Choose flavors, size, packaging, and any customizations you'd like.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Add to Cart</h3>
                    <p>Add your cake to cart and proceed to checkout.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Place Your Order</h3>
                    <p>Complete payment and provide delivery/pickup preferences.</p>
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
                <h3>Questions? Get in Touch!</h3>
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
