import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';

import Home from './pages/Home';
import Product from './pages/Product';
import Category from './pages/Category';
import CustomOrders from './pages/CustomOrders';
import About from './pages/About';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResults';
import Account from './pages/Account';
import Admin from './pages/Admin';
import ShippingReturns from './pages/ShippingReturns';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Terms from './pages/Terms';
import PaymentStatus from './pages/PaymentStatus';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

const Layout = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    );
  }
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/category" element={<Category />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/custom-orders" element={<CustomOrders />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/account" element={<Account />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Layout />
      </Router>
    </CartProvider>
  );
}

export default App;
