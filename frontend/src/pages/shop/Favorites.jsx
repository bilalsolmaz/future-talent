import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, PackageOpen, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

const Favorites = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/favoriler/benim');
      setFavorites(res.data);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) { navigate('/auth/login'); return; }
    fetchFavorites();
  }, [user]);

  const handleRemove = async (urunId) => {
    try {
      await api.post('/favoriler/toggle', { urun_id: urunId });
      setFavorites(prev => prev.filter(f => f.urun_id !== urunId));
    } catch { /* silent */ }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-surface-900">Favorilerim</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(n => (
            <div key={n} className="card p-6 animate-pulse">
              <div className="aspect-square bg-surface-200 rounded-xl mb-4" />
              <div className="h-5 bg-surface-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <Heart size={24} className="text-red-500 fill-red-500" />
          Favorilerim
          <span className="text-base font-normal text-surface-400">({favorites.length})</span>
        </h1>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(fav => (
            <div key={fav.id} className="card flex flex-col overflow-hidden group hover:shadow-floating hover:border-primary-200 transition-all">
              <Link to={`/urunler/${fav.urun_id}`} className="relative aspect-square bg-surface-100 overflow-hidden flex items-center justify-center">
                {fav.urun_resim ? (
                  <img src={fav.urun_resim} alt={fav.urun_adi} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <PackageOpen size={64} className="text-surface-300" />
                )}
                <button
                  onClick={(e) => { e.preventDefault(); handleRemove(fav.urun_id); }}
                  className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-md hover:bg-red-100 transition-colors"
                  title="Favorilerden çıkar"
                >
                  <Heart size={18} className="fill-red-500" />
                </button>
              </Link>
              <div className="p-5 flex flex-col flex-grow">
                <Link to={`/urunler/${fav.urun_id}`}>
                  <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {fav.urun_adi}
                  </h3>
                </Link>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-surface-900">
                    ₺{Number(fav.urun_fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <Link
                    to={`/urunler/${fav.urun_id}`}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingCart size={16} /> Ürüne Git
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center border-dashed border-2">
          <Heart size={56} className="mx-auto text-surface-200 mb-4" />
          <h3 className="text-xl font-bold text-surface-900 mb-2">Favori Listeniz Boş</h3>
          <p className="text-surface-500 mb-6">Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyin.</p>
          <Link to="/urunler" className="btn btn-primary inline-flex">Ürünlere Göz At</Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
