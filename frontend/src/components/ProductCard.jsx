import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageOpen, Heart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProductCard = ({ product, favoriteIds = [] }) => {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isFav, setIsFav] = useState(favoriteIds.includes(product.id));
  const [rating, setRating] = useState(null);

  useEffect(() => {
    setIsFav(favoriteIds.includes(product.id));
  }, [favoriteIds, product.id]);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await api.get(`/yorumlar/urun/${product.id}/ozet`);
        if (res.data.toplam > 0) setRating(res.data);
      } catch { /* silent */ }
    };
    fetchRating();
  }, [product.id]);

  const cartItem = cart.find(item => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stok === 0;
  const isMaxQuantityReached = cartQuantity >= product.stok;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isOutOfStock && !isMaxQuantityReached) {
      addToCart(product, 1);
    }
  };

  const handleToggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/auth/login'); return; }
    try {
      const res = await api.post('/favoriler/toggle', { urun_id: product.id });
      setIsFav(res.data.status === 'added');
    } catch { /* silent */ }
  };

  return (
    <Link to={`/urunler/${product.id}`} className="group card flex flex-col h-full hover:shadow-floating hover:border-primary-200 focus-visible:ring-2 focus-visible:ring-primary-500">
      {/* Resim Alanı */}
      <div className="relative aspect-square bg-surface-100 overflow-hidden flex items-center justify-center">
        {isOutOfStock && (
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-10">
             <span className="bg-white text-surface-900 font-bold px-4 py-2 rounded-lg shadow-lg rotate-12">
               Tükendi
             </span>
          </div>
        )}

        {/* Favori Kalp */}
        <button
          onClick={handleToggleFav}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md transition-all ${
            isFav 
              ? 'bg-red-50 text-red-500 hover:bg-red-100' 
              : 'bg-white/80 backdrop-blur text-surface-400 hover:text-red-500'
          }`}
          title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart size={18} className={isFav ? 'fill-red-500' : ''} />
        </button>
        
        {product.resim_url ? (
          <img 
            src={product.resim_url} 
            alt={product.isim} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50' : ''}`}
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`${product.resim_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
          <PackageOpen size={64} className={`text-surface-300 transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50' : ''}`} />
        </div>
      </div>

      {/* Ürün Detayları */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-surface-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.isim}
        </h3>

        {/* Yıldız */}
        {rating && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className={i <= Math.round(rating.ortalama) ? 'text-amber-400 fill-amber-400' : 'text-surface-200'} />
              ))}
            </div>
            <span className="text-xs text-surface-500">({rating.toplam})</span>
          </div>
        )}

        <p className="text-sm text-surface-500 mt-1 line-clamp-2 flex-grow">
          {product.aciklama}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-surface-900">
              ₺{product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs ${isOutOfStock ? 'text-red-500 font-medium' : 'text-surface-400'}`}>
              {isOutOfStock ? 'Stokta yok' : product.fiyat >= 500 ? 'Ücretsiz kargo' : `Stok: ${product.stok}`}
            </span>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxQuantityReached}
            className={`p-3 rounded-xl transition-all flex items-center justify-center shadow-sm ${
              isOutOfStock || isMaxQuantityReached 
                ? 'bg-surface-100 text-surface-400 cursor-not-allowed' 
                : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white active:scale-95'
            }`}
            title={isMaxQuantityReached ? "Maksimum stoğa ulaştınız" : "Sepete Ekle"}
            aria-label={`${product.isim} ürününü sepete ekle`}
          >
            <ShoppingCart size={20} className={cartQuantity > 0 ? "fill-current" : ""} />
            {cartQuantity > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white shadow-sm shadow-accent-500/50">
                {cartQuantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
