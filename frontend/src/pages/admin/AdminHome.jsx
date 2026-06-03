import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Tags,
  ArrowUpRight, Loader2, DollarSign, BarChart3, Clock, CheckCircle2, XCircle,
  Truck, PackageCheck, AlertCircle, Calendar, Sparkles
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
const BarChart = ({ data, color = '#3b82f6' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const barCount = data.length;
  // Aralık çok fazlaysa label'ları seyreltme
  const showEvery = barCount > 14 ? Math.ceil(barCount / 10) : 1;

  return (
    <div className="relative">
      {/* Y-axis lines */}
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
      <div className="flex items-end gap-[3px] pl-16" style={{ height: 180 }}>
        {data.map((d, i) => {
          const heightPct = d.value > 0 ? Math.max((d.value / max) * 100, 6) : 2;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              {/* Tooltip */}
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
                  opacity: d.value > 0 ? 0.65 : 0.08,
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

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [resolvingAlerts, setResolvingAlerts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chartDays, setChartDays] = useState(7);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes, categoriesRes, alertsRes] = await Promise.all([
        api.get('/siparisler/'),
        api.get('/urunler/'),
        api.get('/kategoriler/'),
        api.get('/stock/alerts/?durum=acik').catch(() => ({ data: [] }))
      ]);

      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setStockAlerts(alertsRes.data || []);

      const allOrders = ordersRes.data;
      const totalRevenue = allOrders
        .filter(o => o.durum !== 'iptal')
        .reduce((sum, o) => sum + Number(o.toplam_tutar), 0);

      const countByStatus = (status) => allOrders.filter(o => o.durum === status).length;

      setStats({
        totalRevenue,
        totalOrders: allOrders.length,
        totalProducts: productsRes.data.length,
        totalCategories: categoriesRes.data.length,
        pendingOrders: countByStatus('bekliyor'),
        confirmedOrders: countByStatus('onaylandi'),
        preparingOrders: countByStatus('hazirlaniyor'),
        shippedOrders: countByStatus('kargolandi'),
        completedOrders: countByStatus('teslim_edildi'),
        cancelledOrders: countByStatus('iptal'),
        lowStockProducts: productsRes.data.filter(p => p.stok <= 5).length
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    // Optimistic Update: Hemen UI'dan kaldır
    const previousAlerts = [...stockAlerts];
    setStockAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setResolvingAlerts(prev => ({ ...prev, [alertId]: true }));

    try {
      await api.patch(`/stock/alerts/${alertId}/resolve`, { durum: 'kapatildi' });
      // Başarılı olduğunda dashboard verilerini (stok sayılarını vb.) güncelle
      fetchDashboardData();
    } catch (error) {
      console.error("Stok uyarısı kapatılırken hata oluştu:", error);
      alert("Uyarı kapatılamadı, lütfen tekrar deneyin.");
      // Hata durumunda state'i eski haline geri getir
      setStockAlerts(previousAlerts);
    } finally {
      setResolvingAlerts(prev => {
        const copy = { ...prev };
        delete copy[alertId];
        return copy;
      });
    }
  };

  // Dinamik ciro grafiği
  const revenueChartData = useMemo(() => {
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
        ? d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' })
        : d.getDate().toString();
      days.push({ label, value: revenue });
    }
    return days;
  }, [orders, chartDays]);

  const chartTotal = revenueChartData.reduce((s, d) => s + d.value, 0);

  // Sipariş durum dağılımı
  const orderStatusData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Bekliyor', value: stats.pendingOrders, color: '#f59e0b' },
      { label: 'Onaylandı', value: stats.confirmedOrders, color: '#3b82f6' },
      { label: 'Hazırlanıyor', value: stats.preparingOrders, color: '#8b5cf6' },
      { label: 'Kargolandı', value: stats.shippedOrders, color: '#6366f1' },
      { label: 'Teslim Edildi', value: stats.completedOrders, color: '#10b981' },
      { label: 'İptal', value: stats.cancelledOrders, color: '#ef4444' },
    ];
  }, [stats]);

  const getStatusBadge = (status) => {
    const map = {
      'bekliyor': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Bekliyor' },
      'onaylandi': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2, label: 'Onaylandı' },
      'hazirlaniyor': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Package, label: 'Hazırlanıyor' },
      'kargolandi': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, label: 'Kargolandı' },
      'teslim_edildi': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: PackageCheck, label: 'Teslim Edildi' },
      'iptal': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'İptal' },
    };
    const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: status };
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
        <Icon size={12} /> {s.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Toplam Ciro</span>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            ₺{stats?.totalRevenue?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0'}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={14} /> Tüm zamanlar
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Toplam Sipariş</span>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats?.totalOrders || 0}</p>
          <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
            <Clock size={14} /> {stats?.pendingOrders || 0} bekliyor
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Toplam Ürün</span>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats?.totalProducts || 0}</p>
          {stats?.lowStockProducts > 0 && (
            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              <TrendingDown size={14} /> {stats.lowStockProducts} düşük stoklu
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Kategoriler</span>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Tags size={20} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats?.totalCategories || 0}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Aktif kategoriler</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Ciro Grafiği</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Toplam: ₺{chartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DateRangeSelector value={chartDays} onChange={setChartDays} />
          </div>
          <BarChart data={revenueChartData} color="#3b82f6" />
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1">Sipariş Dağılımı</h3>
          <p className="text-xs text-gray-500 mb-5">Durum bazlı analiz</p>
          <div className="space-y-3">
            {orderStatusData.map((item) => {
              const total = stats?.totalOrders || 1;
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {item.value} <span className="text-gray-400 font-normal text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, item.value > 0 ? 3 : 0)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Siparişler */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Son Siparişler</h3>
            <Link to="/admin/siparisler" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Tümünü Gör <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{order.siparis_no}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  {getStatusBadge(order.durum)}
                  <span className="text-sm font-bold text-gray-900 min-w-[80px] text-right">
                    ₺{Number(order.toplam_tutar).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">Henüz sipariş bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* AI Destekli Stok Uyarıları & Önerileri */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-violet-600 animate-pulse" />
              <h3 className="text-base font-bold text-gray-900">AI Stok Uyarıları & Tedarik Önerileri</h3>
            </div>
            <Link to="/admin/urunler" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ürünleri Yönet <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1 max-h-[360px]">
            {isLoading ? (
              /* Skeleton Loader */
              [1, 2].map(n => (
                <div key={n} className="p-5 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded-full w-16" />
                  </div>
                  <div className="h-12 bg-gray-100 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
                </div>
              ))
            ) : stockAlerts.length > 0 ? (
              stockAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="p-5 hover:bg-gray-50/50 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{alert.urun?.isim || `Ürün #${alert.urun_id}`}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Mevcut Stok: <span className="font-semibold text-red-600">{alert.mevcut_stok}</span> / Eşik Miktarı: {alert.esik}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase tracking-wider scale-90">
                      Kritik Stok
                    </span>
                  </div>

                  {alert.oneri && (
                    <div className="relative rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50/70 border border-violet-100 p-3.5 text-xs text-slate-700 font-medium">
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-violet-700 bg-violet-100/80 px-1.5 py-0.5 rounded shadow-sm select-none">
                        <Sparkles size={8} /> AI
                      </div>
                      <p className="italic text-slate-800 leading-relaxed pr-8 font-serif">"{alert.oneri}"</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolvingAlerts[alert.id]}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      {resolvingAlerts[alert.id] ? "Kapatılıyor..." : "Çözüldü Olarak İşaretle"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 h-[250px]">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Aktif Stok Uyarısı Yok</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[280px] mx-auto">
                    Tüm ürün stokları güvenli eşik değerinin üzerindedir. AI operasyon uzmanı bir sorun tespit etmedi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
