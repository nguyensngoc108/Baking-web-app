import React, { useState } from 'react';
import api from '../services/httpServices';

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

const STATUS_BADGE = {
  Pending:   'badge-amber',
  Confirmed: 'badge-blue',
  Preparing: 'badge-cyan',
  Ready:     'badge-purple',
  Delivered: 'badge-green',
};

const DashboardOrders = ({ orders, loading, onMessage, onDataChange }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isUpdating, setIsUpdating]     = useState(false);
  const [expandedId, setExpandedId]     = useState(null);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      await api.put(`/orders/${orderId}`, { status: newStatus });
      onMessage('Order status updated');
      onDataChange();
    } catch (err) {
      onMessage('Error updating order: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const countFor = status => orders.filter(o => o.status === status).length;

  return (
    <div className="dashboard-section">

      {/* Filter pills */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Orders
          <span className="filter-tab-count">{orders.length}</span>
        </button>
        {STATUSES.map(status => (
          <button
            key={status}
            className={`filter-tab ${activeFilter === status ? 'active' : ''}`}
            onClick={() => setActiveFilter(status)}
          >
            {status}
            <span className="filter-tab-count">{countFor(status)}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="dashboard-table-container">
        {loading ? (
          <div className="table-empty">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">📋</div>
            No {activeFilter !== 'all' ? activeFilter.toLowerCase() : ''} orders found
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <React.Fragment key={order._id}>
                  <tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  >
                    <td className="td-primary">#{order._id?.slice(-6).toUpperCase()}</td>
                    <td>
                      {order.userId
                        ? <span className="badge badge-blue">Member</span>
                        : <span className="td-muted">{order.guestEmail || 'Guest'}</span>
                      }
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="td-primary">${order.totalPrice?.toFixed(2)}</td>
                    <td className="td-muted">
                      {new Date(order.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="dashboard-select"
                        value={order.status}
                        onChange={e => handleUpdateStatus(order._id, e.target.value)}
                        disabled={isUpdating}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>

                  {/* Expanded row — order details */}
                  {expandedId === order._id && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={7} style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Customer Info</div>
                            <div className="td-muted">
                              {order.userId
                                ? 'Registered member'
                                : `Guest — ${order.guestEmail || 'no email'} · ${order.guestPhone || 'no phone'}`
                              }
                            </div>
                            <div className="td-muted" style={{ marginTop: 4 }}>📍 {order.address}</div>
                            {order.note && (
                              <div className="td-muted" style={{ marginTop: 4 }}>📝 {order.note}</div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Order Items</div>
                            {order.items?.length > 0
                              ? order.items.map((item, i) => (
                                <div key={i} className="td-muted" style={{ marginBottom: 3 }}>
                                  • {item.name || item.cakeId} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              ))
                              : <div className="td-muted">No item details available</div>
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary strip */}
      <div className="summary-strip summary-strip-3" style={{ marginTop: 14 }}>
        <div className="summary-item">
          <div className="summary-item-value">{orders.length}</div>
          <div className="summary-item-label">Total Orders</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">{countFor('Pending')}</div>
          <div className="summary-item-label">Pending</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">
            ${orders.reduce((s, o) => s + (o.totalPrice || 0), 0).toFixed(2)}
          </div>
          <div className="summary-item-label">Total Revenue</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOrders;
