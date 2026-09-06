import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, PenTool, Frame, Smartphone, CalendarHeart, Tag, Gift } from 'lucide-react';
import { InstagramIcon } from '../components/icons';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';

const categories = [
  { title: 'FRAMES', slug: 'frames', desc: 'Handcrafted wooden frames for your walls.', icon: <Frame size={32} /> },
  { title: 'ANIME PHONE STANDS', slug: 'anime-phone-stands', desc: 'Engraved stands for your favorite series.', icon: <Smartphone size={32} /> },
  { title: 'ENGRAVED WOODEN CRAFTS', slug: 'engraved-crafts', desc: 'Mandala panels, name plates and more.', icon: <PenTool size={32} /> },
  { title: 'DOG TAG KEYCHAINS', slug: 'dog-tag-keychains', desc: 'Personalized tags, etched to last.', icon: <Tag size={32} /> },
  { title: 'ENGRAVED DATES', slug: 'engraved-dates', desc: 'The days that matter, carved in wood.', icon: <CalendarHeart size={32} /> },

];

const HandHeartIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21 C12 21 5 16.5 5 10.2 C5 7.1 7.3 5 10 5 C11.6 5 12.9 5.9 14 7.1 C15.1 5.9 16.4 5 18 5 C20.7 5 23 7.1 23 10.2 C23 16.5 16 21 16 21 L12 21 Z M12 21 L12 13.5 M10.5 13.5 C10.5 13.5 9 12 9 10.2 M13.5 13.5 C13.5 13.5 15 12 15 10.2" opacity="0" />
    <path d="M8 12.5 L8 6.2 C8 5.2 8.8 4.4 9.8 4.4 C10.8 4.4 11.6 5.2 11.6 6.2 L11.6 10 M11.6 10 L11.6 5.5 C11.6 4.5 12.4 3.7 13.4 3.7 C14.4 3.7 15.2 4.5 15.2 5.5 L15.2 10 M15.2 10 L15.2 7 C15.2 6 16 5.2 17 5.2 C18 5.2 18.8 6 18.8 7 L18.8 12.2 C18.8 14.3 18 16.4 16.5 17.9 L13.5 20.9 C12.7 21.7 11.5 21.7 10.7 20.9 L6.2 16.4 C5 15.2 4.5 13.5 5.2 12 L8 12.5 Z" />
    <path d="M10.2 15.2 C9.5 14.5 9.5 13.3 10.2 12.6 C10.9 11.9 12.1 11.9 12.8 12.6 C13.5 11.9 14.7 11.9 15.4 12.6 C16.1 13.3 16.1 14.5 15.4 15.2 L12.8 17.8 L10.2 15.2 Z" />
  </svg>
);

const LaserIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="3" width="12" height="4" rx="0.5" />
    <path d="M10 7 L11.5 11 L12 11.8 L12.5 11 L14 7" />
    <path d="M12 11.8 L12 15" />
    <path d="M10 14.5 L9 17 M12 15 L12 17 M14 14.5 L15 17" />
    <rect x="3" y="19" width="7" height="2.5" />
    <rect x="14" y="19" width="7" height="2.5" />
  </svg>
);

const features = [
  { title: 'HANDCRAFTED', desc: 'Designed and crafted with attention to detail.', icon: <HandHeartIcon size={44} /> },
  { title: 'PRECISION CUT', desc: 'Laser-cut and engraved for clean details.', icon: <LaserIcon size={44} /> },
  { title: 'MADE FOR GIFTING', desc: 'Small things that become memorable.', icon: <Gift size={40} /> },
];

const instagramPosts = [
  'https://images.unsplash.com/photo-1616428221876-00fb74e6c31a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1584347783935-7c3fb3c76744?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1616428222046-271d49141097?auto=format&fit=crop&q=80&w=600',
];

const Home = () => {
  const newDrops = [];
  const bestsellers = productsData.filter((p) => p.isBestseller);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        <div className="container relative flex flex-col items-center text-center gap-md" style={{ zIndex: 2 }}>
          <span className="text-sm font-bold reveal" style={{ letterSpacing: '0.15em', color: '#999999' }}>
            HANDCRAFTED. LASER CUT. MADE TO STAND OUT.
          </span>
          <h1 className="hero-title font-black text-white reveal" style={{ animationDelay: '0.08s' }}>
            WOOD. ART.<br />PERSONALITY.
          </h1>
          <p className="text-lg reveal" style={{ maxWidth: '600px', color: 'rgba(255,255,255,0.85)', textTransform: 'none', fontWeight: 400, animationDelay: '0.16s' }}>
            Handcrafted frames, anime stands and personalized pieces made for people who don't want boring things.
          </p>
          <div className="flex flex-wrap justify-center gap-sm reveal" style={{ marginTop: '1rem', animationDelay: '0.24s' }}>
            <Link to="/category/all" className="btn" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-bg)' }}>
              SHOP THE DROP
            </Link>
            <Link to="/custom-orders" className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>
              EXPLORE CUSTOMS
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div style={{ backgroundColor: '#111111', color: '#FFFFFF', padding: '1rem 0' }}>
        <div className="container flex flex-wrap justify-center md:justify-between items-center gap-sm text-xs md:text-sm font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span className="flex items-center gap-xs"><ShieldCheck size={18} /> Premium Quality</span>
          <span className="flex items-center gap-xs"><PenTool size={18} /> Handcrafted</span>
        </div>
      </div>

      {/* Shop by Mood / Category */}
      <section className="section container">
        <h2 className="section-title text-center mb-12">WHAT ARE YOU HERE FOR?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
          {categories.map((cat) => (
            <Link to={`/category/${cat.slug}`} key={cat.slug} className="cat-card flex flex-col items-center text-center" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ marginBottom: '1.5rem', color: '#111111' }}>{cat.icon}</div>
              <h3 className="text-base md:text-xl font-bold mb-2">{cat.title}</h3>
              <p className="text-sm text-gray" style={{ textTransform: 'none' }}>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Drops */}
      <section className="section" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
        <div className="container">
          <div className="flex justify-between items-center mb-8" style={{ marginBottom: '3rem' }}>
            <h2 className="section-title">JUST DROPPED</h2>
            <Link to="/category/new-drops" className="text-sm font-bold flex items-center gap-xs" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {newDrops.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section container">
        <div className="flex justify-between items-center mb-8" style={{ marginBottom: '3rem' }}>
          <h2 className="section-title">BESTSELLERS</h2>
          <Link to="/category/bestsellers" className="text-sm font-bold flex items-center gap-xs" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      

      {/* Why Eskraft */}
      <section className="section container">
        <h2 className="section-title text-center mb-12">MADE DIFFERENT.</h2>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem 3rem', textAlign: 'center' }}>
          {features.map((feat) => (
            <div key={feat.title} className="flex flex-col items-center gap-xs" style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <div style={{ marginBottom: '1rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{feat.icon}</div>
              <h3 className="text-base font-bold" style={{ textAlign: 'center' }}>{feat.title}</h3>
              <p className="text-sm text-gray" style={{ textTransform: 'none', textAlign: 'center', maxWidth: '260px' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Strip */}
      <div style={{ backgroundColor: '#F5F5F5', padding: '2rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container flex flex-wrap justify-center gap-lg text-sm font-bold">
          <span className="flex items-center gap-xs"><Truck size={18} /> FREE SHIPPING ABOVE ₹500</span>
          <span className="flex items-center gap-xs"><RotateCcw size={18} /> EASY 7-DAY RETURNS</span>
        </div>
      </div>


    </div>
  );
};

export default Home;
