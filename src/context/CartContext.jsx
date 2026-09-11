import { createContext, useContext, useState, useEffect } from 'react';
import { priceInfo } from '../utils/discount';
import productsData from '../data/products.json';

// ── Create context ──────────────────────────────────────────
const CartContext = createContext(null);

const STORAGE_KEY = 'eskraft-cart';

// Minimum order value (subtotal) — orders above ₹200 only
export const MIN_ORDER_VALUE = 200;

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Reconcile stored lines with the catalog so catalog price changes
// (and discounts) are reflected in the cart. Frame size variants
// (composite `id__label` ids with their own size price) are validated
// against their base id/slug and left as-is when the base matches.
// Lines that match nothing in the catalog by id, slug, or product_code
// (e.g. stale/typo'd ids like "eskann0007") are dropped so they can
// never reach checkout and produce "Product ... not found".
const findCatalogProduct = (it) => {
  if (!it || typeof it !== 'object') return undefined;
  const rawId = String(it.id || '');
  const baseId = rawId.includes('__') ? rawId.split('__')[0] : rawId;
  return productsData.find(
    (p) =>
      p.id === it.id ||
      p.slug === it.slug ||
      (it.product_code && p.product_code === it.product_code) ||
      (baseId && (p.id === baseId || p.slug === baseId))
  );
};

const reconcileCart = (stored) => {
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((it) => Boolean(findCatalogProduct(it)))
    .map((it) => {
      if (String(it.id || '').includes('__')) return it;
      const prod = findCatalogProduct(it);
      if (!prod) return it;
      const info = priceInfo(prod);
      const next = { ...it, price: info.price };
      if (info.discounted) {
        next.mrp = info.mrp;
        next.discountPercent = 10;
      } else {
        delete next.mrp;
        delete next.discountPercent;
      }
      return next;
    });
};

// ── Provider ────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => reconcileCart(loadCart()));
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    // Guests must log in first: do NOT add, redirect to the existing
    // Account login page and return here afterwards via ?redirect=.
    let token = null;
    try { token = localStorage.getItem('eskraft-token'); } catch { token = null; }
    if (!token) {
      try {
        const here = window.location.pathname + window.location.search;
        window.location.href = `/account?redirect=${encodeURIComponent(here)}`;
      } catch {}
      return false;
    }
    // Caller may already split sale/mrp (Product page with size variants);
    // otherwise derive the 10% frame discount here (ProductCard quick-add).
    const hasSplit = product.mrp !== undefined && Number(product.mrp) > Number(product.price);
    const info = hasSplit ? { mrp: Number(product.mrp), price: Number(product.price), discounted: true } : priceInfo(product);
    const salePrice = info.price;
    const mrpValue = info.discounted ? info.mrp : undefined;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, price: salePrice, ...(mrpValue !== undefined ? { mrp: mrpValue } : {}) }
            : item
        );
      }
      // Support both {images:[]} and {image: ''} shapes
      const imageUrl = Array.isArray(product.images) ? product.images[0] : (product.image || '');
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          product_code: product.product_code,
          product_name: product.product_name,
          price: salePrice,
          ...(mrpValue !== undefined ? { mrp: mrpValue, discountPercent: 10 } : {}),
          image: imageUrl,
          quantity,
        },
      ];
    });
    setIsCartOpen(true);
    return true;
  };

  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeItem(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((v) => !v);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
