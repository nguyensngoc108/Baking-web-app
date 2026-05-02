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

const NAV = [
  { key: 'overview',     label: 'Overview',    icon: '📊' },
  { key: 'products',     label: 'Products',    icon: '🍰' },
  { key: 'ingredients',  label: 'Ingredients', icon: '🥘' },
  { key: 'packaging',    label: 'Packaging',   icon: '📦' },
  { key: 'orders',       label: 'Orders',      icon: '📋' },
];

const formatDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const DashboardPage = () => {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [activeTab, setActiveTab]     = useState('overview');
  const dashboardData                  = useDashboardData();

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
    authService.logout();
    setIsLoggedIn(false);
    dashboardData.setMessage('');
  };

  if (!isLoggedIn) {
    return <DashboardLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const activeNav = NAV.find(n => n.key === activeTab);

  return (
    <div className="dashboard-container">

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <div className="sidebar-brand-icon">🍰</div>
            <div>
              <div className="sidebar-brand-name">S2UGAR</div>
              <div className="sidebar-brand-sub">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-section-label">Menu</div>
          {NAV.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-admin-row">
            <div className="sidebar-admin-avatar">A</div>
            <div>
              <div className="sidebar-admin-name">Administrator</div>
              <div className="sidebar-admin-role">Admin Account</div>
            </div>
          </div>
          <button className="dashboard-logout-btn" onClick={handleLogout}>
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard-main">

        {/* Top bar */}
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <div className="topbar-page-title">
              {activeNav?.icon} {activeNav?.label}
            </div>
            <div className="topbar-breadcrumb">Dashboard › {activeNav?.label}</div>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{formatDate()}</span>
            <div className="topbar-divider" />
            <a href="/" className="topbar-site-btn">View Site →</a>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {dashboardData.message && (
            <div className={`dashboard-message ${dashboardData.message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
              {dashboardData.message}
            </div>
          )}

          {activeTab === 'overview' && (
            <DashboardOverview
              stats={dashboardData.stats}
              orders={dashboardData.orders}
              products={dashboardData.products}
            />
          )}

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

          {activeTab === 'ingredients' && (
            <DashboardIngredients
              ingredients={dashboardData.availableIngredients}
              loading={dashboardData.loading}
              onMessage={dashboardData.setMessage}
              onDataChange={dashboardData.fetchDashboardData}
            />
          )}

          {activeTab === 'packaging' && (
            <DashboardPackaging
              packagingOptions={dashboardData.packagingOptions}
              loading={dashboardData.loading}
              message={dashboardData.message}
              onMessage={dashboardData.setMessage}
              onDataChange={dashboardData.fetchDashboardData}
            />
          )}

          {activeTab === 'orders' && (
            <DashboardOrders
              orders={dashboardData.orders}
              loading={dashboardData.loading}
              message={dashboardData.message}
              onMessage={dashboardData.setMessage}
              onDataChange={dashboardData.fetchDashboardData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
