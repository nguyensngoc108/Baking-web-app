import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!state?.order) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.order) return null;

  const { order, items = [], prices = {}, paymentMethod, total } = state;
  const orderId = order._id || '';
  const shortId = orderId.slice(-8).toUpperCase();
  const deliveryDate = order.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-NZ', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;
  const isCard = paymentMethod === 'stripe';
  const guestEmail = order.guestEmail || '';

  return (
    <div className="os-page">

      {/* Minimal navbar */}
      <nav className="os-nav">
        <div className="os-nav-inner">
          <div className="os-nav-brand" onClick={() => navigate('/')}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR" className="os-nav-logo" />
            <span className="os-nav-title">S2UGAR</span>
          </div>
        </div>
      </nav>

      <div className="os-container">

        {/* Animated check */}
        <div className="os-icon-wrap">
          <svg className="os-check-svg" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle
              className="os-circle"
              cx="50" cy="50" r="45"
              stroke="#a8c5a0"
              strokeWidth="3"
              fill="none"
            />
            <polyline
              className="os-checkmark"
              points="28,52 44,68 72,36"
              stroke="#5a8a52"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="os-heading os-anim-1">
          <h1 className="os-title">Order Confirmed!</h1>
          <p className="os-subtitle">
            Thank you for your order. We've received it and are getting started.
          </p>
        </div>

        {/* Order meta */}
        <div className="os-meta os-anim-2">
          <span className="os-order-id">Order #{shortId}</span>
          {deliveryDate && (
            <span className="os-divider" aria-hidden="true">·</span>
          )}
          {deliveryDate && (
            <span className="os-delivery-date">{deliveryDate}</span>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="os-items os-anim-3">
            {items.map(item => {
              const unitPrice = prices[item.cakeId] || 0;
              return (
                <div key={item.cakeId} className="os-item">
                  <div className="os-item-img-wrap">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="os-item-img" />
                      : <div className="os-item-img-ph" />
                    }
                    <span className="os-item-qty">{item.quantity}</span>
                  </div>
                  <span className="os-item-name">{item.name}</span>
                  <span className="os-item-price">
                    {unitPrice > 0 ? formatPrice(unitPrice * item.quantity) : ''}
                  </span>
                </div>
              );
            })}

            {total != null && (
              <div className="os-total-row">
                <span>Total paid</span>
                <span className="os-total-val">{formatPrice(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Info cards */}
        <div className="os-info-cards os-anim-4">
          {guestEmail && (
            <div className="os-info-card">
              <span className="os-info-icon" aria-hidden="true">✉</span>
              <div>
                <p className="os-info-label">Confirmation sent to</p>
                <p className="os-info-val">{guestEmail}</p>
              </div>
            </div>
          )}
          {deliveryDate && (
            <div className="os-info-card">
              <span className="os-info-icon" aria-hidden="true">📅</span>
              <div>
                <p className="os-info-label">
                  {order.address === 'In-store pickup' ? 'Pickup date' : 'Delivery date'}
                </p>
                <p className="os-info-val">{deliveryDate}</p>
              </div>
            </div>
          )}
          <div className="os-info-card">
            <span className="os-info-icon" aria-hidden="true">
              {isCard ? '💳' : '💵'}
            </span>
            <div>
              <p className="os-info-label">Payment</p>
              <p className="os-info-val">
                {isCard ? 'Paid by card' : 'Cash on delivery / pickup'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="os-anim-5">
          <button className="os-cta" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
