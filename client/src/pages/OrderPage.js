import React, { useState } from 'react';
import api from '../services/httpServices';

const OrderPage = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [],
    deliveryDate: '',
    specialRequests: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/orders', formData);
      alert('Order placed successfully!');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        items: [],
        deliveryDate: '',
        specialRequests: '',
      });
    } catch (error) {
      alert('Error placing order: ' + error.message);
    }
  };

  return (
    <div className="order-page">
      <h1>Place Your Order</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="customerName"
          placeholder="Your Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="customerEmail"
          placeholder="Your Email"
          value={formData.customerEmail}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="customerPhone"
          placeholder="Your Phone"
          value={formData.customerPhone}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          required
        />
        <textarea
          name="specialRequests"
          placeholder="Special Requests"
          value={formData.specialRequests}
          onChange={handleChange}
        />
        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
};

export default OrderPage;
