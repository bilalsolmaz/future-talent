import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/siparisler/benim');
        setOrders(response.data);
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'bekliyor':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock size={14} /> Bekliyor</span>;
      case 'onaylandi':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><CheckCircle2 size={14} /> Onaylandı</span>;
      case 'kargolandi':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><Package size={14} /> Kargolandı</span>;
      case 'teslim_edildi':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle2 size={14} /> Teslim Edildi</span>;
      case 'iptal':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle size={14} /> İptal Edildi</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-800">{status}</span>;
    }
  };

  if (!user) return null; // Router zaten yönlendirecek

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-primary-900 to-primary-800 text-white border-0">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-bold border border-white/20">
          {user.isim.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold mb-1">{user.isim}</h1>
          <p className="text-primary-100">{user.email}</p>
          {user.telefon && <p className="text-primary-200 text-sm mt-1">{user.telefon}</p>}
        </div>
        <div className="md:ml-auto">
          <button onClick={logout} className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20">
            Çıkış Yap
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-surface-900 mb-4 flex items-center gap-2">
          <Package size={24} className="text-primary-600" /> Geçmiş Siparişlerim
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="card p-6 animate-pulse">
                <div className="h-6 bg-surface-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-surface-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card p-0 overflow-hidden">
                <div className="bg-surface-50 border-b border-surface-100 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-1">Sipariş Tarihi</p>
                    <p className="text-sm font-medium text-surface-900">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-1">Toplam Tutar</p>
                    <p className="text-sm font-bold text-primary-600">
                      ₺{order.toplam_tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">{order.siparis_no}</span>
                    {getStatusBadge(order.durum)}
                  </div>
                </div>
                
                <div className="p-4 sm:px-6">
                  <div className="space-y-3">
                    {order.kalemler?.map(kalem => (
                      <div key={kalem.id} className="flex justify-between items-center py-2 border-b border-surface-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-surface-100 rounded flex items-center justify-center text-xs font-bold text-surface-500">
                             {kalem.adet}x
                           </div>
                           <span className="text-sm font-medium text-surface-900">Ürün ID: {kalem.urun_id}</span>
                        </div>
                        <span className="text-sm font-medium text-surface-600">
                          ₺{(kalem.birim_fiyat * kalem.adet).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <p className="text-xs text-surface-500 mb-1">Teslimat Adresi:</p>
                    <p className="text-sm text-surface-900">{order.adres}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center border-dashed border-2">
            <Package size={48} className="mx-auto text-surface-300 mb-4" />
            <p className="text-surface-500 text-lg">Henüz hiç siparişiniz bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
