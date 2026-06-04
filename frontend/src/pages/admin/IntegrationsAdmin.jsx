import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Truck, Mail, MessageCircle, Save, TestTube, RefreshCw, CheckCircle, AlertTriangle,
  Eye, EyeOff, ChevronDown, ChevronUp, ExternalLink, BookOpen, Headphones,
  Shield, Loader2, Wifi, WifiOff, Info, Zap, Settings
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

/* ============================================================
   KARGO FİRMA SEÇENEKLERİ
   ============================================================ */
const KARGO_FIRMALARI = [
  { value: '', label: 'Seçiniz...', disabled: true },
  { value: 'yurtici', label: 'Yurtiçi Kargo', logo: '🟡' },
  { value: 'aras', label: 'Aras Kargo', logo: '🔵' },
  { value: 'ptt', label: 'PTT Kargo', logo: '🟠' },
  { value: 'mng', label: 'MNG Kargo', logo: '🔴' },
];

/* ============================================================
   SKELETON LOADER
   ============================================================ */
const SkeletonBlock = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-gray-200 rounded-xl p-6 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-300 rounded" />
          <div className="h-10 bg-gray-300 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ============================================================
   WHATSAPP KURULUM KILAVUZU
   ============================================================ */
const WhatsAppGuide = ({ expanded, onToggle }) => (
  <div className="mt-4 border border-emerald-200 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-emerald-100/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-emerald-900 text-sm">📖 WhatsApp Kurulum Kılavuzu</h4>
          <p className="text-xs text-emerald-600">Adım adım Meta Business API entegrasyon rehberi</p>
        </div>
      </div>
      {expanded ? <ChevronUp size={18} className="text-emerald-600" /> : <ChevronDown size={18} className="text-emerald-600" />}
    </button>

    {expanded && (
      <div className="px-5 pb-5 space-y-4 border-t border-emerald-200">
        <div className="mt-4 space-y-3">
          {[
            { step: 1, title: 'Meta Developer Hesabı Oluşturun', desc: 'developers.facebook.com adresinden ücretsiz geliştirici hesabı açın.', link: 'https://developers.facebook.com' },
            { step: 2, title: 'Business Uygulaması Oluşturun', desc: '"Business" türünde yeni bir uygulama oluşturun ve WhatsApp ürününü ekleyin.' },
            { step: 3, title: 'Telefon Numarası Ekleyin', desc: 'WhatsApp Business API için bir telefon numarası kaydedin veya test numarasını kullanın.' },
            { step: 4, title: 'Kalıcı Token Oluşturun', desc: 'System Users → Generate Token yolunu izleyin. whatsapp_business_messaging iznini ekleyin.' },
            { step: 5, title: 'Webhook Ayarlayın', desc: 'Callback URL olarak sitenizin /api/v1/whatsapp/webhook adresini girin ve verify token\'ı belirleyin.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3 items-start">
              <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 mt-1 font-medium">
                    Sayfayı Aç <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Teknik Destek Kutusu */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
              <Headphones size={20} className="text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-purple-900 text-sm">🎯 Teknik Destek & Kurulum Hizmeti</h5>
              <p className="text-xs text-purple-700 mt-1">
                WhatsApp Business API kurulumu teknik bilgi gerektirir. Profesyonel kurulum hizmetimizle
                entegrasyonunuzu hızla tamamlayın. Uzman ekibimiz Meta Developer panelini sizin için yapılandırır.
              </p>
              <button className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                <Headphones size={14} /> Destek Talebi Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);


/* ============================================================
   INPUT BİLEŞENİ (Maskelenmiş değer desteği)
   ============================================================ */
const SettingInput = ({ ayar, value, onChange, type = 'text' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = ayar.hassas === 'evet';

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {ayar.aciklama || ayar.anahtar}
      </label>
      <div className="relative">
        <input
          type={isPassword && !showPassword ? 'password' : type}
          value={value}
          onChange={(e) => onChange(ayar.anahtar, e.target.value)}
          placeholder={ayar.aciklama || ayar.anahtar}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 
                     focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200
                     placeholder:text-gray-400 hover:border-gray-300"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
const IntegrationsAdmin = () => {
  const token = localStorage.getItem('access_token');

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingCargo, setTestingCargo] = useState(false);
  const [gruplar, setGruplar] = useState([]);
  const [formData, setFormData] = useState({});
  const [testResults, setTestResults] = useState({});
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [whatsappGuideOpen, setWhatsappGuideOpen] = useState(false);

  // API çağrısı yapma yardımcı fonksiyonu
  const apiFetch = useCallback(async (url, options = {}) => {
    const response = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${response.status}`);
    }
    
    return response.json();
  }, [token]);

  // Ayarları yükle
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/v1/settings/');
      setGruplar(data.gruplar);

      // Form data'yı hazırla
      const initial = {};
      data.gruplar.forEach(grup => {
        grup.ayarlar.forEach(ayar => {
          initial[ayar.anahtar] = ayar.deger;
        });
      });
      setFormData(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Form değişikliği
  const handleChange = (anahtar, deger) => {
    setFormData(prev => ({ ...prev, [anahtar]: deger }));
    setSaveSuccess(false);
  };

  // Toplu kaydet
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const ayarlar = Object.entries(formData).map(([anahtar, deger]) => ({
        anahtar,
        deger,
      }));

      const data = await apiFetch('/api/v1/settings/', {
        method: 'PUT',
        body: JSON.stringify({ ayarlar }),
      });

      setGruplar(data.gruplar);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // E-posta test
  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestResults(prev => ({ ...prev, email: null }));
    try {
      const result = await apiFetch('/api/v1/settings/test-email', { method: 'POST' });
      setTestResults(prev => ({ ...prev, email: { success: true, message: result.mesaj } }));
    } catch (err) {
      setTestResults(prev => ({ ...prev, email: { success: false, message: err.message } }));
    } finally {
      setTestingEmail(false);
    }
  };

  // Kargo test
  const handleTestCargo = async () => {
    setTestingCargo(true);
    setTestResults(prev => ({ ...prev, cargo: null }));
    try {
      const result = await apiFetch('/api/v1/settings/test-cargo', { method: 'POST' });
      setTestResults(prev => ({ ...prev, cargo: { success: true, message: result.mesaj } }));
    } catch (err) {
      setTestResults(prev => ({ ...prev, cargo: { success: false, message: err.message } }));
    } finally {
      setTestingCargo(false);
    }
  };

  // Grup ikonları
  const getGrupIcon = (grup) => {
    const icons = {
      kargo: Truck,
      mail: Mail,
      whatsapp: MessageCircle,
    };
    return icons[grup] || Settings;
  };

  const getGrupGradient = (grup) => {
    const gradients = {
      kargo: 'from-amber-500 to-orange-600',
      mail: 'from-blue-500 to-indigo-600',
      whatsapp: 'from-emerald-500 to-teal-600',
    };
    return gradients[grup] || 'from-gray-500 to-gray-600';
  };

  const getGrupBorder = (grup) => {
    const borders = {
      kargo: 'border-amber-200 hover:border-amber-300',
      mail: 'border-blue-200 hover:border-blue-300',
      whatsapp: 'border-emerald-200 hover:border-emerald-300',
    };
    return borders[grup] || 'border-gray-200';
  };

  // Test sonucu bileşeni
  const TestResult = ({ result }) => {
    if (!result) return null;
    return (
      <div className={`flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl text-sm font-medium animate-fadeIn
        ${result.success
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
        {result.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
        {result.message}
      </div>
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  if (loading) return <SkeletonBlock />;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Sayfa Başlığı */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entegrasyon Ayarları</h1>
            <p className="text-sm text-gray-500">Kargo, e-posta ve WhatsApp servislerini yapılandırın</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                     rounded-xl font-semibold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 
                     hover:from-blue-700 hover:to-indigo-700 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</>
          ) : saveSuccess ? (
            <><CheckCircle size={16} /> Kaydedildi!</>
          ) : (
            <><Save size={16} /> Tümünü Kaydet</>
          )}
        </button>
      </div>

      {/* Güvenlik Notu */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl px-4 py-3">
        <Shield size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Güvenlik:</span> Hassas bilgiler (şifre, token, API key) maskelenmiş olarak gösterilir.
          Mevcut bir değeri değiştirmek için alanı tamamen silip yeni değeri yazın.
          Maskelenmiş haldeki bir değer değiştirilmezse mevcut değer korunur.
        </p>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fadeIn">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-xs font-medium">
            Kapat
          </button>
        </div>
      )}

      {/* Başarı Mesajı */}
      {saveSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-fadeIn">
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Tüm ayarlar başarıyla kaydedildi!</p>
        </div>
      )}

      {/* Grup Kartları */}
      {gruplar.map(grup => {
        const GrupIcon = getGrupIcon(grup.grup);
        const gradient = getGrupGradient(grup.grup);
        const borderClass = getGrupBorder(grup.grup);

        return (
          <div key={grup.grup} className={`bg-white rounded-2xl border-2 ${borderClass} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}>
            {/* Grup Başlığı */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <GrupIcon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{grup.grup_baslik}</h3>
              </div>

              {/* Test Butonları */}
              {grup.grup === 'mail' && (
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200
                             rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {testingEmail ? <Loader2 size={14} className="animate-spin" /> : <TestTube size={14} />}
                  Test Maili Gönder
                </button>
              )}
              {grup.grup === 'kargo' && (
                <button
                  onClick={handleTestCargo}
                  disabled={testingCargo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200
                             rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {testingCargo ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                  Bağlantıyı Test Et
                </button>
              )}
            </div>

            {/* Ayar Alanları */}
            <div className="p-6">
              {/* Kargo firması için özel select */}
              {grup.grup === 'kargo' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Kargo Firması
                  </label>
                  <div className="relative">
                    <select
                      value={formData['kargo_firma'] || ''}
                      onChange={(e) => handleChange('kargo_firma', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900
                                 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all
                                 appearance-none cursor-pointer hover:border-gray-300"
                    >
                      {KARGO_FIRMALARI.map(f => (
                        <option key={f.value} value={f.value} disabled={f.disabled}>
                          {f.logo} {f.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grup.ayarlar
                  .filter(a => a.anahtar !== 'kargo_firma') // Firma seçimi ayrı render edildi
                  .map(ayar => (
                    <SettingInput
                      key={ayar.anahtar}
                      ayar={ayar}
                      value={formData[ayar.anahtar] || ''}
                      onChange={handleChange}
                    />
                  ))}
              </div>

              {/* Test Sonuçları */}
              {grup.grup === 'mail' && <TestResult result={testResults.email} />}
              {grup.grup === 'kargo' && <TestResult result={testResults.cargo} />}

              {/* WhatsApp Kurulum Kılavuzu */}
              {grup.grup === 'whatsapp' && (
                <WhatsAppGuide
                  expanded={whatsappGuideOpen}
                  onToggle={() => setWhatsappGuideOpen(!whatsappGuideOpen)}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Alt Bilgi */}
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
        <Info size={14} />
        <span>Ayarlar güncellendikten sonra ilgili servisler otomatik olarak yeni bilgileri kullanmaya başlar.</span>
      </div>

      {/* Animasyon CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default IntegrationsAdmin;
