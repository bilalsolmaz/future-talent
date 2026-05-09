import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Minus, Plus, ArrowRight, ShoppingBag, Loader2, PackageOpen, 
  Check, Copy, CreditCard, Landmark, AlertTriangle, X
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// IBAN bilgileri (burada sabitlenmiş — isterseniz .env'den de alınabilir)
const IBAN_NO = 'TR00 0000 0000 0000 0000 0000 00';
const HESAP_SAHIBI = 'LocalShop Tic. Ltd. Şti.';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  // Kupon state'leri
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  // Sipariş onay ekranı state'leri
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [ibanCopied, setIbanCopied] = useState(false);
  const [orderNoCopied, setOrderNoCopied] = useState(false);

  const shippingCost = (totalPrice - discountAmount) > 500 ? 0 : 39.9;
  const grandTotal = Math.max(totalPrice - discountAmount, 0) + shippingCost;

  const handleCopyIban = () => {
    navigator.clipboard.writeText(IBAN_NO.replace(/\s/g, ''));
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  };

  const handleCopyOrderNo = () => {
    if (!confirmedOrder) return;
    navigator.clipboard.writeText(confirmedOrder.siparis_no);
    setOrderNoCopied(true);
    setTimeout(() => setOrderNoCopied(false), 2000);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/kuponlar/uygula', { kod: couponCode.trim() }, { params: { sepet_tutari: totalPrice } });
      if (res.data.gecerli) {
        setDiscountAmount(res.data.indirim_tutari);
        setAppliedCoupon(res.data.kupon_kodu);
        setCouponMsg({ type: 'success', text: res.data.mesaj });
      } else {
        setCouponMsg({ type: 'error', text: res.data.mesaj });
        setDiscountAmount(0);
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: 'Kupon uygulanamadı.' });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponMsg({ type: '', text: '' });
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (cart.length === 0) return;
    if (!address.trim() || address.trim().length < 10) {
      setError('Lütfen geçerli bir teslimat adresi girin (en az 10 karakter).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orderData = {
        adres: address,
        notlar: note || null,
        kalemler: cart.map(item => ({
          urun_id: item.id,
          adet: item.quantity
        }))
      };
      
      // Kupon backend'de destekleniyorsa
      if (appliedCoupon) {
        orderData.kupon_kodu = appliedCoupon;
      }

      const response = await api.post('/siparisler/', orderData);
      
      // Sipariş başarılı — onay bilgilerini kaydet ve onay ekranını göster
      setConfirmedOrder(response.data);
      setOrderConfirmed(true);
      clearCart();
    } catch (err) {
      // Pydantic validation error'ları array olarak döner: [{loc, msg, type}, ...]
      const detail = err.response?.data?.detail;
      let errorMsg = 'Sipariş oluşturulurken bir hata oluştu.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map(e => e.msg).join(', ');
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // SİPARİŞ ONAY EKRANI
  // ========================================
  if (orderConfirmed && confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Başarı Başlığı */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-[scale-in_0.3s_ease-out]">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-surface-500">
            Siparişiniz başarıyla oluşturuldu. Ödemenizi aşağıdaki bilgilerle gerçekleştirmeniz gerekmektedir.
          </p>
        </div>

        {/* Sipariş Numarası Kartı */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0 shadow-lg shadow-primary-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-1">Sipariş Numaranız</p>
              <p className="text-3xl font-extrabold tracking-wider">{confirmedOrder.siparis_no}</p>
            </div>
            <button 
              onClick={handleCopyOrderNo}
              className="p-3 bg-white/15 hover:bg-white/25 rounded-xl transition-colors"
              title="Sipariş numarasını kopyala"
            >
              {orderNoCopied ? <Check size={22} /> : <Copy size={22} />}
            </button>
          </div>
        </div>

        {/* Ödeme Bilgileri Kartı */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-surface-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Landmark size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">Ödeme Bilgileri</h2>
              <p className="text-sm text-surface-500">Havale / EFT ile ödeme</p>
            </div>
          </div>
          
          {/* IBAN */}
          <div className="bg-surface-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">IBAN Numarası</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-mono font-bold text-surface-900 tracking-wide">{IBAN_NO}</p>
              <button
                onClick={handleCopyIban}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {ibanCopied ? <><Check size={14} /> Kopyalandı</> : <><Copy size={14} /> Kopyala</>}
              </button>
            </div>
          </div>

          {/* Hesap Sahibi */}
          <div className="bg-surface-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Hesap Sahibi</p>
            <p className="text-lg font-semibold text-surface-900">{HESAP_SAHIBI}</p>
          </div>

          {/* Ödenecek Tutar */}
          <div className="bg-surface-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Ödenecek Tutar</p>
            <p className="text-2xl font-extrabold text-primary-600">
              ₺{Number(confirmedOrder.toplam_tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Transfer Açıklaması */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Transfer Açıklaması</p>
            <p className="text-base font-bold text-amber-900">
              {confirmedOrder.siparis_no} — {user?.isim || 'Ad Soyad'}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Para transferi açıklamasına sipariş numaranızı ve ad-soyadınızı yazmayı unutmayın.
            </p>
          </div>
        </div>

        {/* Uyarı Kartı */}
        <div className="card p-5 mb-6 border-l-4 border-amber-500 bg-amber-50/50">
          <div className="flex gap-3">
            <AlertTriangle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-surface-900 mb-1">Önemli Bilgilendirme</h3>
              <ul className="text-sm text-surface-700 space-y-1.5">
                <li>• Ödemenizi sipariş tarihinden itibaren <strong>en geç 2 iş günü</strong> içinde gerçekleştirmelisiniz.</li>
                <li>• Transfer açıklamasına mutlaka <strong>sipariş numaranızı ({confirmedOrder.siparis_no})</strong> ve <strong>ad-soyadınızı</strong> yazmalısınız.</li>
                <li>• Ödeme onaylandıktan sonra siparişiniz hazırlanmaya başlanacaktır.</li>
                <li>• Süre içinde ödeme yapılmazsa siparişiniz otomatik olarak iptal edilecektir.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/profil"
            className="btn btn-primary flex-1 justify-center"
          >
            Siparişlerim
            <ArrowRight size={18} className="ml-2" />
          </Link>
          <Link
            to="/urunler"
            className="btn btn-secondary flex-1 justify-center"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // BOŞ SEPET
  // ========================================
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-surface-100 text-surface-400 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 mb-2">Sepetiniz Boş</h2>
        <p className="text-surface-500 mb-8 text-center max-w-md">
          Sepetinizde henüz hiç ürün bulunmuyor. Binlerce ürün arasından size uygun olanları bulmak için alışverişe başlayın.
        </p>
        <Link to="/urunler" className="btn btn-primary px-8">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  // ========================================
  // SEPET İÇERİĞİ
  // ========================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sepet Detayları */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-surface-900">Sepetiniz ({totalItems} Ürün)</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        {cart.map((item) => (
          <div key={item.id} className="card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Ürün Görseli */}
            <div className="w-24 h-24 flex-shrink-0 bg-surface-100 rounded-lg flex items-center justify-center border border-surface-200">
              <PackageOpen size={32} className="text-surface-300" />
            </div>

            {/* Ürün Bilgisi */}
            <div className="flex-1 min-w-0">
              <Link to={`/urunler/${item.id}`} className="text-lg font-semibold text-surface-900 hover:text-primary-600 line-clamp-1 transition-colors">
                {item.isim}
              </Link>
              <div className="text-sm text-surface-500 mt-1 line-clamp-1">{item.aciklama}</div>
              <div className="text-primary-600 font-bold mt-2">
                ₺{item.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Adet ve Silme Kontrolleri */}
            <div className="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-surface-100">
              <div className="flex items-center border border-surface-200 rounded-lg bg-white">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 text-surface-500 hover:text-primary-600 hover:bg-surface-50 disabled:opacity-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-medium text-surface-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stok}
                  className="p-2 text-surface-500 hover:text-primary-600 hover:bg-surface-50 disabled:opacity-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                title="Ürünü Sil"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* Teslimat Bilgileri (Sadece giriş yapılmışsa) */}
        {user && (
           <div className="card p-6 mt-8">
             <h3 className="text-lg font-bold text-surface-900 mb-4">Teslimat Bilgileri</h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-surface-700 mb-1">Teslimat Adresi *</label>
                 <textarea
                   className="input-field min-h-[80px]"
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                   placeholder="Mahalle, sokak, bina numarası, ilçe/il bilgilerinizi girin..."
                   required
                 ></textarea>
               </div>
               <div>
                 <label className="block text-sm font-medium text-surface-700 mb-1">Sipariş Notu (Opsiyonel)</label>
                 <textarea
                   className="input-field min-h-[60px]"
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   placeholder="Örn: Kapıyı çalmayın..."
                 ></textarea>
               </div>
             </div>
           </div>
        )}

        {/* Ödeme Yöntemi Bilgisi */}
        {user && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <Landmark size={18} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-surface-900">Ödeme Yöntemi</h3>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                <CreditCard size={18} />
                Havale / EFT ile Ödeme
              </div>
              <p className="text-sm text-surface-600">
                Siparişinizi onayladıktan sonra IBAN bilgileri ve sipariş numaranız ekranda görünecektir. 
                Ödemenizi <strong>2 iş günü</strong> içinde belirtilen IBAN'a transfer etmeniz gerekmektedir.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sipariş Özeti (Sağ Sidebar) */}
      <div className="lg:col-span-4 sticky top-24">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-surface-900 mb-4 pb-4 border-b border-surface-100">Sipariş Özeti</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-surface-600">
              <span>Ara Toplam ({totalItems} Ürün)</span>
              <span>₺{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Kupon İndirimi</span>
                <span>-₺{Number(discountAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-surface-600">
              <span>Kargo Ücreti</span>
              {shippingCost === 0 ? (
                <span className="text-green-600 font-medium">Ücretsiz</span>
              ) : (
                <span>₺{shippingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              )}
            </div>
          </div>
          
          {/* İndirim Kodu Alanı */}
          <div className="mb-6 border-t border-surface-100 pt-4">
            <label className="block text-sm font-semibold text-surface-700 mb-2">İndirim Kodu</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Kupon kodunuz"
                className="input-field flex-1 text-sm uppercase"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim()}
                  className="bg-surface-900 text-white px-4 rounded-lg text-sm font-semibold hover:bg-surface-800 disabled:opacity-50 transition-colors"
                >
                  Uygula
                </button>
              ) : (
                <button
                  onClick={handleRemoveCoupon}
                  className="bg-red-50 text-red-600 px-4 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  İptal
                </button>
              )}
            </div>
            {couponMsg.text && (
              <p className={`text-xs mt-2 font-medium ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-end border-t border-surface-100 pt-4 mb-6">
            <span className="font-bold text-surface-900">Genel Toplam</span>
            <span className="text-2xl font-bold text-primary-600">
              ₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {!user ? (
            <div className="space-y-3">
              <div className="bg-primary-50 text-primary-700 text-sm p-3 rounded-lg border border-primary-100">
                Siparişi tamamlamak için giriş yapmalısınız.
              </div>
              <Link to="/auth/login" className="btn btn-primary w-full">Giriş Yap</Link>
            </div>
          ) : (
             <button
              onClick={handleCheckout}
              disabled={isSubmitting || !address.trim()}
              className="btn bg-accent-500 text-surface-900 hover:bg-accent-400 w-full font-bold shadow-lg shadow-accent-500/20 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              ) : null}
              Siparişi Onayla
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
