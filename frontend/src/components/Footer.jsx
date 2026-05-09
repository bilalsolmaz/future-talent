import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, Phone, Mail, MapPin, CreditCard, Shield, Truck, RotateCcw
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-surface-300 mt-auto">
      {/* Güven Barı */}
      <div className="border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/10 text-primary-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Hızlı Kargo</p>
                <p className="text-xs text-surface-400">Aynı gün kargo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Güvenli Ödeme</p>
                <p className="text-xs text-surface-400">256-bit SSL</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Kolay İade</p>
                <p className="text-xs text-surface-400">14 gün iade hakkı</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">7/24 Destek</p>
                <p className="text-xs text-surface-400">Müşteri hizmetleri</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Footer İçeriği */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Marka */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">LocalShop</span>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed mb-4">
              Türkiye'nin en güvenilir online alışveriş platformu. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors text-white text-xs font-bold" aria-label="Instagram">
                IG
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors text-white text-xs font-bold" aria-label="Twitter">
                X
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors text-white text-xs font-bold" aria-label="Facebook">
                FB
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors text-white text-xs font-bold" aria-label="YouTube">
                YT
              </a>
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Kurumsal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/hakkimizda" className="text-sm text-surface-400 hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="text-sm text-surface-400 hover:text-white transition-colors">İletişim</Link></li>
              <li><Link to="/sss" className="text-sm text-surface-400 hover:text-white transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/kvkk" className="text-sm text-surface-400 hover:text-white transition-colors">KVKK & Gizlilik</Link></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Müşteri Hizmetleri</h4>
            <ul className="space-y-2.5">
              <li><Link to="/urunler" className="text-sm text-surface-400 hover:text-white transition-colors">Tüm Ürünler</Link></li>
              <li><Link to="/profil" className="text-sm text-surface-400 hover:text-white transition-colors">Sipariş Takibi</Link></li>
              <li><Link to="/favoriler" className="text-sm text-surface-400 hover:text-white transition-colors">Favorilerim</Link></li>
              <li><Link to="/sss" className="text-sm text-surface-400 hover:text-white transition-colors">İade Koşulları</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-surface-400">Levent Mah. Teknoloji Cad. No:42, İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <span className="text-sm text-surface-400">0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <span className="text-sm text-surface-400">destek@localshop.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alt Çizgi */}
      <div className="border-t border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            &copy; {new Date().getFullYear()} LocalShop. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-500 mr-2">Güvenli Ödeme:</span>
            <div className="flex items-center gap-1.5">
              {['Visa', 'MC', 'Troy'].map(card => (
                <div key={card} className="px-2.5 py-1 bg-surface-800 rounded text-[10px] font-bold text-surface-300 border border-surface-700">
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
