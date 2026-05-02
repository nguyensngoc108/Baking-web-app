import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import authService from '../services/authService';
import { useDashboardData } from '../hooks/useDashboardData';
import DashboardLogin from './DashboardLogin';
import DashboardOverview from './DashboardOverview';
import DashboardProducts from './DashboardProducts';
import DashboardIngredients from './DashboardIngredients';
import DashboardOrders from './DashboardOrders';
import DashboardPackaging from './DashboardPackaging';

const DashboardPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const dashboardData = useDashboardData();

  // Login Check
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsLoggedIn(true);
      dashboardData.fetchDashboardData();
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    dashboardData.fetchDashboardData();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    dashboardData.setMessage('');
  };

  if (!isLoggedIn) {
    return <DashboardLogin onLoginSuccess={handleLoginSuccess} />;
  }

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
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🍰 Products
          </button>
          <button
            className={`nav-item ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            🥘 Ingredients
          </button>
          <button
            className={`nav-item ${activeTab === 'packaging' ? 'active' : ''}`}
            onClick={() => setActiveTab('packaging')}
          >
            📮 Packaging
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
        </nav>
        <button
          className="dashboard-logout-btn"
          onClick={() => {
            authService.logout();
            handleLogout();
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <a href="/" className="dashboard-home-link">← Home</a>
        </div>

        {dashboardData.message && (
          <div className={`dashboard-message ${dashboardData.message.includes('Error') ? 'error' : 'success'}`}>
            {dashboardData.message}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <DashboardOverview stats={dashboardData.stats} />
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <DashboardProducts 
            products={dashboardData.products}
            availableIngredients={dashboardData.availableIngredients}
            loading={dashboardData.loading}
            message={dashboardData.message}
            onMessage={dashboardData.setMessage}
            onDataChange={dashboardData.fetchDashboardData}
          />
        )}

        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <DashboardIngredients
            ingredients={dashboardData.availableIngredients}
            products={dashboardData.products}
            loading={dashboardData.loading}
            message={dashboardData.message}
            onMessage={dashboardData.setMessage}
            onDataChange={dashboardData.fetchDashboardData}
          />
        )}

        {/* Packaging Tab */}
        {activeTab === 'packaging' && (
          <DashboardPackaging 
            packagingOptions={dashboardData.packagingOptions}
            loading={dashboardData.loading}
            message={dashboardData.message}
            onMessage={dashboardData.setMessage}
            onDataChange={dashboardData.fetchDashboardData}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <DashboardOrders 
            orders={dashboardData.orders}
            loading={dashboardData.loading}
            message={dashboardData.message}
            onMessage={dashboardData.setMessage}
            onDataChange={dashboardData.fetchDashboardData}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
