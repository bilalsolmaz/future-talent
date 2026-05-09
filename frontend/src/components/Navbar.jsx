import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Store, User, LogOut, Shield, Search, 
  Menu, X, ChevronRight, Smartphone, Monitor, Tv, 
  Headphones, Shirt, Home as HomeIcon, Sparkles, Dumbbell,
  Package, Bell, Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

// Kategori → ikon eşleşmesi
const categoryIcons = {
  'Akıllı Telefonlar': Smartphone,
  'Bilgisayar & Tablet': Monitor,
  'TV & Görüntü': Tv,
  'Kulaklık & Ses Sistemleri': Headphones,
  'Giyim & Moda': Shirt,
  'Ev & Yaşam': HomeIcon,
  'Kişisel Bakım': Sparkles,
  'Spor & Outdoor': Dumbbell,
};

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/kategoriler/');
        setCategories(res.data);
      } catch (e) { /* silent */ }
    };
    fetchCategories();
  }, []);

  // Bildirim sayacı — müşteri için işlenmiş (onaylandi/reddedildi) iadeler
  useEffect(() => {
    if (!user || isAdmin) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/iadeler/benim');
        const resolved = res.data.filter(r => r.durum !== 'bekliyor');
        setNotifCount(resolved.length);
      } catch (e) { /* silent */ }
    };
    fetchNotifs();
  }, [user, isAdmin]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/urunler?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (catId) => {
    navigate(`/urunler?kategori_id=${catId}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ──── ÜST ŞERIT: Bilgi / Promo Mesajı ──── */}
      <div className="bg-primary-900 text-primary-100 text-xs text-center py-1.5 font-medium tracking-wide">
        <span className="hidden sm:inline">🚚 500₺ ve üzeri siparişlerde </span>
        <span className="font-bold text-white">KARGO BEDAVA!</span>
        <span className="hidden sm:inline"> • Aynı gün kargo 🎉</span>
      </div>

      {/* ──── ANA NAVİGASYON ÇUBUĞU ──── */}
      <div className="bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            
            {/* Mobil Menü Butonu */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-surface-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-surface-50"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20">
                <Store size={22} />
              </div>
              <span className="text-xl font-bold tracking-tight text-surface-900 hidden sm:inline">
                LocalShop
              </span>
            </Link>

            {/* ──── ARAMA ÇUBUĞU (Desktop) ──── */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="flex w-full rounded-xl border-2 border-surface-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all overflow-hidden bg-surface-50">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ürün, kategori veya marka ara..."
                  className="flex-1 px-4 py-2.5 text-sm bg-transparent border-none outline-none placeholder-surface-400 text-surface-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 flex items-center justify-center transition-colors"
                  aria-label="Ara"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* ──── SAĞ TARAF AKSYONLARI ──── */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              
              {/* Mobil Arama İkonu */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-surface-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-surface-50"
                aria-label="Ara"
              >
                <Search size={20} />
              </button>

              {/* Bildirim Zili — Müşteriler için */}
              {user && !isAdmin && (
                <Link
                  to="/profil?tab=returns"
                  className="relative p-2.5 text-surface-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-surface-50"
                  title="Bildirimler"
                >
                  <Bell size={20} />
                  {notifCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm shadow-red-500/40">
                      {notifCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Favoriler */}
              {user && !isAdmin && (
                <Link
                  to="/favoriler"
                  className="p-2.5 text-surface-600 hover:text-red-500 transition-colors rounded-lg hover:bg-surface-50"
                  title="Favorilerim"
                >
                  <Heart size={20} />
                </Link>
              )}

              {/* Sepet — Sadece müşterilere göster */}
              {!isAdmin && (
                <Link 
                  to="/sepet" 
                  className="relative p-2.5 text-surface-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-surface-50 flex items-center gap-1.5"
                >
                  <ShoppingCart size={20} />
                  <span className="hidden lg:inline text-xs font-semibold text-surface-700">Sepetim</span>
                  {totalItems > 0 && (
                    <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-accent-500 rounded-full shadow-sm shadow-accent-500/40 animate-bounce">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-1 sm:gap-2 ml-1 pl-2 border-l border-surface-200">
                  {isAdmin ? (
                    <Link to="/admin" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg">
                      <Shield size={16} />
                      <span className="hidden sm:inline font-semibold text-xs">Admin Paneli</span>
                    </Link>
                  ) : (
                    <Link to="/profil" className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-surface-50">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {user.isim.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden lg:flex flex-col">
                        <span className="text-[10px] text-surface-400">Hesabım</span>
                        <span className="text-xs font-semibold text-surface-800 -mt-0.5">{user.isim}</span>
                      </div>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title="Çıkış Yap"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 ml-1 pl-2 border-l border-surface-200">
                  <Link to="/auth/login" className="flex items-center gap-1.5 text-surface-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50">
                    <User size={18} />
                    <div className="hidden lg:flex flex-col">
                      <span className="text-[10px] text-surface-400">Giriş Yap</span>
                      <span className="text-xs font-semibold text-surface-800 -mt-0.5">Hesabım</span>
                    </div>
                  </Link>
                  <Link to="/auth/register" className="hidden md:flex btn btn-primary text-xs py-1.5 px-3">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ──── MOBİL ARAMA ÇUBUĞU ──── */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-surface-100 bg-white p-3">
            <form onSubmit={handleSearch} className="flex rounded-xl border-2 border-primary-300 overflow-hidden">
              <input
                type="text"
                placeholder="Ne aramıştınız?"
                className="flex-1 px-4 py-2.5 text-sm bg-transparent border-none outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="bg-primary-600 text-white px-4" aria-label="Ara">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ──── KATEGORİ ALT MENÜSÜ (Desktop) ──── */}
      <nav className="hidden lg:block bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
            <Link 
              to="/urunler" 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-surface-800 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors whitespace-nowrap"
            >
              <Package size={14} />
              Tüm Ürünler
            </Link>
            <span className="w-px h-5 bg-surface-200" />
            {categories.map(cat => {
              const Icon = categoryIcons[cat.isim] || Package;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors whitespace-nowrap"
                >
                  <Icon size={14} />
                  {cat.isim}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ──── MOBİL MENÜ OVERLAY ──── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(theme(spacing.16)+28px)] z-40 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="bg-white w-72 h-full shadow-2xl overflow-y-auto animate-slide-in-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-surface-100">
              <p className="text-sm font-bold text-surface-900">Kategoriler</p>
            </div>
            <div className="p-2">
              <Link 
                to="/urunler"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-surface-800 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              >
                <Package size={18} className="text-primary-500" />
                Tüm Ürünler
                <ChevronRight size={16} className="ml-auto text-surface-300" />
              </Link>
              {categories.map(cat => {
                const Icon = categoryIcons[cat.isim] || Package;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-surface-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                  >
                    <Icon size={18} className="text-surface-400" />
                    {cat.isim}
                    <ChevronRight size={16} className="ml-auto text-surface-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
