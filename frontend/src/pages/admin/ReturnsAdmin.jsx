import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Clock, CheckCircle2, XCircle, Eye, User, Package,
  Calendar, FileText, MessageSquare, ChevronDown, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

const sebepLabels = {
  hasarli: 'Hasarlı / Kırık Ürün',
  yanlis_urun: 'Yanlış Ürün Gönderildi',
  beden_uyumsuz: 'Beden / Boyut Uyumsuzluğu',
  kalite: 'Kalite Beklentiyi Karşılamadı',
  vazgecme: 'Vazgeçme / Fikrimi Değiştirdim',
  diger: 'Diğer',
};

const durumConfig = {
  bekliyor: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-800', icon: Clock },
  onaylandi: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  reddedildi: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const ReturnsAdmin = () => {
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/iadeler/');
      setReturns(res.data);
    } catch (err) {
      console.error('İade talepleri yüklenirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (iadeId, durum) => {
    setActionLoading(true);
    try {
      await api.patch(`/iadeler/${iadeId}/durum`, {
        durum,
        admin_notu: adminNote || null,
      });
      setAdminNote('');
      setSelectedReturn(null);
      fetchReturns();
    } catch (err) {
      console.error('İade durumu güncellenirken hata:', err);
      alert(err.response?.data?.detail || 'Bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = filterStatus === 'all' 
    ? returns 
    : returns.filter(r => r.durum === filterStatus);

  const stats = {
    total: returns.length,
    bekliyor: returns.filter(r => r.durum === 'bekliyor').length,
    onaylandi: returns.filter(r => r.durum === 'onaylandi').length,
    reddedildi: returns.filter(r => r.durum === 'reddedildi').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İade Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Müşteri iade taleplerini inceleyip onaylayın veya reddedin.</p>
        </div>
      </div>

      {/* Durum Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <RotateCcw size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Toplam İade</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-amber-300 transition-colors"
             onClick={() => setFilterStatus('bekliyor')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.bekliyor}</p>
              <p className="text-xs text-gray-500">Bekleyen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-green-300 transition-colors"
             onClick={() => setFilterStatus('onaylandi')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.onaylandi}</p>
              <p className="text-xs text-gray-500">Onaylanan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-red-300 transition-colors"
             onClick={() => setFilterStatus('reddedildi')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.reddedildi}</p>
              <p className="text-xs text-gray-500">Reddedilen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-0">
        {[
          { key: 'all', label: 'Tümü', count: stats.total },
          { key: 'bekliyor', label: 'Bekliyor', count: stats.bekliyor },
          { key: 'onaylandi', label: 'Onaylananlar', count: stats.onaylandi },
          { key: 'reddedildi', label: 'Reddedilenler', count: stats.reddedildi },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              filterStatus === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* İade Listesi */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <RotateCcw size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">İade Talebi Yok</h3>
          <p className="text-gray-500 text-sm">
            {filterStatus !== 'all' ? 'Bu filtreye uygun iade talebi bulunamadı.' : 'Henüz hiç iade talebi gelmemiş.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(iade => {
            const cfg = durumConfig[iade.durum] || durumConfig.bekliyor;
            const StatusIcon = cfg.icon;
            return (
              <div key={iade.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Sol: Temel Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{iade.iade_no}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mt-1">
                      <User size={14} className="inline mr-1 text-gray-400" />
                      {iade.user?.isim || 'Bilinmiyor'} — <span className="text-gray-500">{iade.user?.email}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Package size={12} /> Sipariş: {iade.siparis_no || `#${iade.siparis_id}`}
                      <span className="mx-1">•</span>
                      <Calendar size={12} /> {new Date(iade.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <FileText size={12} className="inline mr-1" />
                      Sebep: <span className="text-gray-700 font-medium">{sebepLabels[iade.sebep_kategori] || iade.sebep_kategori}</span>
                    </p>
                  </div>

                  {/* Sağ: Tutar + Aksiyon */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₺{Number(iade.iade_tutari).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">İade Tutarı</p>
                    </div>
                    <button
                      onClick={() => { setSelectedReturn(iade); setAdminNote(iade.admin_notu || ''); }}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-1.5"
                    >
                      <Eye size={16} /> İncele
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──── DETAY / İNCELEME MODALI ──── */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReturn(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">İade Detayı</h3>
                  <span className="font-mono text-sm text-blue-600">{selectedReturn.iade_no}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${durumConfig[selectedReturn.durum]?.color}`}>
                  {React.createElement(durumConfig[selectedReturn.durum]?.icon, { size: 14 })}
                  {durumConfig[selectedReturn.durum]?.label}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Müşteri */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Müşteri Bilgileri</label>
                <div className="mt-1.5 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{selectedReturn.user?.isim}</p>
                  <p className="text-xs text-gray-500">{selectedReturn.user?.email}</p>
                  {selectedReturn.user?.telefon && <p className="text-xs text-gray-500">{selectedReturn.user.telefon}</p>}
                </div>
              </div>

              {/* Sipariş */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş No</label>
                  <p className="text-sm font-mono font-medium text-gray-900 mt-1">{selectedReturn.siparis_no || `#${selectedReturn.siparis_id}`}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">İade Tutarı</label>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    ₺{Number(selectedReturn.iade_tutari).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* İade Sebebi */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">İade Sebebi</label>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold">
                    <AlertTriangle size={12} />
                    {sebepLabels[selectedReturn.sebep_kategori] || selectedReturn.sebep_kategori}
                  </span>
                </div>
              </div>

              {/* Müşteri Açıklaması */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Müşteri Açıklaması</label>
                <div className="mt-1.5 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReturn.sebep_aciklama}</p>
                </div>
              </div>

              {/* Tarihler */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Talep Tarihi</span>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedReturn.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Son Güncelleme</span>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedReturn.updated_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Admin yanıtı (eğer varsa) */}
              {selectedReturn.admin_notu && selectedReturn.durum !== 'bekliyor' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Yanıtı</label>
                  <div className="mt-1.5 bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-900">{selectedReturn.admin_notu}</p>
                  </div>
                </div>
              )}

              {/* Admin Aksiyonları — sadece bekleyen iadeler için */}
              {selectedReturn.durum === 'bekliyor' && (
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={12} /> Admin Notu (İsteğe Bağlı)
                    </label>
                    <textarea
                      className="w-full mt-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="İade ile ilgili notunuzu yazın..."
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'onaylandi')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} /> {actionLoading ? 'İşleniyor...' : 'İadeyi Onayla'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'reddedildi')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle size={16} /> {actionLoading ? 'İşleniyor...' : 'Reddet'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    ⚠ Onaylanan iadelerde ürün stokları otomatik olarak geri yüklenir.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsAdmin;
