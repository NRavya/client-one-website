import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../context/useCart';

const badgeClass = (badge) => {
  if (badge === 'NEW') return 'badge-new';
  if (badge === 'LIMITED DROP') return 'badge-limited';
  return '';
};

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

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
        {product.badge && (
          <span className={`badge ${badgeClass(product.badge)}`} style={{ position: 'absolute', top: '12px', left: '12px' }}>
            {product.badge}
          </span>
        )}
        {product.stock === 0 && (
          <span className="badge" style={{ position: 'absolute', top: '12px', right: '12px' }}>SOLD OUT</span>
        )}
      </div>
      <div className="flex flex-col gap-xs">
        <h3 className="text-base font-bold">{product.name}</h3>
        <div className="flex items-center gap-sm">
          <span className="text-lg font-black">₹{product.price}</span>
          {product.compareAtPrice && <span className="text-sm text-gray" style={{ textDecoration: 'line-through' }}>₹{product.compareAtPrice}</span>}
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
