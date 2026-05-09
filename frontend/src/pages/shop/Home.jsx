import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, TrendingUp, ShieldCheck, Truck, ChevronLeft, ChevronRight,
  Smartphone, Monitor, Tv, Headphones, Shirt, Sparkles, Dumbbell,
  Flame, Percent, Gift, Star, Timer, Zap
} from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

// ─── Carousel Slide verileri ───────────────────────────
const heroSlides = [
  {
    id: 1,
    title: 'Yeni Sezon Teknoloji',
    subtitle: 'Son model akıllı telefonlar ve tabletlerde büyük fırsatlar!',
    cta: 'Hemen Keşfet',
    link: '/urunler?kategori_id=2',
    gradient: 'from-blue-700 via-blue-600 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    accent: 'bg-blue-400',
  },
  {
    id: 2,
    title: 'Moda & Tarz',
    subtitle: 'Nike, Levi\'s ve daha fazlası şimdi indirimde.',
    cta: 'Koleksiyonu İncele',
    link: '/urunler?kategori_id=6',
    gradient: 'from-rose-700 via-pink-600 to-fuchsia-700',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    accent: 'bg-pink-400',
  },
  {
    id: 3,
    title: 'Ev & Yaşam',
    subtitle: 'Dyson, Philips, iRobot — Evinizi akıllandırın.',
    cta: 'Ürünleri Gör',
    link: '/urunler?kategori_id=7',
    gradient: 'from-emerald-700 via-teal-600 to-cyan-700',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    accent: 'bg-emerald-400',
  },
  {
    id: 4,
    title: 'Spor & Outdoor',
    subtitle: 'Apple Watch, Garmin ve spor giyim ürünlerinde fırsatlar.',
    cta: 'Fırsatlara Bak',
    link: '/urunler?kategori_id=9',
    gradient: 'from-orange-700 via-amber-600 to-yellow-600',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    accent: 'bg-amber-400',
  },
];

// Kategori ikonları ve renkleri
const categoryDisplay = [
  { isim: 'Akıllı Telefonlar', icon: Smartphone, color: 'bg-blue-50 text-blue-600', hoverBg: 'hover:bg-blue-100' },
  { isim: 'Bilgisayar & Tablet', icon: Monitor, color: 'bg-indigo-50 text-indigo-600', hoverBg: 'hover:bg-indigo-100' },
  { isim: 'TV & Görüntü', icon: Tv, color: 'bg-purple-50 text-purple-600', hoverBg: 'hover:bg-purple-100' },
  { isim: 'Kulaklık & Ses Sistemleri', icon: Headphones, color: 'bg-pink-50 text-pink-600', hoverBg: 'hover:bg-pink-100' },
  { isim: 'Giyim & Moda', icon: Shirt, color: 'bg-rose-50 text-rose-600', hoverBg: 'hover:bg-rose-100' },
  { isim: 'Ev & Yaşam', icon: Sparkles, color: 'bg-emerald-50 text-emerald-600', hoverBg: 'hover:bg-emerald-100' },
  { isim: 'Kişisel Bakım', icon: Star, color: 'bg-amber-50 text-amber-600', hoverBg: 'hover:bg-amber-100' },
  { isim: 'Spor & Outdoor', icon: Dumbbell, color: 'bg-orange-50 text-orange-600', hoverBg: 'hover:bg-orange-100' },
];

