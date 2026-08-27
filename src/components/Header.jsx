import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, User, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const navLinks = [
  { label: 'Shop', to: '/category/all' },
  { label: 'New Drops', to: '/category/new-drops' },
  { label: 'Custom Orders', to: '/custom-orders' },
  { label: 'About', to: '/about' },
];

const Header = () => {
  const { totalCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((open) => !open);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner container">

          {/* ── Left: Hamburger (mobile) + Desktop Nav ── */}
          <div className="header-left">
            <button
              className="icon-btn hamburger"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            <nav className="desktop-nav" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ── Centre: Wordmark ── */}
          <Link to="/" className="wordmark" aria-label="ESKRAFT Home">
            ESKRAFT
          </Link>

          {/* ── Right: Icons ── */}
          <div className="header-right">
            <button
              className="icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen((open) => !open)}
            >
              <Search size={20} />
            </button>

            <Link to="/account" className="icon-btn desktop-account" aria-label="Account">
              <User size={20} />
            </Link>

            <button
              type="button"
              className="icon-btn cart-btn"
              aria-label={`Cart — ${totalCount} item${totalCount !== 1 ? 's' : ''}`}
              onClick={openCart}
            >
              <ShoppingCart size={20} />
              {totalCount > 0 && (
                <span className="cart-badge" aria-hidden="true">{totalCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        {searchOpen && (
          <div className="search-bar-wrap">
            <form onSubmit={handleSearch} className="search-form container">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="search-input"
                aria-label="Search products"
              />
              <button type="submit" className="btn" style={{ padding: '0.65rem 1.5rem', fontSize: '0.8rem' }}>
                GO
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile slide-down menu ── */}
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <div className="mobile-menu-header container">
              <span className="mobile-menu-title">Menu</span>
              <button className="icon-btn" onClick={toggleMenu} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <ul className="mobile-menu-list container">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="mobile-menu-link"
                    onClick={toggleMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  className="mobile-menu-link mobile-cart-link"
                  onClick={() => { openCart(); toggleMenu(); }}
                >
                  Cart {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* ── Scoped styles ── */}
      <style>{`

        /* ── Header shell ── */
        .site-header {
          position: sticky;
          top: 0;
          z-index: 200;
          background-color: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
        }

        .header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 72px;
          gap: 1rem;
        }

        /* ── Left ── */
        .header-left {
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ── Wordmark ── */
        .wordmark {
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: clamp(1.35rem, 3.5vw, 1.9rem);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text);
          white-space: nowrap;
          text-align: center;
          line-height: 1;
        }

        /* ── Right ── */
        .header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.25rem;
        }

        /* ── Icon buttons ── */
        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          color: var(--color-text);
          transition: background-color var(--transition-fast), color var(--transition-fast);
          cursor: pointer;
          background: none;
          border: none;
          position: relative;
          flex-shrink: 0;
        }

        .icon-btn:hover {
          background-color: rgba(0, 0, 0, 0.06);
        }

        /* ── Desktop nav ── */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.1rem;
        }

        .nav-link {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text);
          opacity: 0.65;
          padding: 6px 10px;
          border-radius: 4px;
          position: relative;
          transition: opacity var(--transition-fast), background-color var(--transition-fast);
          white-space: nowrap;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 10px;
          right: 10px;
          height: 1.5px;
          background-color: var(--color-wood-dark);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform var(--transition-fast);
        }

        .nav-link:hover { opacity: 1; background-color: rgba(0,0,0,0.04); }
        .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }
        .nav-link.active { opacity: 1; }

        /* ── Cart badge ── */
        .cart-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background-color: var(--color-wood-dark);
          color: var(--color-linen);
          font-size: 0.6rem;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        /* ── Search bar ── */
        .search-bar-wrap {
          border-top: 1px solid var(--color-border);
          background-color: var(--color-bg);
          padding: 0.75rem 0;
        }

        .search-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.65rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          background-color: transparent;
          color: var(--color-text);
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .search-input:focus {
          border-color: var(--color-wood-dark);
        }

        /* ── Mobile menu ── */
        .mobile-menu {
          background-color: var(--color-bg);
          border-top: 1px solid var(--color-border);
          padding-bottom: 1.5rem;
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          padding-bottom: 0.75rem;
        }

        .mobile-menu-title {
          font-family: var(--font-heading);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-gray);
        }

        .mobile-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem 0;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text);
          border-bottom: 1px solid var(--color-border);
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          cursor: pointer;
          text-align: left;
          transition: color var(--transition-fast), padding-left var(--transition-fast);
        }

        .mobile-menu-link:hover {
          color: var(--color-wood-dark);
          padding-left: 0.5rem;
        }

        /* ── Responsive visibility ── */
        @media (max-width: 768px) {
          .desktop-nav   { display: none !important; }
          .desktop-account { display: none !important; }
          .header-inner  { height: 64px; }
          .wordmark      { font-size: clamp(1.2rem, 5vw, 1.6rem); }
        }

        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
          .header-right { gap: 0.5rem; }
        }

        @media (min-width: 1024px) {
          .header-inner { height: 80px; }
          .desktop-nav  { gap: 0.25rem; }
          .nav-link     { font-size: 0.75rem; padding: 6px 14px; }
        }

      `}</style>
    </>
  );
};

export default Header;
