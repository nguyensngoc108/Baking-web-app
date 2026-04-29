import React from 'react';
import authService from '../services/authService';

const DashboardLayout = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>S2UGAR Admin</h2>
        </div>
        <nav className="dashboard-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => onTabChange('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => onTabChange('products')}
          >
            🍰 Products
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => onTabChange('orders')}
          >
            📦 Orders
          </button>
          <button
            className={`nav-item ${activeTab === 'packaging' ? 'active' : ''}`}
            onClick={() => onTabChange('packaging')}
          >
            📮 Packaging
          </button>
        </nav>
        <button
          className="dashboard-logout-btn"
          onClick={() => {
            authService.logout();
            onLogout();
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <a href="/" className="dashboard-home-link">← Home</a>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
