import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InfoPage from '../components/InfoPage';
import { LogOut, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { API } from '../utils/api';

const CUSTOM_ORDER_LOGIN_MSG = 'Please log in to your account to place a custom order.';

const getSafeRedirect = (value) => {
  if (!value) return null;
  // Only allow internal app paths — never external URLs, protocol-relative
  // URLs, or the admin back-office.
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (value.startsWith('/admin')) return null;
  return value;
};

const readCustomerSession = () => {
  try {
    const token = localStorage.getItem('eskraft-token');
    const saved = localStorage.getItem('eskraft-user');
    const user = saved ? JSON.parse(saved) : null;
    // Customer storage must never hold an admin session. Purge legacy data
    // from before the auth flows were separated.
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      localStorage.removeItem('eskraft-token');
      localStorage.removeItem('eskraft-user');
      return { token: null, user: null };
    }
    return { token, user };
  } catch {
    return { token: localStorage.getItem('eskraft-token'), user: null };
  }
};

const isValidPhone = (value) => {
  const normalized = String(value ?? '').replace(/[\s\-()]/g, '').trim();
  return /^\+?\d{7,15}$/.test(normalized);
};

const inputStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  backgroundColor: 'var(--color-bg)',
};

const statusColors = {
  PENDING_PAYMENT: { bg: '#FFF3CD', text: '#856404' },
  PAID: { bg: '#D4EDDA', text: '#155724' },
  PROCESSING: { bg: '#CCE5FF', text: '#004085' },
  SHIPPED: { bg: '#D1ECF1', text: '#0C5460' },
  DELIVERED: { bg: '#D4EDDA', text: '#155724' },
  CANCELLED: { bg: '#F8D7DA', text: '#721C24' },
  FAILED: { bg: '#F8D7DA', text: '#721C24' },
  REFUNDED: { bg: '#E2E3E5', text: '#383D41' },
};

