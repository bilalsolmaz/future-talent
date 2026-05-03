import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/shop/Home';
import Products from './pages/shop/Products';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Profile from './pages/shop/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';
import AdminLayout from './pages/admin/Dashboard';
import AdminHome from './pages/admin/AdminHome';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import FinanceAdmin from './pages/admin/FinanceAdmin';

function App() {
  return (
    <Router>
      <Routes>
        {/* ============================== */}
        {/* ADMIN PANELİ — Kendi Layout'u  */}
        {/* ============================== */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="urunler" element={<ProductsAdmin />} />
            <Route path="kategoriler" element={<CategoriesAdmin />} />
            <Route path="siparisler" element={<OrdersAdmin />} />
            <Route path="finans" element={<FinanceAdmin />} />
          </Route>
        </Route>

        {/* ============================== */}
        {/* MAĞAZA — Navbar + Footer       */}
        {/* ============================== */}
        <Route path="/*" element={
          <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/urunler" element={<Products />} />
                <Route path="/urunler/:id" element={<ProductDetail />} />
                <Route path="/sepet" element={<Cart />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* Müşteri Korumalı Rotalar */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profil" element={<Profile />} />
                </Route>
              </Routes>
            </main>
            <footer className="bg-white border-t border-surface-200 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center text-surface-500 text-sm">
                  &copy; {new Date().getFullYear()} LocalShop. Tüm hakları saklıdır.
                </p>
              </div>
            </footer>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
