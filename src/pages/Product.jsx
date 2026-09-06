import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/useCart';

const FRAME_SIZES = [
  { label: '9×12 inches', price: 800 },
  { label: '15×20 inches', price: 1400 },
  { label: '18×24 inches', price: 2000 },
];

const Product = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const product = productsData.find((p) => p.slug === slug);

  const isFrame = product?.category === 'Frames';
  const [selectedSize, setSelectedSize] = useState(FRAME_SIZES[0]);
  const displayPrice = isFrame ? selectedSize.price : product?.price;

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [prevSlug, setPrevSlug] = useState(slug);

  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setActiveImage(0);
    setQuantity(1);
    setAdded(false);
    setSelectedSize(FRAME_SIZES[0]);
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
    const item = isFrame ? { ...product, price: displayPrice, name: `${product.name} (${selectedSize.label})`, selectedSize: selectedSize.label } : product;
    // use composite id for frame variants so different sizes are separate cart lines
    if (isFrame) item.id = `${product.id}__${selectedSize.label}`;
    addItem(item, quantity);
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
              {product.badge && product.badge !== 'NEW' && (
                <span className={`badge ${product.badge === 'LIMITED DROP' ? 'badge-limited' : ''}`} style={{ position: 'absolute', top: '16px', left: '16px' }}>
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
              <span className="text-3xl font-black">₹{displayPrice}</span>
            </div>
            {isFrame && (
              <div>
                <p className="font-bold text-sm mb-2" style={{letterSpacing:'0.08em'}}>FRAME SIZE</p>
                <div className="flex gap-sm" style={{flexWrap:'wrap'}}>
                  {FRAME_SIZES.map(s => (
                    <button key={s.label} type="button" onClick={()=>setSelectedSize(s)}
                      style={{padding:'0.6rem 1rem',borderRadius:8,border:selectedSize.label===s.label?'2px solid #111':'1px solid var(--color-border)',background:selectedSize.label===s.label?'#111':'#fff',color:selectedSize.label===s.label?'#fff':'#111',fontWeight:700,fontSize:'0.85rem'}}>
                      {s.label} — ₹{s.price}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-sm">
              <label htmlFor="qty" className="font-bold text-sm">QUANTITY</label>
              <div className="flex items-center" style={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" style={{ padding: '0.6rem 1rem' }}>−</button>
                <input id="qty" value={quantity} readOnly aria-label="Quantity" style={{ width: '48px', textAlign: 'center', fontWeight: 700 }} />
                <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" style={{ padding: '0.6rem 1rem' }}>+</button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="btn btn-accent"
              style={{ padding: '1.25rem', fontSize: '1rem' }}
            >
              {added ? (<><Check size={20} /> ADDED TO CART</>) : 'ADD TO CART'}
            </button>

            <div className="flex flex-col gap-xs text-sm" style={{color:'var(--color-text)'}}>
              <span className="flex items-center gap-xs"><Truck size={16} /> Free shipping above ₹500</span>
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
