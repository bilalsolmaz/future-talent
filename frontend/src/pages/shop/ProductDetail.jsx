import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Minus, Plus, ArrowLeft, Loader2, PackageOpen, 
  Truck, ShieldCheck, RotateCcw, Star, ChevronRight, Check, AlertCircle,
  Heart, Send, Trash2, MessageSquare, User
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

// Star component
const StarRating = ({ rating, size = 16, interactive = false, onRate }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        className={`${
          i <= rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200'
        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={() => interactive && onRate?.(i)}
      />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Yorumlar
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ toplam: 0, ortalama: 0, dagilim: {} });
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Favori
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Sepetteki mevcut adet
  const cartItem = cart.find(item => item.id === parseInt(id));
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkFavorite();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError('');
    setQuantity(1);
    setAddedToCart(false);
    try {
      const response = await api.get(`/urunler/${id}`);
      setProduct(response.data);

      if (response.data.kategori_id) {
        try {
          const relRes = await api.get(`/urunler/?kategori_id=${response.data.kategori_id}&limit=4`);
          setRelatedProducts(relRes.data.filter(p => p.id !== response.data.id).slice(0, 3));
        } catch { /* ilişkili ürünler opsiyonel */ }
      }
    } catch (err) {
      setError('Ürün bulunamadı veya bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        api.get(`/yorumlar/urun/${id}`),
        api.get(`/yorumlar/urun/${id}/ozet`),
      ]);
      setReviews(reviewsRes.data);
      setReviewSummary(summaryRes.data);
    } catch { /* silent */ }
  };

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/favoriler/kontrol/${id}`);
      setIsFavorite(res.data.favoride);
    } catch { /* silent */ }
  };

  const handleToggleFavorite = async () => {
    if (!user) { navigate('/auth/login'); return; }
    setFavLoading(true);
    try {
      const res = await api.post('/favoriler/toggle', { urun_id: parseInt(id) });
      setIsFavorite(res.data.status === 'added');
    } catch { /* silent */ }
    setFavLoading(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0 || newComment.length < 5) {
      setReviewMsg('Lütfen puan seçin ve en az 5 karakter yorum yazın.');
      return;
    }
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      await api.post('/yorumlar/', { urun_id: parseInt(id), puan: newRating, yorum: newComment });
      setNewRating(0);
      setNewComment('');
      setReviewMsg('Yorumunuz başarıyla eklendi!');
      fetchReviews();
    } catch (err) {
      setReviewMsg(err.response?.data?.detail || 'Yorum eklenirken bir hata oluştu.');
    }
    setReviewSubmitting(false);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/yorumlar/${reviewId}`);
      fetchReviews();
    } catch { /* silent */ }
  };

  const handleAddToCart = () => {
    if (!product || product.stok === 0) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const maxAvailable = product ? product.stok - cartQuantity : 0;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 w-32 bg-surface-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-surface-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-surface-200 rounded w-3/4"></div>
            <div className="h-4 bg-surface-200 rounded w-1/2"></div>
            <div className="h-10 bg-surface-200 rounded w-1/3 mt-6"></div>
            <div className="h-20 bg-surface-200 rounded mt-4"></div>
            <div className="h-14 bg-surface-200 rounded-xl mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 mb-2">Ürün Bulunamadı</h2>
        <p className="text-surface-500 mb-8 text-center max-w-md">
          Aradığınız ürün mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link to="/urunler" className="btn btn-primary px-8">
          <ArrowLeft size={18} className="mr-2" />
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stok === 0;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight size={14} />
        <Link to="/urunler" className="hover:text-primary-600 transition-colors">Ürünler</Link>
        <ChevronRight size={14} />
        <span className="text-surface-900 font-medium truncate max-w-[200px]">{product.isim}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Sol: Ürün Görseli */}
        <div className="sticky top-24">
          <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100 rounded-2xl border border-surface-200 overflow-hidden flex items-center justify-center shadow-soft">
            {isOutOfStock && (
              <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                <span className="bg-white text-surface-900 font-bold px-6 py-3 rounded-xl shadow-lg text-lg rotate-[-6deg]">
                  Tükendi
                </span>
              </div>
            )}
            {product.resim_url ? (
              <img 
                src={product.resim_url} 
                alt={product.isim} 
                className="w-full h-full object-cover"
              />
            ) : (
              <PackageOpen size={120} className="text-surface-300" />
            )}
          </div>
        </div>

        {/* Sağ: Ürün Bilgileri */}
        <div className="space-y-6">
          {/* Başlık ve Kategori */}
          <div>
            {product.kategori_id && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-3">
                Kategori #{product.kategori_id}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 leading-tight">
              {product.isim}
            </h1>
            {/* Yıldız Özeti */}
            {reviewSummary.toplam > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(reviewSummary.ortalama)} size={18} />
                <span className="text-sm font-semibold text-surface-700">{reviewSummary.ortalama}</span>
                <span className="text-sm text-surface-400">({reviewSummary.toplam} değerlendirme)</span>
              </div>
            )}
          </div>

          {/* Fiyat + Favori */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-surface-900">
                ₺{product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
              {product.fiyat >= 500 && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  Ücretsiz Kargo
                </span>
              )}
            </div>
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`p-3 rounded-xl border-2 transition-all ${
                isFavorite
                  ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                  : 'bg-surface-50 border-surface-200 text-surface-400 hover:text-red-500 hover:border-red-200'
              }`}
              title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Heart size={22} className={isFavorite ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Stok Durumu */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                <span className="text-sm font-medium text-red-600">Stokta yok</span>
              </>
            ) : product.stok <= 5 ? (
              <>
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-amber-600">Son {product.stok} adet!</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-600">Stokta ({product.stok} adet)</span>
              </>
            )}
          </div>

          {/* Açıklama */}
          {product.aciklama && (
            <div className="border-t border-surface-100 pt-6">
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Ürün Açıklaması</h3>
              <p className="text-surface-700 leading-relaxed whitespace-pre-line">
                {product.aciklama}
              </p>
            </div>
          )}

          {/* Adet Seçimi + Sepete Ekle */}
          {!isOutOfStock && (
            <div className="border-t border-surface-100 pt-6 space-y-4">
              {/* Sepette zaten varsa bilgi */}
              {cartQuantity > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 px-4 py-2.5 rounded-lg border border-primary-100">
                  <ShoppingCart size={16} />
                  <span>Sepetinizde zaten <strong>{cartQuantity}</strong> adet var.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Adet Kontrolleri */}
                <div className="flex items-center border border-surface-200 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-3 text-surface-500 hover:text-primary-600 hover:bg-surface-50 disabled:opacity-40 transition-colors rounded-l-xl"
                    aria-label="Adeti azalt"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-14 text-center font-bold text-lg text-surface-900 select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxAvailable, q + 1))}
                    disabled={quantity >= maxAvailable}
                    className="p-3 text-surface-500 hover:text-primary-600 hover:bg-surface-50 disabled:opacity-40 transition-colors rounded-r-xl"
                    aria-label="Adeti artır"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Sepete Ekle Butonu */}
                <button
                  onClick={handleAddToCart}
                  disabled={maxAvailable <= 0}
                  className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg active:scale-[0.98] ${
                    addedToCart
                      ? 'bg-green-500 text-white shadow-green-500/25'
                      : maxAvailable <= 0
                        ? 'bg-surface-200 text-surface-500 cursor-not-allowed shadow-none'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/25'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={22} />
                      Sepete Eklendi!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={22} />
                      Sepete Ekle
                    </>
                  )}
                </button>
              </div>

              {maxAvailable <= 0 && cartQuantity > 0 && (
                <p className="text-sm text-amber-600 font-medium">Maksimum stoğa ulaştınız.</p>
              )}
            </div>
          )}

          {/* Güven Bileşenleri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-surface-100 pt-6">
            <div className="flex items-center gap-3 text-surface-600">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-900">Hızlı Kargo</p>
                <p className="text-xs text-surface-500">1-3 iş günü</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-surface-600">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-900">Güvenli Ödeme</p>
                <p className="text-xs text-surface-500">256-bit SSL</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-surface-600">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-900">Kolay İade</p>
                <p className="text-xs text-surface-500">14 gün içinde</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İlişkili Ürünler */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-surface-100 pt-12">
          <h2 className="text-2xl font-bold text-surface-900 mb-8">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(rp => (
              <Link
                key={rp.id}
                to={`/urunler/${rp.id}`}
                className="group card flex flex-col hover:shadow-floating hover:border-primary-200 transition-all"
              >
                <div className="aspect-square bg-surface-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                  {rp.resim_url ? (
                    <img src={rp.resim_url} alt={rp.isim} className="w-full h-full object-cover" />
                  ) : (
                    <PackageOpen size={48} className="text-surface-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {rp.isim}
                  </h3>
                  <p className="text-sm text-surface-500 mt-1 line-clamp-2">{rp.aciklama}</p>
                  <p className="text-lg font-bold text-surface-900 mt-3">
                    ₺{rp.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ YORUM & DEĞERLENDİRME BÖLÜMÜ ═══════ */}
      <section className="mt-16 border-t border-surface-100 pt-12">
        <h2 className="text-2xl font-bold text-surface-900 mb-8 flex items-center gap-2">
          <MessageSquare size={24} className="text-primary-600" />
          Değerlendirmeler
          {reviewSummary.toplam > 0 && (
            <span className="text-base font-normal text-surface-400">({reviewSummary.toplam})</span>
          )}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Puan Özeti */}
          <div className="lg:col-span-1">
            <div className="card p-6 text-center">
              <div className="text-5xl font-extrabold text-surface-900 mb-1">
                {reviewSummary.ortalama || '—'}
              </div>
              <StarRating rating={Math.round(reviewSummary.ortalama)} size={22} />
              <p className="text-sm text-surface-500 mt-2">{reviewSummary.toplam} değerlendirme</p>

              {/* Dağılım barları */}
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map(p => {
                  const count = reviewSummary.dagilim?.[String(p)] || 0;
                  const pct = reviewSummary.toplam ? (count / reviewSummary.toplam) * 100 : 0;
                  return (
                    <div key={p} className="flex items-center gap-2 text-xs">
                      <span className="w-3 font-semibold text-surface-600">{p}</span>
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-surface-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yorum Yaz Formu */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="card p-6 mt-4">
                <h4 className="font-semibold text-surface-900 mb-3">Yorum Yaz</h4>
                <div className="mb-3">
                  <label className="text-xs text-surface-500 mb-1 block">Puanınız</label>
                  <StarRating rating={newRating} size={28} interactive onRate={setNewRating} />
                </div>
                <textarea
                  className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  rows={3}
                  placeholder="Ürün hakkındaki düşünceleriniz..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                {reviewMsg && (
                  <p className={`text-xs mt-2 ${reviewMsg.includes('başarı') ? 'text-green-600' : 'text-red-600'}`}>{reviewMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  <Send size={14} /> {reviewSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                </button>
              </form>
            )}
          </div>

          {/* Sağ: Yorum Listesi */}
          <div className="lg:col-span-2">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {r.kullanici_adi?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 text-sm">{r.kullanici_adi}</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={r.puan} size={14} />
                            <span className="text-xs text-surface-400">
                              {new Date(r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user && (user.id === r.user_id || user.rol === 'admin') && (
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 text-surface-300 hover:text-red-500 transition-colors"
                          title="Yorumu sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-surface-700 mt-3 leading-relaxed">{r.yorum}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center border-dashed border-2">
                <MessageSquare size={48} className="mx-auto text-surface-200 mb-4" />
                <h3 className="text-lg font-bold text-surface-900 mb-1">Henüz Değerlendirme Yok</h3>
                <p className="text-surface-500 text-sm">Bu ürünü satın aldıysanız ilk yorumu siz yapın!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
