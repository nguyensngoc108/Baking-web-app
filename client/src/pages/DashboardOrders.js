import React, { useState } from 'react';
import api from '../services/httpServices';

const DashboardOrders = ({ orders, loading, message, onMessage, onDataChange }) => {
  const [orderFilter, setOrderFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      await api.put(`/orders/${orderId}`, { status: newStatus });
      onMessage('Order status updated!');
      onDataChange(); // Trigger refresh
    } catch (error) {
      onMessage('Error updating order: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  return (
    <div className="dashboard-section">
      <h2>Track Orders</h2>

      <div className="filter-bar">
        <button
          className={orderFilter === 'all' ? 'active' : ''}
          onClick={() => setOrderFilter('all')}
        >
          All Orders
        </button>
        <button
          className={orderFilter === 'Pending' ? 'active' : ''}
          onClick={() => setOrderFilter('Pending')}
        >
          Pending
        </button>
        <button
          className={orderFilter === 'Confirmed' ? 'active' : ''}
          onClick={() => setOrderFilter('Confirmed')}
        >
          Confirmed
        </button>
        <button
          className={orderFilter === 'Delivered' ? 'active' : ''}
          onClick={() => setOrderFilter('Delivered')}
        >
          Delivered
        </button>
      </div>

      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Delivery Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>#{order._id?.slice(-6).toUpperCase()}</td>
                <td>{order.userId ? 'Registered User' : order.guestEmail || 'Guest'}</td>
                <td>${order.totalPrice?.toFixed(2)}</td>
                <td>
                  <span className={`status ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                    className="dashboard-select"
                    disabled={isUpdating}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOrders;
