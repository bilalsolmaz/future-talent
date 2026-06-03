import React, { useState, useEffect } from 'react';
import {
  Loader2, ChevronDown, ChevronUp, X, User, MapPin, Phone, Mail,
  Clock, CheckCircle2, Package, Truck, PackageCheck, XCircle,
  FileText, Calendar, Hash, CreditCard, MessageSquare, Eye
} from 'lucide-react';
import api from '../../services/api';
import CargoTimeline from '../../components/cargo/CargoTimeline';

const statusConfig = {
  'bekliyor': { label: 'Bekliyor', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, color: '#f59e0b' },
  'onaylandi': { label: 'Onaylandı', bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2, color: '#3b82f6' },
  'hazirlaniyor': { label: 'Hazırlanıyor', bg: 'bg-purple-100', text: 'text-purple-700', icon: Package, color: '#8b5cf6' },
  'kargolandi': { label: 'Kargolandı', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, color: '#6366f1' },
  'teslim_edildi': { label: 'Teslim Edildi', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: PackageCheck, color: '#10b981' },
  'iptal': { label: 'İptal Edildi', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, color: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const s = statusConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <Icon size={13} /> {s.label}
    </span>
  );
};

// Sipariş Durum Timeline
const StatusTimeline = ({ currentStatus }) => {
  const steps = ['bekliyor', 'onaylandi', 'hazirlaniyor', 'kargolandi', 'teslim_edildi'];
  const isCancelled = currentStatus === 'iptal';
  const currentIndex = steps.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
        <XCircle size={18} className="text-red-500" />
        <span className="text-sm font-semibold text-red-700">Bu sipariş iptal edilmiştir.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, i) => {
        const s = statusConfig[step];
        const Icon = s.icon;
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              isCurrent ? `${s.bg} ${s.text} ring-2 ring-offset-1` : isCompleted ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'
            }`} style={isCurrent ? { ringColor: s.color } : {}}>
              <Icon size={13} />
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-4 h-0.5 flex-shrink-0 rounded ${i < currentIndex ? 'bg-gray-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // CargoAgent Takip State'leri
  const [cargoTracking, setCargoTracking] = useState(null);
  const [cargoLoading, setCargoLoading] = useState(false);
  const [cargoError, setCargoError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/siparisler/');
      setOrders(response.data);
    } catch (error) {
      console.error('Siparişler yüklenemedi', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setCargoTracking(null);
    setCargoError(null);

    if (order.durum === 'kargolandi' || order.durum === 'teslim_edildi') {
      setCargoLoading(true);
      try {
        const response = await api.get(`/cargo/track/${order.id}`);
        setCargoTracking(response.data);
      } catch (error) {
        console.error("Kargo detayları yüklenemedi:", error);
        if (error.response?.status === 404) {
          setCargoError("Kargo takip kaydı henüz oluşturulmamış veya mevcut değil.");
        } else {
          setCargoError("Kargo durum bilgisi sağlayıcıdan alınamadı.");
        }
      } finally {
        setCargoLoading(false);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/siparisler/${orderId}/durum`, { durum: newStatus });
      fetchOrders();
      // Eğer detay modalı açıksa, bilgileri güncelle
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, durum: newStatus }));
        // Eğer durum kargolandı olarak değiştiyse kargo verisini tetikle/yenile
        if (newStatus === 'kargolandi' || newStatus === 'teslim_edildi') {
          handleViewOrder({ ...selectedOrder, durum: newStatus });
        } else {
          setCargoTracking(null);
          setCargoError(null);
        }
      }
    } catch (error) {
      alert('Durum güncellenirken hata oluştu.');
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.durum === filterStatus);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            <p className="text-sm text-gray-500 mt-0.5">Müşteri siparişlerini görüntüle, detaylarını incele ve durumlarını güncelle.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Tümü', count: orders.length },
              { key: 'bekliyor', label: 'Bekliyor', count: orders.filter(o => o.durum === 'bekliyor').length },
              { key: 'onaylandi', label: 'Onaylandı', count: orders.filter(o => o.durum === 'onaylandi').length },
              { key: 'kargolandi', label: 'Kargoda', count: orders.filter(o => o.durum === 'kargolandi').length },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === f.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Sipariş No</th>
                <th className="p-4">Müşteri</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Tutar</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-sm text-blue-600">{order.siparis_no}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.user?.isim || `User #${order.user_id}`}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 font-bold text-sm text-gray-900">₺{Number(order.toplam_tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4">
                    <select
                      className={`text-xs rounded-lg border px-2 py-1.5 font-semibold transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        order.durum === 'iptal' ? 'text-red-600 border-red-200 bg-red-50' :
                        order.durum === 'teslim_edildi' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                        'text-gray-700 border-gray-200 bg-white'
                      }`}
                      value={order.durum}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="bekliyor">⏳ Bekliyor</option>
                      <option value="onaylandi">✅ Onaylandı</option>
                      <option value="hazirlaniyor">📦 Hazırlanıyor</option>
                      <option value="kargolandi">🚚 Kargolandı</option>
                      <option value="teslim_edildi">✔️ Teslim Edildi</option>
                      <option value="iptal">❌ İptal Edildi</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={14} /> Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400 text-sm">Kayıtlı sipariş bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── SİPARİŞ DETAY MODALI ───── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sipariş Detayı</h2>
                <span className="font-mono text-sm text-blue-600 font-bold">{selectedOrder.siparis_no}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Durum Timeline */}
              <StatusTimeline currentStatus={selectedOrder.durum} />

              {/* Bilgi Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Müşteri Bilgileri */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> Müşteri Bilgileri
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 font-medium">{selectedOrder.user?.isim || `User #${selectedOrder.user_id}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{selectedOrder.user?.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{selectedOrder.user?.telefon || 'Belirtilmedi'}</span>
                    </div>
                  </div>
                </div>

                {/* Sipariş Bilgileri */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" /> Sipariş Bilgileri
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">Sipariş No:</span>
                      <span className="text-sm text-gray-900 font-mono font-bold">{selectedOrder.siparis_no}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">Tarih:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">Ödeme:</span>
                      <span className="text-sm text-gray-900 font-semibold">Havale / EFT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teslimat Adresi */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Teslimat Adresi
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedOrder.adres}</p>
              </div>

              {/* CargoAgent Kargo Takip Timeline */}
              {(selectedOrder.durum === 'kargolandi' || selectedOrder.durum === 'teslim_edildi' || cargoTracking) && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Truck size={16} className="text-blue-600 animate-bounce" style={{ animationDuration: '3s' }} /> Kargo Takip & Gecikme Analizi (CargoAgent)
                  </h3>
                  <CargoTimeline 
                    order={selectedOrder} 
                    tracking={cargoTracking} 
                    isLoading={cargoLoading} 
                    error={cargoError} 
                  />
                </div>
              )}

              {/* Sipariş Notu */}
              {selectedOrder.notlar && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-amber-600" /> Müşteri Notu
                  </h3>
                  <p className="text-sm text-amber-700 italic">"{selectedOrder.notlar}"</p>
                </div>
              )}

              {/* Sipariş Kalemleri */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package size={16} className="text-blue-600" /> Sipariş Kalemleri ({selectedOrder.kalemler?.length || 0})
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase">
                        <th className="px-4 py-3">Ürün</th>
                        <th className="px-4 py-3 text-center">Adet</th>
                        <th className="px-4 py-3 text-right">Birim Fiyat</th>
                        <th className="px-4 py-3 text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.kalemler?.map(kalem => (
                        <tr key={kalem.id} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Package size={14} className="text-blue-500" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{kalem.urun_adi || `Ürün #${kalem.urun_id}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{kalem.adet}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">
                            ₺{Number(kalem.birim_fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                            ₺{(Number(kalem.birim_fiyat) * kalem.adet).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Toplam Tutar */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-4">
                <span className="text-sm font-semibold opacity-90">Genel Toplam</span>
                <span className="text-2xl font-extrabold">₺{Number(selectedOrder.toplam_tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Durum Değiştir */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-gray-700">Durumu Güncelle:</span>
                <select
                  className="text-sm rounded-lg border-gray-200 bg-white px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedOrder.durum}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder(prev => ({ ...prev, durum: e.target.value }));
                  }}
                >
                  <option value="bekliyor">⏳ Bekliyor</option>
                  <option value="onaylandi">✅ Onaylandı</option>
                  <option value="hazirlaniyor">📦 Hazırlanıyor</option>
                  <option value="kargolandi">🚚 Kargolandı</option>
                  <option value="teslim_edildi">✔️ Teslim Edildi</option>
                  <option value="iptal">❌ İptal Edildi</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;
