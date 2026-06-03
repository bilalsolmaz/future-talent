import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Loader2, BarChart3, Calendar, Banknote,
  Clock, CheckCircle2, XCircle, Wallet, Receipt, Sparkles, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

// ─── Tarih Aralığı Seçici ────────────────────────
const DateRangeSelector = ({ value, onChange }) => {
  const presets = [
    { label: '7 Gün', value: 7 },
    { label: '14 Gün', value: 14 },
    { label: '30 Gün', value: 30 },
    { label: '90 Gün', value: 90 },
  ];
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {presets.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            value === p.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

// ─── Çubuk Grafik ────────────────────────────────
const BarChart = ({ data, color = '#6366f1' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const barCount = data.length;
  const showEvery = barCount > 14 ? Math.ceil(barCount / 12) : 1;

  return (
    <div className="relative">
      {/* Y-axis */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2 w-full">
            <span className="text-[9px] text-gray-400 w-14 text-right flex-shrink-0">
              {i === 0 ? `₺${(max).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}` :
               i === 3 ? '₺0' :
               `₺${(max * (3 - i) / 3).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
            </span>
            <div className="flex-1 border-t border-dashed border-gray-100" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[3px] pl-16" style={{ height: 200 }}>
        {data.map((d, i) => {
          const heightPct = d.value > 0 ? Math.max((d.value / max) * 100, 5) : 1.5;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              {d.value > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                  ₺{d.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <div
                className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-100"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: color,
                  opacity: d.value > 0 ? 0.65 : 0.06,
                  minHeight: d.value > 0 ? 12 : 3,
                }}
              />
              {(i % showEvery === 0 || i === barCount - 1) && (
                <span className="text-[9px] font-medium text-gray-400 mt-1.5 truncate w-full text-center">{d.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Donut Grafik ────────────────────────────────
const DonutChart = ({ segments, size = 150 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full border-[16px] border-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">Veri yok</span>
        </div>
      </div>
    );
  }

  let cumulativePercent = 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }} className="transform -rotate-90">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="20" />
      {segments.filter(s => s.value > 0).map((seg, i) => {
        const percent = seg.value / total;
        const dashLength = percent * circumference;
        const gapSize = 2;
        const dashOffset = -cumulativePercent * circumference;
        cumulativePercent += percent;
        return (
          <circle
            key={i}
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="20"
            strokeDasharray={`${Math.max(dashLength - gapSize, 1)} ${circumference - Math.max(dashLength - gapSize, 1)}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        );
      })}
    </svg>
  );
};

const FinanceAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setAnalyticsLoading(true);
      const [ordersRes, productsRes, analyticsRes] = await Promise.all([
        api.get('/siparisler/'),
        api.get('/urunler/'),
        api.get('/analytics/insights/latest?periyot=aylik').catch(() => ({ data: null }))
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setAnalyticsData(analyticsRes.data);
    } catch (error) {
      console.error('Finans verileri yüklenemedi:', error);
    } finally {
      setIsLoading(false);
      setAnalyticsLoading(false);
    }
  };

  const handleTriggerAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.post('/analytics/insights/trigger?periyot=aylik');
      setAnalyticsData(res.data);
    } catch (error) {
      console.error("Analitik hesaplama tetiklenirken hata:", error);
      alert("Ajan raporu hesaplayamadı, lütfen tekrar deneyin.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Finansal hesaplamalar
  const finance = useMemo(() => {
    const activeOrders = orders.filter(o => o.durum !== 'iptal');
    const cancelledOrders = orders.filter(o => o.durum === 'iptal');
    const pendingOrders = orders.filter(o => o.durum === 'bekliyor');
    const completedOrders = orders.filter(o => o.durum === 'teslim_edildi');

    const totalRevenue = activeOrders.reduce((s, o) => s + Number(o.toplam_tutar), 0);
    const pendingRevenue = pendingOrders.reduce((s, o) => s + Number(o.toplam_tutar), 0);
    const completedRevenue = completedOrders.reduce((s, o) => s + Number(o.toplam_tutar), 0);
    const cancelledRevenue = cancelledOrders.reduce((s, o) => s + Number(o.toplam_tutar), 0);

    const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

    // Ürün bazlı gelir analizi
    const productRevenue = {};
    activeOrders.forEach(order => {
      order.kalemler?.forEach(kalem => {
        const key = kalem.urun_id;
        if (!productRevenue[key]) {
          productRevenue[key] = { urun_id: key, revenue: 0, quantity: 0 };
        }
        productRevenue[key].revenue += Number(kalem.birim_fiyat) * kalem.adet;
        productRevenue[key].quantity += kalem.adet;
      });
    });

    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => {
        const product = products.find(pr => pr.id === p.urun_id);
        return { ...p, isim: product?.isim || `Ürün #${p.urun_id}` };
      });

    return {
      totalRevenue,
      pendingRevenue,
      completedRevenue,
      cancelledRevenue,
      avgOrderValue,
      activeOrderCount: activeOrders.length,
      cancelledOrderCount: cancelledOrders.length,
      topProducts
    };
  }, [orders, products]);

  // Dinamik ciro grafiği
  const dailyRevenue = useMemo(() => {
    const days = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const od = new Date(o.created_at);
        return od >= d && od < nextDay && o.durum !== 'iptal';
      });

      const revenue = dayOrders.reduce((s, o) => s + Number(o.toplam_tutar), 0);
      const label = chartDays <= 14
        ? d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        : d.getDate().toString();
      days.push({ label, value: revenue, date: d });
    }
    return days;
  }, [orders, chartDays]);

  const chartTotal = dailyRevenue.reduce((s, d) => s + d.value, 0);

  // Haftalık karşılaştırma
  const weekComparison = useMemo(() => {
    const now = new Date();
    const last7 = orders.filter(o => {
      const d = new Date(o.created_at);
      return (now - d) / 86400000 <= 7 && o.durum !== 'iptal';
    }).reduce((s, o) => s + Number(o.toplam_tutar), 0);

    const prev7 = orders.filter(o => {
      const d = new Date(o.created_at);
      const diff = (now - d) / 86400000;
      return diff > 7 && diff <= 14 && o.durum !== 'iptal';
    }).reduce((s, o) => s + Number(o.toplam_tutar), 0);

    const change = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : (last7 > 0 ? 100 : 0);
    return { last7, prev7, change };
  }, [orders]);

  // Donut chart
  const revenueDistribution = useMemo(() => [
    { label: 'Tamamlanan', value: finance.completedRevenue, color: '#10b981' },
    { label: 'Bekleyen', value: finance.pendingRevenue, color: '#f59e0b' },
    { label: 'İptal', value: finance.cancelledRevenue, color: '#ef4444' },
  ], [finance]);

  const totalDonut = revenueDistribution.reduce((s, r) => s + r.value, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AnalyticsAgent Aylık Finans Rapor Özeti */}
      <div className="bg-white rounded-xl border border-violet-150 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12 text-violet-600">
          <Sparkles size={120} />
        </div>
        
        {analyticsLoading ? (
          /* Skeleton Loader */
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-16 bg-gray-100 rounded-lg p-3" />
              ))}
            </div>
          </div>
        ) : analyticsData ? (
          /* Rapor Görünümü */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">AnalyticsAgent Aylık Rapor Özeti</h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Hesaplanma Zamanı: {new Date(analyticsData.hesaplanma).toLocaleDateString('tr-TR')} {new Date(analyticsData.hesaplanma).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTriggerAnalytics}
                className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-lg transition-colors border border-violet-200"
              >
                Raporu Yenile (Ajanı Tetikle)
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Toplam Ciro</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">
                  ₺{Number(analyticsData.toplam_satis).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Sipariş Sayısı</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">{analyticsData.siparis_sayisi} adet</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Yeni Müşteri</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">{analyticsData.yeni_musteri} kişi</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">İade Oranı</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">%{Number(analyticsData.iade_orani).toFixed(1)}</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 italic">
              💡 Bu veriler AnalyticsAgent tarafından son 30 günlük ciro, sipariş ve müşteri hareketleri analiz edilerek pre-aggregation pattern ile yüksek performanslı hesaplanmıştır.
            </p>
          </div>
        ) : (
          /* Empty State - Tetikleme Butonlu */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Aylık Analitik Rapor Bulunamadı</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Veritabanında son 30 güne dair pre-aggregated analitik rapor mevcut değil. Ajanı manuel tetikleyerek raporu anında hesaplayabilirsiniz.
                </p>
              </div>
            </div>
            <button
              onClick={handleTriggerAnalytics}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/10 transition-colors"
            >
              <Sparkles size={14} /> Hemen Hesapla (Ajanı Tetikle)
            </button>
          </div>
        )}
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 shadow-lg shadow-emerald-500/20 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-emerald-100">Toplam Gelir</span>
            <Wallet size={20} className="text-emerald-200" />
          </div>
          <p className="text-2xl font-extrabold">
            ₺{finance.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-100">
            {weekComparison.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{weekComparison.change >= 0 ? '+' : ''}{weekComparison.change.toFixed(1)}% bu hafta</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Bekleyen Ödeme</span>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            ₺{finance.pendingRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1">Tahsil edilmeyi bekliyor</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Ort. Sipariş Tutarı</span>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Receipt size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            ₺{finance.avgOrderValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 font-medium mt-1">{finance.activeOrderCount} aktif sipariş</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">İptal Kaybı</span>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            ₺{finance.cancelledRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-red-600 font-medium mt-1">{finance.cancelledOrderCount} iptal sipariş</p>
        </div>
      </div>

      {/* Grafik Satırı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ciro Grafiği */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Ciro Akışı</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Toplam: ₺{chartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DateRangeSelector value={chartDays} onChange={setChartDays} />
          </div>
          <BarChart data={dailyRevenue} color="#6366f1" />
        </div>

        {/* Gelir Dağılımı */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1">Gelir Dağılımı</h3>
          <p className="text-xs text-gray-500 mb-5">Durum bazlı gelir analizi</p>
          <div className="flex flex-col items-center">
            <div className="relative">
              <DonutChart segments={revenueDistribution} size={150} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-400 font-medium">Toplam</span>
                <span className="text-sm font-extrabold text-gray-900">₺{(totalDonut / 1000).toFixed(0)}K</span>
              </div>
            </div>
            <div className="mt-6 w-full space-y-2.5">
              {revenueDistribution.map(seg => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-sm text-gray-700">{seg.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ₺{seg.value.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alt Satır */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Haftalık Performans */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1">Haftalık Performans</h3>
          <p className="text-xs text-gray-500 mb-6">Son 7 gün vs önceki 7 gün</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-blue-600 mb-1">Bu Hafta</p>
              <p className="text-xl font-extrabold text-gray-900">
                ₺{weekComparison.last7.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Önceki Hafta</p>
              <p className="text-xl font-extrabold text-gray-900">
                ₺{weekComparison.prev7.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-xl ${weekComparison.change >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${weekComparison.change >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {weekComparison.change >= 0 ? (
                <ArrowUpRight size={20} className="text-emerald-600" />
              ) : (
                <ArrowDownRight size={20} className="text-red-600" />
              )}
            </div>
            <div>
              <p className={`text-sm font-bold ${weekComparison.change >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {weekComparison.change >= 0 ? '+' : ''}{weekComparison.change.toFixed(1)}% değişim
              </p>
              <p className="text-xs text-gray-500">Bir önceki haftaya göre</p>
            </div>
          </div>
        </div>

        {/* En Çok Gelir Getiren Ürünler */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">En Çok Gelir Getiren Ürünler</h3>
            <p className="text-xs text-gray-500 mt-0.5">Toplam gelir bazlı sıralama</p>
          </div>
          <div className="divide-y divide-gray-50">
            {finance.topProducts.length > 0 ? finance.topProducts.map((product, index) => {
              const maxRev = finance.topProducts[0]?.revenue || 1;
              const pct = Math.round((product.revenue / maxRev) * 100);
              return (
                <div key={product.urun_id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.isim}</p>
                        <p className="text-xs text-gray-400">{product.quantity} adet satıldı</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ₺{product.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-10">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%`, opacity: 0.3 + (0.7 * pct / 100) }} />
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-gray-400 text-sm">Henüz satış verisi bulunmuyor.</div>
            )}
          </div>
        </div>
      </div>

      {/* Ödeme Toplama Bilgisi */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Banknote size={24} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Ödeme Toplama Bilgisi</h3>
            <p className="text-sm text-slate-300 mb-4">
              Müşterileriniz sipariş sonrası havale/EFT ile ödeme yapmaktadır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Bekleyen Ödeme</p>
                <p className="text-lg font-bold text-amber-400">₺{finance.pendingRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Tahsil Edilen</p>
                <p className="text-lg font-bold text-emerald-400">₺{finance.completedRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">İptal Edilen</p>
                <p className="text-lg font-bold text-red-400">₺{finance.cancelledRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAdmin;
