import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, PackageOpen } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  
  // Ürünün sepette ne kadar olduğu
  const cartItem = cart.find(item => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = product.stok === 0;
  const isMaxQuantityReached = cartQuantity >= product.stok;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Link tıklamasını engelle
    if (!isOutOfStock && !isMaxQuantityReached) {
      addToCart(product, 1);
    }
  };

  return (
    <Link to={`/urunler/${product.id}`} className="group card flex flex-col h-full hover:shadow-floating hover:border-primary-200 focus-visible:ring-2 focus-visible:ring-primary-500">
      {/* Resim Alanı (Placeholder) */}
      <div className="relative aspect-square bg-surface-100 overflow-hidden flex items-center justify-center">
        {isOutOfStock && (
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-10">
             <span className="bg-white text-surface-900 font-bold px-4 py-2 rounded-lg shadow-lg rotate-12">
               Tükendi
             </span>
          </div>
        )}
        
        {/* Gerçek Ürün Görseli veya Placeholder */}
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
        <p className="text-sm text-surface-500 mt-1 line-clamp-2 flex-grow">
          {product.aciklama}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-surface-900">
              ₺{product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs ${isOutOfStock ? 'text-red-500 font-medium' : 'text-surface-400'}`}>
              Stok: {product.stok}
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
