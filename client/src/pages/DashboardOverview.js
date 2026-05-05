import React from 'react';

const STATUS_CONFIG = {
  Pending:   { color: '#f59e0b', bg: '#fffbeb', badge: 'badge-amber'  },
  Confirmed: { color: '#3b82f6', bg: '#eff6ff', badge: 'badge-blue'   },
  Preparing: { color: '#06b6d4', bg: '#ecfeff', badge: 'badge-cyan'   },
  Ready:     { color: '#8b5cf6', bg: '#f5f3ff', badge: 'badge-purple' },
  Delivered: { color: '#10b981', bg: '#ecfdf5', badge: 'badge-green'  },
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className={`stat-card-icon ${color}`}>{icon}</div>
    </div>
    <div className="stat-card-value">{value}</div>
  </div>
);

const DashboardOverview = ({ stats, orders = [], products = [] }) => {
  const pendingCount  = orders.filter(o => o.status === 'Pending').length;
  const recentOrders  = [...orders].reverse().slice(0, 6);

  const statusCounts = Object.keys(STATUS_CONFIG).map(status => ({
    status,
    count: orders.filter(o => o.status === status).length,
    ...STATUS_CONFIG[status],
  }));

  const total = orders.length || 1;

  return (
    <div className="dashboard-overview">

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        <StatCard icon="📋" label="Total Orders"    value={stats.totalOrders}   color="blue"   />
        <StatCard icon="🍰" label="Products"         value={stats.totalProducts} color="purple" />
        <StatCard icon="💰" label="Revenue"          value={`$${stats.totalRevenue}`} color="green" />
        <StatCard icon="⏳" label="Pending Orders"   value={pendingCount}        color="amber"  />
      </div>

      {/* ── Two-column section ── */}
      <div className="overview-grid">

        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Orders</div>
              <div className="card-subtitle">Last {recentOrders.length} orders placed</div>
            </div>
          </div>
          <div className="dashboard-table-container" style={{ boxShadow: 'none', border: 'none', borderRadius: 0 }}>
            {recentOrders.length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-icon">📋</div>
                No orders yet
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const cfg = STATUS_CONFIG[order.status] || {};
                    return (
                      <tr key={order._id}>
                        <td className="td-primary">#{order._id?.slice(-6).toUpperCase()}</td>
                        <td>
                          {order.userId
                            ? <span className="badge badge-blue">Member</span>
                            : <span className="td-muted">{order.guestEmail || 'Guest'}</span>
                          }
                        </td>
                        <td className="td-primary">${order.totalPrice?.toFixed(2)}</td>
                        <td>
                          <span
                            className="badge"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="td-muted">
                          {new Date(order.createdAt || order.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Status breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Order Status</div>
            </div>
            <div className="card-body">
              <div className="status-breakdown">
                {statusCounts.map(({ status, count, color, bg }) => (
                  <div key={status} className="status-breakdown-row">
                    <span className="status-breakdown-label">{status}</span>
                    <div className="status-breakdown-bar-wrap">
                      <div
                        className="status-breakdown-bar"
                        style={{ width: `${(count / total) * 100}%`, background: color }}
                      />
                    </div>
                    <span className="status-breakdown-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Catalogue</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {products.slice(0, 5).map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.image
                      ? <img src={p.image} alt={p.name} className="product-thumb" />
                      : <div className="product-thumb-placeholder">🍰</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="td-primary" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div className="td-muted">${parseFloat(p.price).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="td-muted" style={{ textAlign: 'center', padding: '12px 0' }}>No products yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
