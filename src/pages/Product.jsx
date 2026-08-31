import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/useCart';

const Product = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const product = productsData.find((p) => p.slug === slug);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [prevSlug, setPrevSlug] = useState(slug);

  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setActiveImage(0);
    setQuantity(1);
    setAdded(false);
  }

  if (!product) {
    return (
      <div className="container section text-center flex flex-col items-center gap-md">
        <h1 className="text-4xl font-black mb-2">Product Not Found</h1>
        <Link to="/category/all" className="btn">BROWSE ALL PRODUCTS</Link>
      </div>
    );
  }

  const related = productsData
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const fallbackRelated = productsData.filter((p) => p.id !== product.id && !related.includes(p));
  const suggestions = related.length > 0 ? related : fallbackRelated.slice(0, 3);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % product.images.length);

  return (
    <div>
      <div className="container section">
        <div className="grid md:grid-cols-2 gap-lg" style={{ alignItems: 'start' }}>
          {/* Gallery */}
          <div>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f5f5f5', aspectRatio: '4/5' }}>
              <img src={product.images[activeImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {product.badge && (
                <span className={`badge ${product.badge === 'NEW' ? 'badge-new' : product.badge === 'LIMITED DROP' ? 'badge-limited' : ''}`} style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  {product.badge}
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button type="button" onClick={prevImage} aria-label="Previous image" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', backgroundColor: 'var(--color-bg)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button type="button" onClick={nextImage} aria-label="Next image" style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', backgroundColor: 'var(--color-bg)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-sm" style={{ marginTop: '1rem' }}>
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    style={{
                      width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden',
                      border: i === activeImage ? '2px solid var(--color-text)' : '2px solid var(--color-border)',
                      padding: 0,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-md" style={{ position: 'sticky', top: '120px' }}>
            <p className="text-sm font-bold" style={{ letterSpacing: '0.1em', color: 'var(--color-text)' }}>
              {product.category.toUpperCase()} · {product.type.toUpperCase()}
            </p>
            {product.product_code && <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--color-gray)', fontWeight: 700 }}>{product.product_code}</span>}
            <h1 className="font-black" style={{ fontSize: '2rem', lineHeight: 1.15 }}>{product.product_name || product.name}</h1>
            <div className="flex items-center gap-sm">
              <span className="text-3xl font-black">₹{product.price}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-gray" style={{ textDecoration: 'line-through' }}>₹{product.compareAtPrice}</span>
                  <span className="badge badge-new">SAVE ₹{product.compareAtPrice - product.price}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-sm">
              <label htmlFor="qty" className="font-bold text-sm">QUANTITY</label>
              <div className="flex items-center" style={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" style={{ padding: '0.6rem 1rem' }}>−</button>
                <input id="qty" value={quantity} readOnly aria-label="Quantity" style={{ width: '48px', textAlign: 'center', fontWeight: 700 }} />
                <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" style={{ padding: '0.6rem 1rem' }}>+</button>
              </div>
              <span className="text-sm" style={{color:'var(--color-text)'}}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn btn-accent"
              style={{ padding: '1.25rem', fontSize: '1rem' }}
            >
              {added ? (<><Check size={20} /> ADDED TO CART</>) : product.stock === 0 ? 'SOLD OUT' : 'ADD TO CART'}
            </button>

            <div className="flex flex-col gap-xs text-sm" style={{color:'var(--color-text)'}}>
              <span className="flex items-center gap-xs"><Truck size={16} /> Free shipping above ₹500</span>
              <span className="flex items-center gap-xs"><ShieldCheck size={16} /> Verified COD available</span>
              <span className="flex items-center gap-xs"><RotateCcw size={16} /> Easy 7-day returns</span>
            </div>


          </div>
        </div>
      </div>

      {/* Related */}
      {suggestions.length > 0 && (
        <section className="section container">
          <h2 className="text-4xl font-black mb-8">YOU MIGHT ALSO LIKE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
