import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setMessage('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Call the login API
      const response = await authService.userLogin(email, password);
      
      // Save token
      authService.saveToken(response.data.token);
      
      // Save remember me preference if checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR Logo" className="nav-logo" />
            <span className="nav-title">S2UGAR</span>
          </div>
        </div>
      </nav>

      {/* Sign In Container */}
      <div className="signin-container">
        <div className="signin-form-wrapper">
          <div className="signin-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="signin-form">
            {/* Email */}
            <div className="signin-form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="signin-form-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="signin-options">
              <div className="signin-checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#forgot" className="forgot-password-link">Forgot password?</a>
            </div>

            {/* Messages */}
            {message && (
              <div className={`signin-message ${message.includes('successful') ? 'success' : message.includes('failed') ? 'error' : 'info'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="signin-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <div className="signin-footer">
              <p>Don't have an account? <a href="/register" className="signup-link">Create one</a></p>
            </div>
          </form>

          {/* Social Sign In (Optional) */}
          <div className="signin-divider">
            <span>Or continue with</span>
          </div>
          <div className="signin-social">
            <button className="social-btn google-btn">
              <span>Google</span>
            </button>
            <button className="social-btn facebook-btn">
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="signin-footer-section">
        <div className="signin-footer-content">
          <p>&copy; 2025 S2UGAR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignInPage;
