import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/useCart';
import { MIN_ORDER_VALUE } from '../context/CartContext';
import { getDeliveryFee } from '../utils/shipping';
import CheckoutForm from '../components/CheckoutForm';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalCount } = useCart();
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [checkoutMsg, setCheckoutMsg] = React.useState('');

  // Shared slab: ₹200–349 → ₹70 | ₹350–699 → ₹35 | ₹700+ → FREE; null below ₹200
  const shipping = getDeliveryFee(subtotal);
  const meetsMinimum = subtotal >= MIN_ORDER_VALUE;
  const amountNeeded = Math.max(0, MIN_ORDER_VALUE - subtotal);
  const minProgress = Math.min((subtotal / MIN_ORDER_VALUE) * 100, 100);

  if (items.length === 0) {
    return (
      <div className="container section text-center flex flex-col items-center gap-md">
        <ShoppingBag size={56} style={{ color: 'var(--color-wood-mid)' }} />
        <h1 className="text-4xl font-black">YOUR CART IS EMPTY</h1>
        <p className="text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>
          Nothing in here yet — go grab something before the drop sells out.
        </p>
        <Link to="/category/all" className="btn">START SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="text-5xl font-black mb-8">YOUR CART ({totalCount})</h1>

      <div className="grid md:grid-cols-3 gap-lg" style={{ alignItems: 'start' }}>
        {/* Items */}
        <div className="flex flex-col gap-sm md:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-sm items-center" style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem' }}>
              <Link to={`/product/${item.slug}`} style={{ flexShrink: 0 }}>
                <img src={item.image} alt={item.name} style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: '8px' }} />
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/product/${item.slug}`}>
                  <h3 className="font-bold" style={{ textTransform: 'none' }}>{item.product_name || item.name}</h3>
                </Link>
                {item.mrp !== undefined && Number(item.mrp) > Number(item.price) ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="text-lg font-black">₹{item.price}</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-gray)', fontSize: '0.9rem' }}>₹{item.mrp}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803D' }}>10% OFF</span>
                  </span>
                ) : (
                  <span className="text-lg font-black">₹{item.price}</span>
                )}
              </div>
              <div className="flex flex-col items-end gap-xs">
                <div className="flex items-center" style={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} style={{ padding: '0.4rem 0.7rem' }}><Minus size={14} /></button>
                  <span aria-label={`Quantity of ${item.name}`} style={{ width: '32px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} style={{ padding: '0.4rem 0.7rem' }}><Plus size={14} /></button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-xs text-xs text-gray"
                  style={{ color: 'var(--color-gray)' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-8">
            <Link to="/category/all" className="btn btn-outline">CONTINUE SHOPPING</Link>
            <button type="button" onClick={clearCart} className="btn btn-outline" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
              CLEAR CART
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="flex flex-col gap-md" style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', position: 'sticky', top: '120px' }}>
          <h2 className="text-xl font-black">ORDER SUMMARY</h2>

          {/* Minimum order progress — orders above ₹200 only */}
          <div style={{ background: meetsMinimum ? '#D4EDDA' : '#FFF6E8', border: meetsMinimum ? '1px solid #A3D9A5' : '1px solid #F0D9B5', borderRadius: '10px', padding: '0.85rem 1rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 800, color: meetsMinimum ? '#155724' : '#8B6A2E', textTransform: 'none' }}>
              {meetsMinimum ? `✓ Minimum order met (above ₹${MIN_ORDER_VALUE})` : `Add ₹${amountNeeded} more to place your order (min ₹${MIN_ORDER_VALUE})`}
            </p>
            <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.08)', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${minProgress}%`, height: '100%', borderRadius: 999, background: meetsMinimum ? '#28A745' : '#D1A54A', transition: 'width 0.3s ease' }} />
            </div>
            {!meetsMinimum && (
              <Link to="/category/all" style={{ display: 'inline-block', marginTop: '0.6rem', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline', color: '#111' }}>
                + Add more products
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-xs text-sm">
            {items.some((i) => i.mrp !== undefined && Number(i.mrp) > Number(i.price)) && (
              <div className="flex justify-between" style={{ color: '#15803D', fontWeight: 800 }}>
                <span>Discount (10% frames)</span>
                <span>−₹{items.reduce((s, i) => s + (i.mrp !== undefined && Number(i.mrp) > Number(i.price) ? (Number(i.mrp) - Number(i.price)) * i.quantity : 0), 0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray">Subtotal</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray">Delivery</span>
              <span className="font-bold">{shipping === null ? '—' : shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-base" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span className="font-black">TOTAL</span>
              <span className="font-black">₹{shipping === null ? subtotal : subtotal + shipping}</span>
            </div>
            <p className="text-xs text-gray" style={{ textTransform: 'none' }}>
              {shipping === 0 ? 'You’ve unlocked FREE delivery on ₹700+ 🎉' : shipping !== null ? `Add ₹${700 - subtotal} more for FREE delivery` : `Delivery calculated from ₹200 onwards`}
            </p>
          </div>

          {!showCheckout ? (
            <button type="button" disabled={!meetsMinimum} title={meetsMinimum ? 'Proceed to checkout' : `Minimum order ₹${MIN_ORDER_VALUE} — add ₹${amountNeeded} more`} onClick={() => {
              const token = localStorage.getItem('eskraft-token');
              if (!token) { setCheckoutMsg('Please sign in via Account to place order'); return; }
              if (subtotal < MIN_ORDER_VALUE) { setCheckoutMsg(`Minimum order is ₹${MIN_ORDER_VALUE}. Please add ₹${MIN_ORDER_VALUE - subtotal} more to checkout.`); return; }
              setCheckoutMsg('');
              setShowCheckout(true);
            }} className="btn btn-accent" style={{ padding: '1.25rem', opacity: meetsMinimum ? 1 : 0.5, cursor: meetsMinimum ? 'pointer' : 'not-allowed' }}>
              {meetsMinimum ? 'PROCEED TO CHECKOUT' : `ADD ₹${amountNeeded} MORE TO CHECKOUT`}
            </button>
          ) : meetsMinimum ? (
            <CheckoutForm items={items} onSuccess={clearCart} />
          ) : (
            <p className="text-sm text-center" style={{ textTransform: 'none', color: '#b91c1c', fontWeight: 700 }}>
              Minimum order is ₹{MIN_ORDER_VALUE}. <Link to="/category/all" style={{ textDecoration: 'underline' }}>Add more products</Link> to continue.
            </p>
          )}

          {/* Cashfree Payment Form removed - use PAY WITH CASHFREE PG checkout only */}
          {checkoutMsg && <p className="text-sm text-center" style={{textTransform:'none'}}>{checkoutMsg}</p>}
          <p className="text-xs text-center text-gray" style={{ textTransform: 'none' }}>
            Secure checkout · Easy 7-day returns
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