// ─── Hero Carousel Bileşeni ───────────────────────────
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroSlides.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setCurrent(idx);
    startTimer();
  };

  const prev = () => goTo((current - 1 + heroSlides.length) % heroSlides.length);
  const next = () => goTo((current + 1) % heroSlides.length);

  const slide = heroSlides[current];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl group" style={{ minHeight: '380px' }}>
      {/* Arka Plan Görseli */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <img 
          src={slide.image} 
          alt={slide.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`} />
      </div>

      {/* İçerik */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-12 lg:px-16 py-16 sm:py-20 max-w-2xl">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${slide.accent} text-white text-xs font-bold mb-4 w-fit shadow-lg`}>
          <Zap size={12} /> KAMPANYA
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight leading-tight drop-shadow-lg">
          {slide.title}
        </h2>
        <p className="text-base sm:text-lg text-white/90 mb-6 leading-relaxed max-w-lg">
          {slide.subtitle}
        </p>
        <Link 
          to={slide.link}
          className="inline-flex items-center gap-2 bg-white text-surface-900 font-bold px-6 py-3 rounded-xl hover:bg-surface-100 transition-colors shadow-lg w-fit group/btn"
        >
          {slide.cta}
          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Ok Tuşları */}
      <button 
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Önceki"
      >
        <ChevronLeft size={22} />
      </button>
      <button 
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Sonraki"
      >
        <ChevronRight size={22} />
      </button>

      {/* Alt Noktalar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};


// ─── Ana Sayfa ────────────────────────────────────────
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/urunler/?limit=8'),
          api.get('/kategoriler/')
        ]);
        setFeaturedProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-12">

      {/* ──── HERO CAROUSEL ──── */}
      <HeroCarousel />

      {/* ──── HIZLI KATEGORİLER ──── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Kategoriler</h2>
          <Link to="/urunler" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
            Tümünü Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryDisplay.map(cd => {
            const matchedCat = categories.find(c => c.isim === cd.isim);
            if (!matchedCat) return null;
            const Icon = cd.icon;
            return (
              <button
                key={matchedCat.id}
                onClick={() => navigate(`/urunler?kategori_id=${matchedCat.id}`)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-100 bg-white ${cd.hoverBg} transition-all hover:shadow-md hover:-translate-y-0.5 group cursor-pointer`}
              >
                <div className={`w-12 h-12 ${cd.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-semibold text-surface-700 text-center leading-tight">{cd.isim}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ──── PROMOSYON KARTLARI ──── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 flex flex-col justify-between min-h-[180px] group cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => navigate('/urunler')}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} />
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Günün Fırsatları</span>
            </div>
            <h3 className="text-xl font-extrabold mb-1">Kaçırılmayacak<br/>Fiyatlar</h3>
            <p className="text-sm text-white/80">Sınırlı süre, sınırlı stok!</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold mt-3 group-hover:gap-2 transition-all">
            Fırsatlara Göz At <ArrowRight size={16} />
          </div>
          {/* Dekoratif daire */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 flex flex-col justify-between min-h-[180px] group cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => navigate('/urunler?kategori_id=5')}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Percent size={20} />
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Süper İndirimler</span>
            </div>
            <h3 className="text-xl font-extrabold mb-1">Kulaklık &<br/>Ses Sistemleri</h3>
            <p className="text-sm text-white/80">Sepette %15 indirim!</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold mt-3 group-hover:gap-2 transition-all">
            Keşfet <ArrowRight size={16} />
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white p-6 flex flex-col justify-between min-h-[180px] group cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => navigate('/urunler?kategori_id=9')}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift size={20} />
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Yeni Gelenler</span>
            </div>
            <h3 className="text-xl font-extrabold mb-1">Spor &<br/>Outdoor</h3>
            <p className="text-sm text-white/80">500₺ üzeri kargo bedava!</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold mt-3 group-hover:gap-2 transition-all">
            Ürünleri İncele <ArrowRight size={16} />
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
        </div>
      </section>

      {/* ──── ÖNE ÇIKAN ÜRÜNLER ──── */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary-600 rounded-full" />
            <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Yeni Eklenenler</h2>
          </div>
          <Link to="/urunler" className="hidden sm:flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group text-sm">
            Tümünü Gör
            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
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

      {/* ──── ÖZELLİKLER BANTI ──── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 bg-white border border-surface-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-surface-900 text-sm">Hızlı & Ücretsiz Kargo</h3>
            <p className="text-xs text-surface-500 mt-0.5">500₺ üzeri siparişlerde bedava kargo</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white border border-surface-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-surface-900 text-sm">Güvenli Ödeme</h3>
            <p className="text-xs text-surface-500 mt-0.5">256-bit SSL ile %100 güvenli alışveriş</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white border border-surface-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-bold text-surface-900 text-sm">En İyi Fiyat Garantisi</h3>
            <p className="text-xs text-surface-500 mt-0.5">Piyasanın en rekabetçi fiyatları</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
