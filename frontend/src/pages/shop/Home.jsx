import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // En son eklenen 6 ürünü getir
        const response = await api.get('/urunler/?limit=6');
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-primary-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
        {/* Dekoratif Desen */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:px-16 flex flex-col items-start max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-100 text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
            Yeni Sezon İndirimleri Başladı
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Kaliteli ürünler, <br/>
            <span className="text-accent-400">hızlı teslimat.</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl leading-relaxed">
            LocalShop ile aradığınız her şey tek tıkla kapınızda. Güvenilir alışverişin, seçkin markaların ve modern arayüzün keyfini çıkarın.
          </p>
          <Link to="/urunler" className="btn bg-accent-500 text-surface-900 hover:bg-accent-400 text-lg px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-accent-500/30 group">
            Hemen Keşfet
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Özellikler */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card p-6 flex flex-col items-center text-center bg-white border-0 shadow-sm">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4 rotate-3">
            <Truck size={28} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Aynı Gün Teslimat</h3>
          <p className="text-surface-500 text-sm">Saat 14:00'ten önce verilen siparişler aynı gün kargoda.</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center bg-white border-0 shadow-sm">
          <div className="w-14 h-14 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center mb-4 -rotate-3">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Güvenli Alışveriş</h3>
          <p className="text-surface-500 text-sm">256-bit SSL sertifikası ile ödemeleriniz %100 güvende.</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center bg-white border-0 shadow-sm">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 rotate-3">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">En İyi Fiyatlar</h3>
          <p className="text-surface-500 text-sm">Piyasadaki en rekabetçi fiyatlar ve sürekli kampanyalar.</p>
        </div>
      </section>

      {/* Öne Çıkan Ürünler */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Yeni Eklenenler</h2>
          <Link to="/urunler" className="hidden sm:flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors group">
            Tümünü Gör
            <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card p-5 animate-pulse">
                <div className="bg-surface-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-5 bg-surface-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-surface-200 rounded w-full mb-4"></div>
                <div className="flex justify-between items-end">
                  <div className="h-6 bg-surface-200 rounded w-1/3"></div>
                  <div className="h-10 w-10 bg-surface-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-50 rounded-2xl border border-surface-200 border-dashed">
            <p className="text-surface-500 text-lg">Henüz hiç ürün eklenmemiş.</p>
          </div>
        )}
        
        <div className="mt-8 sm:hidden flex justify-center">
          <Link to="/urunler" className="btn btn-secondary w-full">Tüm Ürünleri Gör</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
