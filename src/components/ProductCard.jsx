import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../context/useCart';
import { priceInfo } from '../utils/discount';

const badgeClass = (badge) => {
  if (badge === 'NEW') return 'badge-new';
  if (badge === 'LIMITED DROP') return 'badge-limited';
  return '';
};

const ProductCard = ({ product, showCode = false }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const { mrp, price, discounted, percent } = priceInfo(product);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="product-img-wrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem', backgroundColor: '#f5f5f5', aspectRatio: '4/5' }}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {discounted && (
          <span className="badge" style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#B91C1C' }}>
            {percent}% OFF
          </span>
        )}
        {discounted && product.badge === 'SALE' && (
          <span className="badge" style={{ position: 'absolute', top: '44px', left: '12px' }}>
            SALE
          </span>
        )}
        {!discounted && product.badge && product.badge !== 'NEW' && (
          <span className={`badge ${badgeClass(product.badge)}`} style={{ position: 'absolute', top: '12px', left: '12px' }}>
            {product.badge}
          </span>
        )}
        {product.stock === 0 && (
          <span className="badge" style={{ position: 'absolute', top: '12px', right: '12px' }}>SOLD OUT</span>
        )}
      </div>
      <div className="flex flex-col gap-xs">
        {showCode && product.product_code ? (
          <>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--color-gray)', fontWeight: 600 }}>{product.product_code}</span>
            <h3 className="font-bold" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>{product.product_name || product.name}</h3>
          </>
        ) : (
          <h3 className="font-bold" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>{product.product_name || product.name}</h3>
        )}
        <div className="flex items-center gap-sm">
          {discounted ? (
            <>
              <span className="text-lg font-black">₹{price}</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--color-gray)', fontSize: '0.9rem' }}>₹{mrp}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803D' }}>SAVE ₹{mrp - price}</span>
            </>
          ) : (
            <span className="text-lg font-black">₹{product.price}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={product.stock === 0 || added}
        className={`btn w-full ${added ? 'btn-accent' : ''}`}
        style={{ padding: '0.75rem', marginTop: '1rem' }}
      >
        {product.stock === 0 ? 'SOLD OUT' : added ? (<><Check size={16} /> ADDED</>) : 'ADD TO CART'}
      </button>
    </Link>
  );
};

export default ProductCard;
