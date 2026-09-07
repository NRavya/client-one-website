import React, { useEffect, useState } from 'react';
import { API } from '../utils/api';
import { MIN_ORDER_VALUE } from '../context/CartContext';
import { load } from '@cashfreepayments/cashfree-js';

const inputStyle = { width:'100%', padding:'0.9rem 1rem', border:'1px solid var(--color-border)', borderRadius:'8px', fontFamily:'inherit', fontSize:'0.95rem' };

export default function CheckoutForm({ items, onSuccess }) {
  const user = JSON.parse(localStorage.getItem('eskraft-user') || 'null');
  const [form, setForm] = useState({ name: user?.name||'', email: user?.email||'', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // fetch full profile to auto-fill phone/address
    const token = localStorage.getItem('eskraft-token');
    if (!token) return;
    fetch(`${API}/auth/me`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{
        if(d.success) setForm(f=>({ name: d.data.name||f.name, email: d.data.email||f.email, phone: d.data.phone||d.data.customer?.phone||f.phone, address: d.data.customer?.address||f.address }));
      }).catch(()=>{});
  }, []);

  const cartSubtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const handlePay = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('eskraft-token');

    if (!token) {
      setMsg('Please sign in via Account first');
      return;
    }

    if (cartSubtotal < MIN_ORDER_VALUE) {
      setMsg(`Minimum order is ₹${MIN_ORDER_VALUE}. Your cart is ₹${cartSubtotal} — please add ₹${MIN_ORDER_VALUE - cartSubtotal} more.`);
      return;
    }

    if (!form.name || !form.email || !form.phone) {
      setMsg('Name, email and phone required');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.slug || i.id,
            quantity: i.quantity
          })),
          customerDetails: form
        })
      });

      const data = await res.json();

      if (!data.success) {
        if (
            data.error?.code === 'NOT_AUTHORIZED' ||
            data.error?.message?.includes('token failed')
        ) {
          localStorage.removeItem('eskraft-token');
          localStorage.removeItem('eskraft-user');

          throw new Error(
              'Session expired - please go to Account and Sign In again, then retry payment'
          );
        }

        throw new Error(data.error?.message || 'Order creation failed');
      }

      if (data.data.cashfree?.payment_session_id) {
        const mode = (
            import.meta.env.VITE_CASHFREE_ENV || 'sandbox'
        ).toLowerCase();

        const cashfree = await load({
          mode: mode === 'production' ? 'production' : 'sandbox'
        });

        console.log('Cashfree session:', data.data.cashfree.payment_session_id);

        const checkoutResult = await cashfree.checkout({
          paymentSessionId: data.data.cashfree.payment_session_id,
          redirectTarget: '_self'
        });

        console.log('Cashfree checkout result:', checkoutResult);

      } else if (data.data.cashfree?.payment_link) {
        window.location.href = data.data.cashfree.payment_link;

      } else {
        setMsg(
            `✓ Test Order ${data.data.orderNumber} created! ` +
            `(Cashfree not configured - no real payment). ` +
            `Total ₹${data.data.total}`
        );

        setTimeout(() => onSuccess?.(), 1500);
      }

    } catch (err) {
      setMsg(err.message || 'Checkout failed');

    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handlePay} className="flex flex-col gap-sm">
      <h3 className="font-black">Shipping Details (auto-filled)</h3>
      <input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full Name" required />
      <input style={inputStyle} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" required />
      <input style={inputStyle} type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone (10 digits)" required pattern="[0-9]{10}" />
      <input style={inputStyle} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Address (optional)" />
      {msg && <p className="text-sm" style={{color: msg.includes('created') ? 'green':'#b91c1c', textTransform:'none'}}>{msg}</p>}
      <button type="submit" disabled={loading} className="btn btn-accent" style={{padding:'1.25rem'}}>
        {loading ? 'CREATING PAYMENT...' : 'PAY WITH CASHFREE'}
      </button>
      <p className="text-xs text-center text-gray" style={{textTransform:'none'}}>Details are auto-filled from your account & sent to Cashfree</p>
    </form>
  );
}
