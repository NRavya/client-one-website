import React from 'react';
import { X, ArrowRight, Lock, Truck, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productsData from '../data/products.json';

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, subtotal } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountLeft = freeShippingThreshold - subtotal;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '420px',
        backgroundColor: 'var(--color-bg)', zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform var(--transition-smooth)'
      }}>

        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Your Picks
          </h2>
          <button onClick={closeCart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%' }}>
            <X size={22} />
          </button>
        </div>



        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
              <p style={{ color: 'var(--color-gray)', marginBottom: '1.5rem' }}>Your cart is empty.</p>
              <button className="btn" onClick={closeCart}>Keep Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: 80, height: 96, borderRadius: 8, overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3, marginBottom: '0.25rem' }}>{item.name}</p>
                    <p style={{ color: 'var(--color-wood-dark)', fontWeight: 700, fontSize: '0.95rem' }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 10px', fontSize: '1rem', borderRight: '1px solid var(--color-border)' }}>−</button>
                      <span style={{ padding: '4px 12px', fontSize: '0.875rem', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 10px', fontSize: '1rem', borderLeft: '1px solid var(--color-border)' }}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ fontSize: '0.75rem', color: 'var(--color-gray)', textDecoration: 'underline' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Upsell */}
          {items.length > 0 && productsData[0] && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '0.75rem' }}>You might also like</p>
              <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                  <img src={productsData[0].images[0]} alt={productsData[0].name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.2rem' }}>{productsData[0].name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>₹{productsData[0].price}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.08em' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>₹{subtotal}</span>
            </div>
            <Link to="/cart" onClick={closeCart} className="btn w-full" style={{ marginBottom: '0.75rem', justifyContent: 'center', display: 'flex' }}>
              Checkout <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Link>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: 'var(--color-gray)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}><Lock size={12} /> Secure</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}><Truck size={12} /> Fast Shipping</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}><RefreshCcw size={12} /> Returns</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
