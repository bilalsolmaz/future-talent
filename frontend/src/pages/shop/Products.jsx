import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, PackageOpen } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtre durumları
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Sayfa ilk yüklendiğinde
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategoriler/');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const fetchProducts = async (query = '', categoryId = '') => {
    setIsLoading(true);
    try {
      let url = '/urunler/';
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (categoryId) params.append('kategori_id', categoryId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Arama formu gönderildiğinde
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery, selectedCategory);
  };

  // Kategori değiştiğinde
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProducts(searchQuery, categoryId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sol Sidebar - Filtreler */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="card p-5 sticky top-24">
          <div className="flex items-center gap-2 font-bold text-surface-900 mb-6 pb-4 border-b border-surface-100">
            <SlidersHorizontal size={20} className="text-primary-600" />
            Filtreler
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
              Ürün Ara
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ne aramıştınız?"
                className="input-field pl-10 bg-surface-50 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            </div>
            {/* Sadece enter tuşuna basmak yetecek ama mobil için gizli submit butonu */}
            <button type="submit" className="hidden">Ara</button>
          </form>

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
              Kategoriler
            </label>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-surface-600 hover:bg-surface-50'
                }`}
              >
                Tüm Ürünler
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {cat.isim}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Ana İçerik - Ürün Listesi */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-surface-900">
            {selectedCategory === '' ? 'Tüm Ürünler' : categories.find(c => c.id === selectedCategory)?.isim}
            <span className="text-sm font-normal text-surface-500 ml-2">({products.length} sonuç)</span>
          </h1>
          
          <div className="flex items-center gap-2 text-sm text-surface-600 bg-white border border-surface-200 px-3 py-2 rounded-lg shadow-sm">
            <Filter size={16} />
            <select className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-surface-900 font-medium">
              <option value="newest">En Yeniler</option>
              <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="card p-5 animate-pulse">
                <div className="bg-surface-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-5 bg-surface-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-surface-200 rounded w-full mb-4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center p-16 text-center border-dashed border-2 bg-surface-50/50">
            <PackageOpen size={64} className="text-surface-300 mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">Ürün Bulunamadı</h3>
            <p className="text-surface-500 max-w-md">
              Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı kelimelerle veya farklı bir kategoride tekrar deneyin.
            </p>
            {(searchQuery || selectedCategory) && (
              <button 
                onClick={() => { setSearchQuery(''); handleCategoryChange(''); }}
                className="btn btn-secondary mt-6"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
