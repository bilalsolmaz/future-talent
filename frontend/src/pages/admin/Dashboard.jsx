import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tags, ShoppingCart, Store, LogOut, 
  ChevronLeft, ChevronRight, Menu, X, DollarSign, RotateCcw, Plug
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Siparişler', path: '/admin/siparisler', icon: ShoppingCart },
    { name: 'İadeler', path: '/admin/iadeler', icon: RotateCcw },
    { name: 'Ürünler', path: '/admin/urunler', icon: Package },
    { name: 'Kategoriler', path: '/admin/kategoriler', icon: Tags },
    { name: 'Finans', path: '/admin/finans', icon: DollarSign },
    { name: 'Entegrasyonlar', path: '/admin/entegrasyonlar', icon: Plug },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const currentPage = navItems.find(item => isActive(item))?.name || 'Admin';

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f172a] transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Store size={20} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-lg leading-tight">LocalShop</h1>
              <p className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User & Collapse */}
        <div className="border-t border-white/10 p-3 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.isim?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.isim || 'Admin'}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Çıkış Yap</span>}
          </button>
          
          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-full mt-2 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Mağazaya Git">
              <Store size={16} />
              <span className="hidden sm:inline">Mağaza</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
