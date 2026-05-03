import React, { useState, useEffect } from 'react';
import '../styles/SessionExpiredModal.css';

const SessionExpiredModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener('session:expired', handler);
    return () => window.removeEventListener('session:expired', handler);
  }, []);

  if (!visible) return null;

  const handleSignIn = () => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    window.location.href = isAdmin ? '/dashboard-login' : '/signin';
  };

  return (
    <div className="se-overlay">
      <div className="se-modal" role="alertdialog" aria-modal="true" aria-labelledby="se-title">
        <div className="se-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 id="se-title" className="se-title">Session Expired</h2>
        <p className="se-message">
          Your session has expired. Please sign in again to continue.
        </p>
        <button className="se-btn" onClick={handleSignIn}>
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
