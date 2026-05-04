import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'password' | 'success'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [resetToken, setResetToken] = useState('');

  const otpRefs = useRef([]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  // Lock countdown
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const t = setTimeout(() => setLockSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockSeconds]);

  const applyLock = (lockedUntil) => {
    const secs = Math.ceil((new Date(lockedUntil) - Date.now()) / 1000);
    setLockSeconds(secs > 0 ? secs : 0);
  };

  // ── Step 1: email ──────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setResendSeconds(60);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Failed to send code. Please try again.');
      if (data?.remaining) setResendSeconds(data.remaining);
      if (data?.lockedUntil) applyLock(data.lockedUntil);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setResendSeconds(60);
      setOtpDigits(['', '', '', '', '', '']);
      setAttemptsRemaining(3);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Failed to resend code.');
      if (data?.remaining) setResendSeconds(data.remaining);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ──────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  // ── Step 2: verify OTP ─────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authService.verifyResetOTP(email, otp);
      setResetToken(res.data.resetToken);
      setStep('password');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Invalid code. Please try again.');
      if (data?.attemptsRemaining !== undefined) setAttemptsRemaining(data.attemptsRemaining);
      if (data?.lockedUntil) {
        applyLock(data.lockedUntil);
        setOtpDigits(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: new password ───────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(email, resetToken, newPassword);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockSeconds > 0;
  const lockMin = Math.floor(lockSeconds / 60);
  const lockSec = lockSeconds % 60;

  return (
    <div className="fp-page">
      <nav className="fp-navbar">
        <div className="fp-nav-container">
          <div className="fp-nav-brand" onClick={() => navigate('/')}>
            <img src="/assets/images/logo.jpg" alt="S2UGAR" className="fp-nav-logo" />
            <span className="fp-nav-title">S2UGAR</span>
          </div>
        </div>
      </nav>

      <div className="fp-container">
        <div className="fp-card">

          {/* Step indicators */}
          <div className="fp-steps">
            {['email', 'otp', 'password'].map((s, i) => (
              <div
                key={s}
                className={`fp-step ${step === s ? 'fp-step--active' : ''} ${
                  ['email', 'otp', 'password', 'success'].indexOf(step) > i ? 'fp-step--done' : ''
                }`}
              >
                <span className="fp-step-dot">{['email', 'otp', 'password', 'success'].indexOf(step) > i ? '✓' : i + 1}</span>
              </div>
            ))}
          </div>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <div className="fp-header">
                <h1>Forgot password?</h1>
                <p>Enter your email and we'll send a 6-digit reset code.</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="fp-form">
                <div className="fp-field">
                  <label htmlFor="fp-email">Email address</label>
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="fp-error">{error}</p>}
                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset code'}
                </button>
                <button type="button" className="fp-text-link" onClick={() => navigate('/signin')}>
                  Back to sign in
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <>
              <div className="fp-header">
                <h1>Enter reset code</h1>
                <p>
                  We sent a 6-digit code to <strong>{email}</strong>.
                  <br />It expires in 15 minutes.
                </p>
              </div>

              {isLocked ? (
                <div className="fp-locked-box">
                  <p className="fp-locked-msg">
                    Too many failed attempts.<br />
                    Try again in <strong>{lockMin}:{String(lockSec).padStart(2, '0')}</strong>.
                  </p>
                  <button
                    className="fp-btn fp-btn--outline"
                    onClick={() => {
                      setStep('email');
                      setOtpDigits(['', '', '', '', '', '']);
                      setLockSeconds(0);
                      setError('');
                    }}
                  >
                    Back to email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOtpSubmit} className="fp-form">
                  <div className="fp-otp-row" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => (otpRefs.current[i] = el)}
                        className="fp-otp-box"
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                      />
                    ))}
                  </div>

                  {attemptsRemaining < 3 && !error && (
                    <p className="fp-attempts-warn">
                      {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before lockout
                    </p>
                  )}
                  {error && <p className="fp-error">{error}</p>}

                  <button
                    type="submit"
                    className="fp-btn"
                    disabled={loading || otpDigits.join('').length < 6}
                  >
                    {loading ? 'Verifying…' : 'Verify code'}
                  </button>

                  <div className="fp-resend-row">
                    {resendSeconds > 0 ? (
                      <span className="fp-resend-timer">Resend code in {resendSeconds}s</span>
                    ) : (
                      <button
                        type="button"
                        className="fp-text-link"
                        onClick={handleResend}
                        disabled={loading}
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Step 3: New password ── */}
          {step === 'password' && (
            <>
              <div className="fp-header">
                <h1>New password</h1>
                <p>Choose a strong password for your account.</p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="fp-form">
                <div className="fp-field">
                  <label htmlFor="fp-new-pw">New password</label>
                  <div className="fp-pw-wrap">
                    <input
                      id="fp-new-pw"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      autoFocus
                    />
                    <button type="button" className="fp-eye" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="fp-field">
                  <label htmlFor="fp-confirm-pw">Confirm password</label>
                  <div className="fp-pw-wrap">
                    <input
                      id="fp-confirm-pw"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                    />
                    <button type="button" className="fp-eye" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                {error && <p className="fp-error">{error}</p>}
                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? 'Saving…' : 'Reset password'}
                </button>
              </form>
            </>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="fp-success">
              <div className="fp-success-icon">✓</div>
              <h1>Password updated!</h1>
              <p>Your password has been reset successfully.</p>
              <button className="fp-btn" onClick={() => navigate('/signin')}>
                Sign in
              </button>
            </div>
          )}

        </div>
      </div>

      <footer className="fp-footer">
        <p>© 2025 S2UGAR. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
