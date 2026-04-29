import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Dashboard.css';

const DashboardLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      
      const response = await authService.adminLogin(email, password);
      
      if (response.data.token) {
        authService.saveToken(response.data.token);
        setEmail('');
        setPassword('');
        setMessage('');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-login-container">
      <div className="dashboard-login">
        <div className="dashboard-login-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Admin</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@s2ugar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {message && <p className="dashboard-message error">{message}</p>}
          <button type="submit" disabled={loading} className="dashboard-btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <a href="/" className="dashboard-back-link">← Back to Home</a>
        </form>
      </div>
    </div>
  );
};

export default DashboardLogin;
