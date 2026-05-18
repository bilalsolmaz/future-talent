import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/shop/Home';
import Products from './pages/shop/Products';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Profile from './pages/shop/Profile';
import Favorites from './pages/shop/Favorites';
import About from './pages/shop/About';
import FAQ from './pages/shop/FAQ';
import Contact from './pages/shop/Contact';
import KVKK from './pages/shop/KVKK';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';
import AdminLayout from './pages/admin/Dashboard';
import AdminHome from './pages/admin/AdminHome';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import FinanceAdmin from './pages/admin/FinanceAdmin';
import ReturnsAdmin from './pages/admin/ReturnsAdmin';
import ChatbotWidget from './components/ChatbotWidget';

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
            <Route path="iadeler" element={<ReturnsAdmin />} />
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
                <Route path="/hakkimizda" element={<About />} />
                <Route path="/sss" element={<FAQ />} />
                <Route path="/iletisim" element={<Contact />} />
                <Route path="/kvkk" element={<KVKK />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* Müşteri Korumalı Rotalar */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profil" element={<Profile />} />
                  <Route path="/favoriler" element={<Favorites />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <ChatbotWidget />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