const statusLabels = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const Account = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get('redirect'));
  const showCustomOrderNotice = redirectTo === '/custom-orders';
  const [initialSession] = useState(readCustomerSession);
  const [token, setToken] = useState(initialSession.token);
  const [user, setUser] = useState(initialSession.user);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Edit Profile / Account Settings
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', currentPassword: '', newPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const fetchProfile = async (jwt) => {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${jwt}` } });
      const data = await res.json();
      if (data.success) {
        // Admin sessions must never be treated as customer sessions.
        if (data.data.role === 'ADMIN' || data.data.role === 'SUPER_ADMIN') {
          localStorage.removeItem('eskraft-token');
          localStorage.removeItem('eskraft-user');
          setToken(null);
          setUser(null);
          return;
        }
        setProfile((p) => ({
          ...p,
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || data.data.customer?.phone || '',
          address: data.data.customer?.address || '',
        }));
        setProfileLoaded(true);
      }
    } catch {
      // silent — profile section keeps local values
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    if (!profile.name.trim()) { setProfileErr('Name cannot be empty'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) { setProfileErr('Please enter a valid email address'); return; }
    if (profile.phone && profile.phone.trim() && !isValidPhone(profile.phone)) { setProfileErr('Please enter a valid phone number (7–15 digits, optional leading +)'); return; }
    if (profile.newPassword && profile.newPassword.length < 6) { setProfileErr('New password must be at least 6 characters'); return; }
    if (profile.newPassword && !profile.currentPassword) { setProfileErr('Enter your current password to set a new one'); return; }
    setProfileLoading(true);
    try {
      const body = { name: profile.name.trim(), email: profile.email.trim(), phone: (profile.phone || '').trim(), address: profile.address };
      if (profile.newPassword) { body.currentPassword = profile.currentPassword; body.newPassword = profile.newPassword; }
      const res = await fetch(`${API}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setProfileErr(data.error?.message || 'Could not save profile'); return; }
      // Stay logged in — refresh stored token/user (email may have changed)
      localStorage.setItem('eskraft-token', data.data.token);
      localStorage.setItem('eskraft-user', JSON.stringify(data.data.user));
      setToken(data.data.token);
      setUser(data.data.user);
      setProfile((p) => ({ ...p, currentPassword: '', newPassword: '' }));
      setProfileMsg(data.message || 'Profile updated successfully');
      // Re-fetch canonical profile (normalized phone) so the updated number
      // is reflected everywhere account info is displayed.
      fetchProfile(data.data.token);
    } catch {
      setProfileErr('Could not connect to server');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchOrders = async (jwt) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      // silent
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    // Never treat an admin session as a customer session.
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      localStorage.removeItem('eskraft-token');
      localStorage.removeItem('eskraft-user');
      setToken(null);
      setUser(null);
      return;
    }
    fetchOrders(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  useEffect(() => {
    if (token && user && !profileLoaded) fetchProfile(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, profileLoaded]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setAuthError(data.error?.message || 'Something went wrong');
        return;
      }

      // Defense-in-depth: customer login must never establish an admin session.
      // (Backend also rejects admins on /auth/login with 403.)
      if (data.data.user.role === 'ADMIN' || data.data.user.role === 'SUPER_ADMIN') {
        setAuthError('Admin accounts must sign in via the admin portal.');
        return;
      }

      localStorage.setItem('eskraft-token', data.data.token);
      localStorage.setItem('eskraft-user', JSON.stringify(data.data.user));
      setToken(data.data.token);
      setUser(data.data.user);
      setProfileLoaded(false);
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    } catch {
      setAuthError('Could not connect to server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eskraft-token');
    localStorage.removeItem('eskraft-user');
    setToken(null);
    setUser(null);
    setOrders([]);
    setForm({ name: '', email: '', phone: '', address: '', password: '' });
    setProfile({ name: '', email: '', phone: '', address: '', currentPassword: '', newPassword: '' });
    setProfileLoaded(false);
    setProfileMsg('');
    setProfileErr('');
  };

  if (!token || !user) {
    return (
      <InfoPage title="Account" subtitle="Sign in to track orders and manage your account.">
        <div style={{ maxWidth: '420px' }}>
          {showCustomOrderNotice && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: '#FFF3CD', color: '#856404', fontSize: '0.875rem' }}>
              {CUSTOM_ORDER_LOGIN_MSG}
            </div>
          )}
          <div className="flex gap-sm mb-6">
            <button
              type="button"
              className="btn"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.8rem', opacity: mode === 'login' ? 1 : 0.5 }}
              onClick={() => { setMode('login'); setAuthError(''); }}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.8rem', opacity: mode === 'register' ? 1 : 0.5 }}
              onClick={() => { setMode('register'); setAuthError(''); }}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {authError && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: '#F8D7DA', color: '#721C24', fontSize: '0.875rem' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-sm">
            {mode === 'register' && (
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" style={inputStyle} aria-label="Your name" />
            )}
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" style={inputStyle} aria-label="Email" />
            {mode === 'register' && (
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" style={inputStyle} aria-label="Phone" />
            )}
            {mode === 'register' && (
              <textarea name="address" value={form.address} onChange={handleChange} required placeholder="Address" rows={2} style={inputStyle} aria-label="Address" />
            )}
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Password" style={inputStyle} aria-label="Password" />
            <button type="submit" className="btn" disabled={authLoading}>
              {authLoading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </InfoPage>
    );
  }

  return (
    <InfoPage title={`Hey, ${user.name}!`} subtitle="Welcome to your ESKRAFT account.">
      <div className="flex justify-between items-center mb-8" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
        <p className="text-sm text-gray" style={{ textTransform: 'none' }}>
          Signed in as <strong>{user.email}</strong>
          {profile.phone ? (
            <><br />Phone: <strong>{profile.phone}</strong></>
          ) : null}
        </p>
        <button type="button" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }} onClick={handleLogout}>
          <LogOut size={14} /> SIGN OUT
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>EDIT PROFILE</h2>
        <form onSubmit={handleProfileSave} className="flex flex-col gap-sm" style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          {profileErr && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#F8D7DA', color: '#721C24', fontSize: '0.875rem' }}>
              {profileErr}
            </div>
          )}
          {profileMsg && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#D4EDDA', color: '#155724', fontSize: '0.875rem' }}>
              {profileMsg}
            </div>
          )}
          <label className="font-bold text-sm" htmlFor="profile-name">NAME</label>
          <input id="profile-name" name="name" value={profile.name} onChange={handleProfileChange} required placeholder="Your name" style={inputStyle} aria-label="Your name" />
          <label className="font-bold text-sm" htmlFor="profile-email">EMAIL</label>
          <input id="profile-email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required placeholder="Email" style={inputStyle} aria-label="Email" />
          <label className="font-bold text-sm" htmlFor="profile-phone">PHONE NUMBER</label>
          <input id="profile-phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} placeholder="Phone number" style={inputStyle} aria-label="Phone number" autoComplete="tel" />
          <label className="font-bold text-sm" htmlFor="profile-address">ADDRESS</label>
          <textarea id="profile-address" name="address" value={profile.address} onChange={handleProfileChange} rows={2} placeholder="Delivery address" style={inputStyle} aria-label="Address" />
          <p className="font-bold text-sm" style={{ marginTop: '0.5rem' }}>CHANGE PASSWORD <span style={{ fontWeight: 400, color: 'var(--color-gray)', textTransform: 'none' }}>(optional)</span></p>
          <input name="currentPassword" type="password" value={profile.currentPassword} onChange={handleProfileChange} placeholder="Current password" style={inputStyle} aria-label="Current password" autoComplete="current-password" />
          <input name="newPassword" type="password" value={profile.newPassword} onChange={handleProfileChange} minLength={6} placeholder="New password (min 6 characters)" style={inputStyle} aria-label="New password" autoComplete="new-password" />
          <button type="submit" className="btn" disabled={profileLoading} style={{ marginTop: '0.5rem' }}>
            {profileLoading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </form>

        <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>YOUR ORDERS</h2>

        {loadingOrders ? (
          <p className="text-gray">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-sm" style={{ padding: '3rem', backgroundColor: '#F5F3ED', borderRadius: '12px' }}>
            <Package size={40} style={{ color: 'var(--color-wood-dark)', opacity: 0.5 }} />
            <h3 className="font-bold">No orders yet</h3>
            <p className="text-sm text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>
              Once you place an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const color = statusColors[order.status] || { bg: '#E2E3E5', text: '#383D41' };
              const label = statusLabels[order.status] || order.status;

              return (
                <div key={order.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    style={{
                      width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: '1rem', backgroundColor: '#F5F3ED',
                      textAlign: 'left', cursor: 'pointer', border: 'none',
                    }}
                  >
                    <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                      <span className="font-bold text-sm">{order.orderNumber}</span>
                      <span
                        className="badge"
                        style={{ backgroundColor: color.bg, color: color.text, fontSize: '0.6rem', fontWeight: 700 }}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="text-sm text-gray" style={{ textTransform: 'none' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-sm font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '1.25rem' }}>
                      <div className="flex flex-col gap-xs">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                              <span className="font-bold text-sm">{item.product?.name || 'Product'}</span>
                              <span className="text-sm text-gray" style={{ marginLeft: '0.5rem' }}>× {item.quantity}</span>
                            </div>
                            <span className="text-sm">₹{item.subtotal.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray">Subtotal</span>
                          <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray">Shipping</span>
                          <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
                        </div>
                        <div className="flex justify-between font-bold" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                          <span>Total</span>
                          <span>₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray mt-4" style={{ textTransform: 'none' }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </InfoPage>
  );
};

export default Account;
