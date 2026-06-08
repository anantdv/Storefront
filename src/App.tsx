import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { AIChatWidget } from './components/layout/AIChatWidget';
import { AuthModal } from './components/layout/AuthModal';

// Pages
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account';
import { StoreLocator } from './pages/StoreLocator';
import { HirePurchase } from './pages/HirePurchase';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Sticky header */}
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Side navigation drawer for smaller viewports */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Global Auth Modal — triggered by Cart / Checkout login guard */}
      <AuthModal />

      {/* Movable AI chat assistant floating widget */}
      <AIChatWidget />

      {/* Primary body contents */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/store-locator" element={<StoreLocator />} />
          <Route path="/hire-purchase" element={<HirePurchase />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
