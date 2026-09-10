import { useCallback, useEffect, useState } from 'react';
import { API } from './api';
import { normalizeIndianPhone } from './phone';

// Resolves whether the customer has satisfied the mandatory +91 requirement.
// - ONLY logged-in users with a valid DB phone can access the cart.
// - Guest users (no token) are treated as 'missing' and must log in.
// Returns { status: 'checking' | 'ready' | 'missing', phone, refresh, isLoggedIn }.
export function useCustomerPhone() {
  const [status, setStatus] = useState('checking');
  const [phone, setPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refresh = useCallback(async () => {
    let token = null;
    try { token = localStorage.getItem('eskraft-token'); } catch { token = null; }
    
    if (token) {
      setIsLoggedIn(true);
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const n = normalizeIndianPhone(data.data.phone || data.data.customer?.phone);
          if (n) {
            setPhone(n);
            setStatus('ready');
            return;
          }
        } else if (res.status === 401) {
          // Invalid session
          localStorage.removeItem('eskraft-token');
          localStorage.removeItem('eskraft-user');
          setIsLoggedIn(false);
        }
      } catch {
        // Network failure: don't hard-block, but don't allow access either
      }
      // Logged-in but no valid DB phone → must add
      setPhone('');
      setStatus('missing');
      return;
    }
    
    // No token = not logged in → cannot access cart
    setIsLoggedIn(false);
    setPhone('');
    setStatus('missing');
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (!e.key || e.key.includes('eskraft')) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return { status, phone, refresh, isLoggedIn };
}
