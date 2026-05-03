import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20">
              <Store size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900">
              LocalShop
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">Ana Sayfa</Link>
            <Link to="/urunler" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">Ürünler</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Sepet — Sadece admin olmayan kullanıcılara göster */}
            {!isAdmin && (
              <Link to="/sepet" className="relative p-2 text-surface-600 hover:text-primary-600 transition-colors rounded-full hover:bg-surface-50">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-accent-500 rounded-full transform translate-x-1/4 -translate-y-1/4 shadow-sm shadow-accent-500/40">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-surface-200">
                {/* Admin ise Admin Paneli linki, değilse profil */}
                {isAdmin ? (
                  <Link to="/admin" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
                    <Shield size={16} />
                    <span className="hidden sm:inline font-semibold text-sm">Admin Paneli</span>
                  </Link>
                ) : (
                  <Link to="/profil" className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {user.isim.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-medium text-sm">{user.isim}</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-surface-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  title="Çıkış Yap"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-2 sm:ml-4 sm:pl-4 border-l border-surface-200">
                <Link to="/auth/login" className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50">
                  <User size={20} />
                  <span className="hidden sm:inline font-medium">Giriş Yap</span>
                </Link>
                <Link to="/auth/register" className="hidden md:flex btn btn-primary text-sm py-1.5 px-4">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
