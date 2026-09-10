import React, { useState } from 'react';
import { API } from '../utils/api';
import {
  normalizeIndianPhone,
  formatPhoneInput,
  formatIndianDisplay,
  setGuestPhone,
} from '../utils/phone';

// PhoneGate blocks cart/drawer/checkout contents until a valid +91 number exists.
// - Logged-in: saves via PATCH /auth/me (persists to DB, survives refresh/login).
// - Guest: saves to localStorage (eskraft-guest-phone); persisted to DB at login/checkout.
// Marketing/abandoned-cart consent is NOT collected here — this gate is only
// for required order-communication phone numbers.
const PhoneGate = ({ mode = 'cart', onSaved, compact = false }) => {
  const [ten, setTen] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = (() => {
    try { return localStorage.getItem('eskraft-token'); } catch { return null; }
  })();

  const handleChange = (e) => {
    setTen(formatPhoneInput(e.target.value));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const normalized = normalizeIndianPhone(ten);
    if (!normalized) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSaving(true);
    try {
      if (token) {
        const res = await fetch(`${API}/auth/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ phone: normalized }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error?.message || 'Could not save phone number');
        // Refresh customer session token (phone may rotate claims) and clear guest copy.
        try {
          localStorage.setItem('eskraft-token', data.data.token);
          localStorage.setItem('eskraft-user', JSON.stringify(data.data.user));
          localStorage.removeItem('eskraft-guest-phone');
        } catch {}
        onSaved?.(normalized);
      } else {
        if (!setGuestPhone(normalized)) throw new Error('Could not save phone number');
        onSaved?.(normalized);
      }
    } catch (err) {
      setError(err.message || 'Could not save phone number');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: compact ? '1.5rem' : '2.5rem 2rem',
        backgroundColor: '#FFFEFB',
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
        ADD YOUR WHATSAPP NUMBER TO CONTINUE
      </p>
      <p className="text-sm text-gray" style={{ textTransform: 'none', fontWeight: 400, marginBottom: '1.25rem' }}>
        {mode === 'checkout'
          ? 'Your WhatsApp number is required to place your order and receive order updates.'
          : 'Your WhatsApp number is required to access your cart and receive order updates.'}
      </p>
      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#F8D7DA', color: '#721C24', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSave} style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex', alignItems: 'center', padding: '0 0.9rem',
            border: '1px solid var(--color-border)', borderRadius: '8px',
            backgroundColor: '#F5F3ED', fontWeight: 800, fontSize: '0.95rem',
          }}
        >
          +91
        </span>
        <input
          value={ten}
          onChange={handleChange}
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          aria-label="10-digit Indian mobile number"
          maxLength={11}
          style={{
            flex: 1, padding: '0.9rem 1rem', border: '1px solid var(--color-border)',
            borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem',
            backgroundColor: 'var(--color-bg)', minWidth: 0,
          }}
        />
        <button type="submit" className="btn" disabled={saving} style={{ whiteSpace: 'nowrap' }}>
          {saving ? 'SAVING...' : 'SAVE'}
        </button>
      </form>
      <p className="text-xs text-gray" style={{ textTransform: 'none', marginTop: '0.75rem' }}>
        Handcrafted with care — we only use this for your order updates.
        {ten && normalizeIndianPhone(ten) ? ` · ${formatIndianDisplay(ten)}` : ''}
      </p>
    </div>
  );
};

export default PhoneGate;
