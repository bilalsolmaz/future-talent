import React from 'react';
import { 
  Clock, Package, Truck, MapPin, CheckCircle2, 
  AlertTriangle, Sparkles, ShieldAlert 
} from 'lucide-react';

const CargoTimeline = ({ order, tracking, isLoading, error }) => {
  if (!order) return null;

  const isCancelled = order.durum === 'iptal';
  
  // Sipariş durum indeksleri
  const steps = [
    { key: 'bekliyor', label: 'Sipariş Alındı', icon: Clock, desc: 'Siparişiniz başarıyla oluşturuldu ve onay bekliyor.' },
    { key: 'onaylandi_hazirlaniyor', label: 'Hazırlanıyor', icon: Package, desc: 'Ürünleriniz paketleniyor ve kargoya hazırlanıyor.' },
    { key: 'kargolandi', label: 'Kargoya Verildi', icon: Truck, desc: 'Paketiniz kargo firmasına teslim edildi.' },
    { key: 'yolda', label: 'Yolda / Canlı Takip', icon: MapPin, desc: 'Kargo durumu anlık olarak güncelleniyor.' },
    { key: 'teslim_edildi', label: 'Teslim Edildi', icon: CheckCircle2, desc: 'Paketiniz alıcıya başarıyla teslim edilmiştir.' }
  ];

  // Hangi adımların aktif olduğunu belirle
  const getStepStatus = (stepKey) => {
    if (isCancelled) return 'inactive';

    const statusMap = {
      'bekliyor': true,
      'onaylandi': ['onaylandi_hazirlaniyor'],
      'hazirlaniyor': ['onaylandi_hazirlaniyor'],
      'kargolandi': ['onaylandi_hazirlaniyor', 'kargolandi', 'yolda'],
      'teslim_edildi': ['onaylandi_hazirlaniyor', 'kargolandi', 'yolda', 'teslim_edildi']
    };

    if (stepKey === 'bekliyor') return 'completed';
    
    const activeSteps = statusMap[order.durum] || [];
    if (activeSteps.includes(stepKey)) {
      // Eğer en son ulaşılan adımsa 'current' yap
      if (order.durum === 'teslim_edildi' && stepKey === 'teslim_edildi') return 'current';
      if (order.durum === 'kargolandi' && stepKey === 'yolda') return 'current';
      if ((order.durum === 'hazirlaniyor' || order.durum === 'onaylandi') && stepKey === 'onaylandi_hazirlaniyor') return 'current';
      return 'completed';
    }
    
    return 'inactive';
  };

  return (
    <div className="space-y-5">
      {/* İptal Edildiyse Banner Göster */}
      {isCancelled && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <ShieldAlert size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Sipariş İptal Edildi</h4>
            <p className="text-xs text-red-600 mt-0.5 font-medium">Bu sipariş iptal edildiği için kargo süreci başlatılamamıştır.</p>
          </div>
        </div>
      )}

      {/* Gecikme Uyarısı (AI Bildirimi) Banner'ı */}
      {tracking?.gecikme_var && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-rose-600 p-4 text-white shadow-md shadow-red-500/10 border-0">
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
            <ShieldAlert size={100} />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-wide uppercase">AI Gecikme Tespiti Yapıldı</span>
                <span className="flex items-center gap-0.5 text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  <Sparkles size={8} /> CargoAgent
                </span>
              </div>
              <p className="text-xs text-red-50 leading-relaxed font-medium">
                Bu kargonun teslimatında gecikme tespit edilmiş ve alıcıya otomatik WhatsApp/E-posta özür bilgilendirmesi gönderilmiştir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Listesi */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150 before:rounded">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;

          let iconBg = 'bg-gray-100 text-gray-400 border-gray-200';
          let borderStyle = 'border-gray-250';
          let textColor = 'text-gray-400';
          let labelColor = 'text-gray-400';

          if (status === 'completed') {
            iconBg = 'bg-blue-50 text-blue-600 border-blue-200';
            borderStyle = 'border-blue-300';
            textColor = 'text-gray-500';
            labelColor = 'text-gray-700 font-semibold';
          } else if (status === 'current') {
            iconBg = 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-100';
            borderStyle = 'border-indigo-600';
            textColor = 'text-gray-600';
            labelColor = 'text-gray-900 font-extrabold';
          }

          return (
            <div key={step.key} className="relative group transition-all duration-300">
              {/* Timeline Dairesi */}
              <div className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${iconBg}`}>
                <Icon size={12} />
              </div>

              {/* İçerik */}
              <div className="space-y-1 pl-4">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm tracking-tight transition-colors duration-300 ${labelColor}`}>{step.label}</h4>
                  {status === 'current' && (
                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Güncel Durum
                    </span>
                  )}
                </div>
                
                {/* Kargoya Verildi - Statik Detaylar */}
                {step.key === 'kargolandi' && status !== 'inactive' && (
                  <div className="text-xs text-gray-500 font-medium">
                    Firma: <span className="font-semibold text-gray-700">{tracking?.firma || 'Belirtilmedi'}</span> | Takip No: <span className="font-mono font-bold text-blue-600">{order.kargo_no}</span>
                  </div>
                )}

                {/* Yolda - Canlı CargoAgent Detayları */}
                {step.key === 'yolda' && status !== 'inactive' && (
                  <div className="mt-2 space-y-2">
                    {isLoading ? (
                      /* Skeleton loader inside timeline */
                      <div className="space-y-1.5 animate-pulse bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    ) : error ? (
                      /* Hata Durumu */
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-xs flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Kargo Bilgisi Alınamadı:</span>
                          <p className="mt-0.5 text-amber-700 font-medium">{error}</p>
                        </div>
                      </div>
                    ) : tracking ? (
                      /* Başarılı Durum - Live Kargo Kartı */
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">CargoAgent Live Takip</span>
                          <span className="text-slate-400 text-[10px]">
                            Son Güncelleme: {new Date(tracking.guncelleme).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-150">
                            <span className="text-slate-400 text-[10px] block font-medium">Kargo Durumu</span>
                            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{tracking.durum || 'Bilinmiyor'}</span>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-150">
                            <span className="text-slate-400 text-[10px] block font-medium">Son Konum</span>
                            <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{tracking.son_konum || 'Bilinmiyor'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Boş Durum */
                      <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-3 text-xs italic">
                        Kargo hareketleri henüz başlamadı veya takip bilgisi alınamadı.
                      </div>
                    )}
                  </div>
                )}

                {step.key !== 'yolda' && (
                  <p className={`text-xs leading-relaxed transition-colors duration-300 ${textColor}`}>{step.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CargoTimeline;
