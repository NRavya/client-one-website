import React from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon, YouTubeIcon } from './icons';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#111111', color: '#FFFFFF', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-12">
          
          {/* Brand & Story */}
          <div>
            <img src="/assets/logo-white.png?v=4" alt="ESKRAFT Logo" style={{ height: '72px', marginBottom: '0.75rem', objectFit: 'contain', display: 'block' }} />
            <h3 className="font-heading text-2xl font-bold mb-4">ESKRAFT</h3>
            <p className="text-sm text-gray mb-2" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              No.13 Reddypalayam Street West -Mogappair Chennai-600037
            </p>
            <p className="text-sm text-gray mb-2" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              eskraft135@gmail.com
            </p>
            <p className="text-sm text-gray" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              +91 89397 75500
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-4">SHOP</h4>
            <div className="flex flex-col gap-xs">
              <Link to="/category/all" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>All Products</Link>
              <Link to="/category/frames" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Frames</Link>
              <Link to="/category/anime-phone-stands" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Anime Phone Stands</Link>
              <Link to="/category/customized-keychains" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Customized Keychains</Link>
              <Link to="/category/new-drops" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>New Drops</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-4">HELP</h4>
            <div className="flex flex-col gap-xs">
              <Link to="/faq" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>FAQ</Link>
              <Link to="/shipping-returns" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Shipping & Returns</Link>
              <Link to="/contact" className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Contact Us</Link>

            </div>
          </div>

          {/* Socials & Newsletter */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-4">CONNECT</h4>
            <div className="flex gap-sm mb-4">
              <a href="https://www.instagram.com/eskraft__?igsh=dHZpcHVwcHVnbmNn" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: '#FFFFFF', display: 'flex' }}>
                <InstagramIcon size={20} />
              </a>
              <a href="https://www.facebook.com/people/ES-Kraft/61581961087129" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#FFFFFF', display: 'flex' }}>
                <FacebookIcon size={20} />
              </a>
              <a href="https://www.youtube.com/@eskraft" target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ color: '#FFFFFF', display: 'flex' }}>
                <YouTubeIcon size={20} />
              </a>
            </div>
            <p className="text-xs mb-2" style={{ color: 'rgba(245, 239, 230, 0.8)' }}>Join our newsletter to get notified about the products.</p>
            <div style={{ display: 'flex', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '4px', overflow: 'hidden' }}>
              <input type="email" placeholder="Email Address" style={{ background: 'transparent', border: 'none', padding: '8px 12px', color: '#FFFFFF', outline: 'none', flex: 1, fontSize: '0.875rem' }} />
              <button style={{ background: '#333333', padding: '8px 16px', color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.875rem' }}>&rarr;</button>
            </div>
          </div>

        </div>

        {/* Links */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }} className="md:flex-row md:justify-between">
          <div className="flex gap-sm text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/shipping-returns">Shipping & Returns</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/custom-orders">Custom Orders</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
