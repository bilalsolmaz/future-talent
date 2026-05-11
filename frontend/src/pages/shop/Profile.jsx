import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle2, XCircle, RotateCcw, 
  ChevronDown, ChevronUp, AlertTriangle, Send, FileText,
  PartyPopper, ShieldX, Info, Settings, Lock, User as UserIcon, Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const sebepOptions = [
  { value: 'hasarli', label: 'Hasarlı / Kırık Ürün' },
  { value: 'yanlis_urun', label: 'Yanlış Ürün Gönderildi' },
  { value: 'beden_uyumsuz', label: 'Beden / Boyut Uyumsuzluğu' },
  { value: 'kalite', label: 'Kalite Beklentiyi Karşılamadı' },
  { value: 'vazgecme', label: 'Vazgeçme / Fikrimi Değiştirdim' },
  { value: 'diger', label: 'Diğer' },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'returns' ? 'returns' 
      : searchParams.get('tab') === 'settings' ? 'settings' 
      : 'orders'
  );

  // Profil düzenleme
  const [editIsim, setEditIsim] = useState(user?.isim || '');
  const [editTelefon, setEditTelefon] = useState(user?.telefon || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [sifreMsg, setSifreMsg] = useState('');

  // İade formu
  const [showReturnForm, setShowReturnForm] = useState(null); // siparis id
  const [returnCategory, setReturnCategory] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnError, setReturnError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        api.get('/siparisler/benim'),
        api.get('/iadeler/benim'),
      ]);
      setOrders(ordersRes.data);
      setReturns(returnsRes.data);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnCategory || returnDescription.length < 10) {
      setReturnError('Lütfen iade sebebini seçin ve en az 10 karakter açıklama yazın.');
      return;
    }
    setReturnSubmitting(true);
    setReturnError('');
    try {
      const res = await api.post('/iadeler/', {
        siparis_id: showReturnForm,
        sebep_kategori: returnCategory,
        sebep_aciklama: returnDescription,
      });
      setReturnSuccess(`İade talebiniz başarıyla oluşturuldu! İade No: ${res.data.iade_no}`);
      setShowReturnForm(null);
      setReturnCategory('');
      setReturnDescription('');
      fetchData();
      setTimeout(() => setReturnSuccess(''), 5000);
    } catch (err) {
      setReturnError(err.response?.data?.detail || 'İade talebi oluşturulurken bir hata oluştu.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Sipariş iade edilebilir mi kontrol et
  const canReturn = (order) => {
    const eligibleStatuses = ['onaylandi', 'kargolandi', 'teslim_edildi'];
    if (!eligibleStatuses.includes(order.durum)) return false;
    // Aynı sipariş için bekleyen iade var mı?
    const hasActiveReturn = returns.some(r => r.siparis_id === order.id && r.durum === 'bekliyor');
    return !hasActiveReturn;
  };

  const getStatusBadge = (status) => {
    const config = {
      bekliyor: { icon: Clock, label: 'Bekliyor', cls: 'bg-amber-100 text-amber-800' },
      onaylandi: { icon: CheckCircle2, label: 'Onaylandı', cls: 'bg-blue-100 text-blue-800' },
      kargolandi: { icon: Package, label: 'Kargolandı', cls: 'bg-purple-100 text-purple-800' },
      teslim_edildi: { icon: CheckCircle2, label: 'Teslim Edildi', cls: 'bg-green-100 text-green-800' },
      iptal: { icon: XCircle, label: 'İptal Edildi', cls: 'bg-red-100 text-red-800' },
    };
    const c = config[status] || { icon: Clock, label: status, cls: 'bg-surface-100 text-surface-800' };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
        <Icon size={14} /> {c.label}
      </span>
    );
  };


  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profil Başlık Kartı */}
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

      {/* Başarı Mesajı */}
      {returnSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{returnSuccess}</p>
        </div>
      )}

      {/* Sekmeler */}
      <div className="flex items-center gap-0 border-b border-surface-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'orders'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-surface-500 hover:text-surface-700'
          }`}
        >
          <Package size={18} /> Siparişlerim ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'returns'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-surface-500 hover:text-surface-700'
          }`}
        >
          <RotateCcw size={18} /> İade Taleplerim ({returns.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'settings'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-surface-500 hover:text-surface-700'
          }`}
        >
          <Settings size={18} /> Ayarlar
        </button>
      </div>

      {/* ──── SİPARİŞLERİM SEKMESİ ──── */}
      {activeTab === 'orders' && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="card p-6 animate-pulse">
                  <div className="h-6 bg-surface-200 rounded w-1/4 mb-4" />
                  <div className="h-4 bg-surface-200 rounded w-1/2" />
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
                             <span className="text-sm font-medium text-surface-900">
                               {kalem.urun_adi || `Ürün ID: ${kalem.urun_id}`}
                             </span>
                          </div>
                          <span className="text-sm font-medium text-surface-600">
                            ₺{(kalem.birim_fiyat * kalem.adet).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-surface-500 mb-1">Teslimat Adresi:</p>
                        <p className="text-sm text-surface-900">{order.adres}</p>
                      </div>

                      {/* İade Talebi Oluştur Butonu */}
                      {canReturn(order) && (
                        <button
                          onClick={() => {
                            setShowReturnForm(showReturnForm === order.id ? null : order.id);
                            setReturnCategory('');
                            setReturnDescription('');
                            setReturnError('');
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                        >
                          <RotateCcw size={14} />
                          {showReturnForm === order.id ? 'Kapat' : 'İade Talebi Oluştur'}
                          {showReturnForm === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                      {/* Bekleyen iade varsa bilgi */}
                      {returns.some(r => r.siparis_id === order.id && r.durum === 'bekliyor') && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                          <Clock size={12} /> İade talebi inceleniyor
                        </span>
                      )}
                    </div>

                    {/* İade Formu */}
                    {showReturnForm === order.id && (
                      <form onSubmit={handleReturnSubmit} className="mt-4 p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-4">
                        <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm">
                          <AlertTriangle size={16} />
                          İade Talebi Oluştur
                        </div>

                        {returnError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                            {returnError}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-surface-600 mb-1.5">İade Sebebi *</label>
                          <select
                            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={returnCategory}
                            onChange={e => setReturnCategory(e.target.value)}
                            required
                          >
                            <option value="">Sebep seçiniz...</option>
                            {sebepOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-surface-600 mb-1.5">Açıklama * <span className="font-normal text-surface-400">(min 10 karakter)</span></label>
                          <textarea
                            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                            rows={3}
                            placeholder="İade sebebinizi detaylı olarak açıklayın..."
                            value={returnDescription}
                            onChange={e => setReturnDescription(e.target.value)}
                            required
                            minLength={10}
                          />
                          <p className="text-xs text-surface-400 mt-1">{returnDescription.length}/1000</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={returnSubmitting}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Send size={14} /> {returnSubmitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReturnForm(null)}
                            className="text-sm text-surface-500 hover:text-surface-700 px-3 py-2.5"
                          >
                            Vazgeç
                          </button>
                        </div>

                        <p className="text-xs text-surface-400 leading-relaxed">
                          💡 İade talebiniz oluşturulduktan sonra yönetim ekibimiz en kısa sürede inceleme yapacaktır. 
                          İade onaylandığında sipariş tutarınız hesabınıza iade edilecektir.
                        </p>
                      </form>
                    )}
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
      )}

      {/* ──── İADE TALEPLERİM SEKMESİ ──── */}
      {activeTab === 'returns' && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="card p-6 animate-pulse">
                  <div className="h-6 bg-surface-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-surface-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : returns.length > 0 ? (
            <div className="space-y-4">
              {/* ── SONUÇLANMIŞ İADELER İÇİN BİLDİRİM KARTLARI ── */}
              {returns.filter(r => r.durum !== 'bekliyor').length > 0 && (
                <div className="space-y-3 mb-2">
                  {returns.filter(r => r.durum !== 'bekliyor').map(iade => (
                    <div key={`notif-${iade.id}`} className={`rounded-xl border-2 p-5 ${
                      iade.durum === 'onaylandi'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          iade.durum === 'onaylandi' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {iade.durum === 'onaylandi' ? <PartyPopper size={24} /> : <ShieldX size={24} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-bold text-base ${
                              iade.durum === 'onaylandi' ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {iade.durum === 'onaylandi' ? 'İade Talebiniz Onaylandı!' : 'İade Talebiniz Reddedildi'}
                            </h4>
                            <span className="font-mono text-xs bg-white/60 px-2 py-0.5 rounded text-surface-600">{iade.iade_no}</span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            iade.durum === 'onaylandi' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {iade.durum === 'onaylandi'
                              ? `İade tutarınız olan ₺${Number(iade.iade_tutari).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} hesabınıza iade edilecektir.`
                              : 'Yönetim ekibimiz iade talebinizi değerlendirdi ve iade isteğiniz reddedildi.'}
                          </p>
                          {iade.admin_notu && (
                            <div className={`mt-3 p-3 rounded-lg ${
                              iade.durum === 'onaylandi' ? 'bg-green-100/70' : 'bg-red-100/70'
                            }`}>
                              <p className="text-xs font-semibold text-surface-500 mb-1 flex items-center gap-1">
                                <FileText size={11} /> Yönetici Notu:
                              </p>
                              <p className={`text-sm font-medium ${
                                iade.durum === 'onaylandi' ? 'text-green-900' : 'text-red-900'
                              }`}>{iade.admin_notu}</p>
                            </div>
                          )}
                          <p className="text-xs text-surface-400 mt-2">
                            {new Date(iade.updated_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── BEKLEYEN İADELER ── */}
              {returns.filter(r => r.durum === 'bekliyor').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock size={12} /> İnceleme Bekleyen Talepler
                  </p>
                  {returns.filter(r => r.durum === 'bekliyor').map(iade => (
                    <div key={iade.id} className="card p-0 overflow-hidden mb-3">
                      <div className="bg-amber-50 border-b border-amber-100 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-surface-900">{iade.iade_no}</p>
                            <p className="text-xs text-surface-500">Sipariş: {iade.siparis_no || `#${iade.siparis_id}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-surface-900">
                            ₺{Number(iade.iade_tutari).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Clock size={10} /> İnceleniyor
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:px-6">
                        <p className="text-xs text-surface-500 mb-1">Sebep: <span className="font-medium text-surface-700">{sebepOptions.find(o => o.value === iade.sebep_kategori)?.label}</span></p>
                        <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-3 mt-1">{iade.sebep_aciklama}</p>
                        <div className="flex items-center gap-2 mt-3 p-2.5 bg-blue-50 rounded-lg">
                          <Info size={14} className="text-blue-500 flex-shrink-0" />
                          <p className="text-xs text-blue-700">Talebiniz yönetim ekibimiz tarafından incelenmektedir. Sonuç en kısa sürede bildirilecektir.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}\n            </div>
          ) : (
            <div className="card p-12 text-center border-dashed border-2">
              <RotateCcw size={48} className="mx-auto text-surface-300 mb-4" />
              <h3 className="text-lg font-bold text-surface-900 mb-2">İade Talebiniz Yok</h3>
              <p className="text-surface-500 text-sm">
                Siparişlerinizden birini iade etmek isterseniz, "Siparişlerim" sekmesinden ilgili siparişe gidip "İade Talebi Oluştur" butonuna tıklayın.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ──── AYARLAR SEKMESİ ──── */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profil Bilgileri */}
          <div className="card p-6">
            <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
              <UserIcon size={18} className="text-primary-600" /> Profil Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Ad Soyad</label>
                <input
                  type="text"
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={editIsim}
                  onChange={e => setEditIsim(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Telefon</label>
                <input
                  type="tel"
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={editTelefon}
                  onChange={e => setEditTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">E-posta</label>
                <input
                  type="email"
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm bg-surface-50 text-surface-400 cursor-not-allowed"
                  value={user.email}
                  disabled
                />
                <p className="text-xs text-surface-400 mt-1">E-posta adresi değiştirilemez.</p>
              </div>
              {profileMsg && (
                <p className={`text-xs ${profileMsg.includes('başarı') ? 'text-green-600' : 'text-red-600'}`}>{profileMsg}</p>
              )}
              <button
                onClick={async () => {
                  try {
                    await api.patch('/auth/profil', { isim: editIsim, telefon: editTelefon });
                    setProfileMsg('Profil bilgileriniz başarıyla güncellendi!');
                    setTimeout(() => setProfileMsg(''), 3000);
                  } catch (err) {
                    setProfileMsg(err.response?.data?.detail || 'Güncelleme başarısız.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                <Save size={16} /> Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          {/* Şifre Değiştir */}
          <div className="card p-6">
            <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-primary-600" /> Şifre Değiştir
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Mevcut Şifre</label>
                <input
                  type="password"
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={mevcutSifre}
                  onChange={e => setMevcutSifre(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Yeni Şifre</label>
                <input
                  type="password"
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={yeniSifre}
                  onChange={e => setYeniSifre(e.target.value)}
                  placeholder="En az 6 karakter"
                />
              </div>
              {sifreMsg && (
                <p className={`text-xs ${sifreMsg.includes('başarı') ? 'text-green-600' : 'text-red-600'}`}>{sifreMsg}</p>
              )}
              <button
                onClick={async () => {
                  if (!mevcutSifre || yeniSifre.length < 6) {
                    setSifreMsg('Yeni şifre en az 6 karakter olmalıdır.');
                    return;
                  }
                  try {
                    await api.post('/auth/sifre-degistir', { mevcut_sifre: mevcutSifre, yeni_sifre: yeniSifre });
                    setSifreMsg('Şifreniz başarıyla değiştirildi!');
                    setMevcutSifre('');
                    setYeniSifre('');
                    setTimeout(() => setSifreMsg(''), 3000);
                  } catch (err) {
                    setSifreMsg(err.response?.data?.detail || 'Şifre değiştirme başarısız.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                <Lock size={16} /> Şifreyi Değiştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
