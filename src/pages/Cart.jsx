import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/useCart';
import CheckoutForm from '../components/CheckoutForm';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalCount } = useCart();
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [checkoutMsg, setCheckoutMsg] = React.useState('');

  const shipping = subtotal > 750 ? 0 : 60;

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
                <span className="text-lg font-black">₹{item.price}</span>
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

          <div className="flex flex-col gap-xs text-sm">
            <div className="flex justify-between">
              <span className="text-gray">Subtotal</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray">Shipping</span>
              <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-base" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span className="font-black">TOTAL</span>
              <span className="font-black">₹{subtotal + shipping}</span>
            </div>
          </div>

          {!showCheckout ? (
            <button type="button" onClick={() => {
              const token = localStorage.getItem('eskraft-token');
              if (!token) { setCheckoutMsg('Please sign in via Account to place order'); return; }
              setShowCheckout(true);
            }} className="btn btn-accent" style={{ padding: '1.25rem' }}>
              PROCEED TO CHECKOUT
            </button>
          ) : (
            <CheckoutForm items={items} onSuccess={clearCart} />
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
