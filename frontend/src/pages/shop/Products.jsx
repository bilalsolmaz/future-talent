import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, PackageOpen } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dynamicFiltersOptions, setDynamicFiltersOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const STANDARD_PARAMS = useMemo(() => ['q', 'kategori_id', 'siralama', 'min_fiyat', 'max_fiyat'], []);
  
  const getSelectedDynamicFilters = useCallback(() => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!STANDARD_PARAMS.includes(key)) {
        filters[key] = value;
      }
    }
    return filters;
  }, [searchParams, STANDARD_PARAMS]);
  const urlQuery = searchParams.get('q') || '';
  const urlCategoryId = searchParams.get('kategori_id') || '';
  const urlSiralama = searchParams.get('siralama') || '';
  const urlMinFiyat = searchParams.get('min_fiyat') || '';
  const urlMaxFiyat = searchParams.get('max_fiyat') || '';

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [minFiyat, setMinFiyat] = useState(urlMinFiyat);
  const [maxFiyat, setMaxFiyat] = useState(urlMaxFiyat);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setSearchQuery(urlQuery);
    setMinFiyat(urlMinFiyat);
    setMaxFiyat(urlMaxFiyat);
  }, [urlQuery, urlMinFiyat, urlMaxFiyat]);

  // Sayfa ilk yüklendiğinde kategorileri çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/kategoriler/');
        setCategories(response.data);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      }
    };
    fetchCategories();
  }, []);

  // Kategori değiştiğinde dinamik filtreleri getir
  useEffect(() => {
    const fetchDynamicFilters = async () => {
      try {
        const url = urlCategoryId ? `/urunler/filtreler?kategori_id=${urlCategoryId}` : '/urunler/filtreler';
        const response = await api.get(url);
        setDynamicFiltersOptions(response.data);
      } catch (error) {
        console.error('Dinamik filtreler yüklenirken hata:', error);
      }
    };
    fetchDynamicFilters();
  }, [urlCategoryId]);

  // Ürünleri getir (URL parametreleri değiştiğinde)
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (urlQuery) params.append('q', urlQuery);
        if (urlCategoryId) params.append('kategori_id', urlCategoryId);
        if (urlSiralama) params.append('siralama', urlSiralama);
        if (urlMinFiyat) params.append('min_fiyat', urlMinFiyat);
        if (urlMaxFiyat) params.append('max_fiyat', urlMaxFiyat);

        // Dinamik filtreleri parametrelere ekle
        const dynamicFilters = getSelectedDynamicFilters();
        Object.entries(dynamicFilters).forEach(([key, value]) => {
          params.append(key, value);
        });

        const response = await api.get(`/urunler/?${params.toString()}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [urlQuery, urlCategoryId, urlSiralama, urlMinFiyat, urlMaxFiyat, getSelectedDynamicFilters]);

  // URL parametrelerini oluştururken yardımcı fonksiyon
  const buildParams = (overrides = {}) => {
    const p = {};
    if (urlQuery) p.q = urlQuery;
    if (urlCategoryId) p.kategori_id = urlCategoryId;
    if (urlSiralama) p.siralama = urlSiralama;
    if (urlMinFiyat) p.min_fiyat = urlMinFiyat;
    if (urlMaxFiyat) p.max_fiyat = urlMaxFiyat;

    // Dinamik filtreleri koru
    const dynamicFilters = getSelectedDynamicFilters();
    Object.assign(p, dynamicFilters);

    // Eğer kategori değiştiriliyorsa, kategoriye ait eski dinamik filtreleri sıfırla
    if ('kategori_id' in overrides && overrides.kategori_id !== urlCategoryId) {
      for (const key of Object.keys(dynamicFilters)) {
        delete p[key];
      }
    }

    // Geçersiz veya undefined değerleri temizleyerek birleştir
    const finalParams = { ...p, ...overrides };
    Object.keys(finalParams).forEach(key => {
      if (finalParams[key] === undefined || finalParams[key] === '') {
        delete finalParams[key];
      }
    });

    return finalParams;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(buildParams({ q: searchQuery.trim() || undefined }));
  };

  // Kategori değiştiğinde URL'yi güncelle
  const handleCategoryChange = (categoryId) => {
    setSearchParams(buildParams({ kategori_id: categoryId || undefined }));
  };

  const handleSortChange = (value) => {
    setSearchParams(buildParams({ siralama: value || undefined }));
  };

  const handlePriceFilter = () => {
    setSearchParams(buildParams({
      min_fiyat: minFiyat || undefined,
      max_fiyat: maxFiyat || undefined,
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMinFiyat('');
    setMaxFiyat('');
    setSearchParams({});
  };

  // Aktif kategori nesnesini bul
  const activeCategory = categories.find(c => String(c.id) === String(urlCategoryId));

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sol Sidebar - Filtreler */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="card p-5 sticky top-40">
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
                  !urlCategoryId 
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
                    String(urlCategoryId) === String(cat.id) 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {cat.isim}
                </button>
              ))}
            </div>
          </div>

          {/* Fiyat Aralığı */}
          <div className="mt-6 pt-4 border-t border-surface-100">
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
              Fiyat Aralığı
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={minFiyat}
                onChange={e => setMinFiyat(e.target.value)}
                min="0"
              />
              <span className="text-surface-400">-</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={maxFiyat}
                onChange={e => setMaxFiyat(e.target.value)}
                min="0"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              className="w-full mt-2 bg-primary-50 text-primary-700 font-semibold py-2 rounded-lg text-xs hover:bg-primary-100 transition-colors"
            >
              Fiyat Filtrele
            </button>
          </div>

          {/* Dinamik Filtreler */}
          {Object.entries(dynamicFiltersOptions).map(([filterName, options]) => (
            <div key={filterName} className="mt-6 pt-4 border-t border-surface-100">
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                {filterName}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {options.map((option) => {
                  const isSelected = searchParams.get(filterName) === String(option);
                  return (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newParams = buildParams();
                          if (isSelected) {
                            delete newParams[filterName]; // Seçimi kaldır
                          } else {
                            newParams[filterName] = option; // Seç
                          }
                          setSearchParams(newParams);
                        }}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded-sm border-surface-300"
                      />
                      <span className="text-sm text-surface-600 group-hover:text-surface-900">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </aside>

      {/* Ana İçerik - Ürün Listesi */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-surface-900">
            {activeCategory ? activeCategory.isim : urlQuery ? `"${urlQuery}" araması` : 'Tüm Ürünler'}
            <span className="text-sm font-normal text-surface-500 ml-2">({products.length} sonuç)</span>
          </h1>
          
          <div className="flex items-center gap-2 text-sm text-surface-600 bg-white border border-surface-200 px-3 py-2 rounded-lg shadow-sm">
            <Filter size={16} />
            <select
              className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-surface-900 font-medium"
              value={urlSiralama}
              onChange={e => handleSortChange(e.target.value)}
            >
              <option value="">En Yeniler</option>
              <option value="en_ucuz">Fiyat (Düşükten Yükseğe)</option>
              <option value="en_pahali">Fiyat (Yüksekten Düşüğe)</option>
            </select>
          </div>
        </div>

        {/* Aktif Filtre Etiketleri */}
        {(urlQuery || urlCategoryId) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-surface-500">Aktif filtreler:</span>
            {urlQuery && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Arama: "{urlQuery}"
                <button onClick={() => { setSearchQuery(''); setSearchParams(urlCategoryId ? {kategori_id: urlCategoryId} : {}); }} className="ml-0.5 hover:text-primary-900">✕</button>
              </span>
            )}
            {activeCategory && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {activeCategory.isim}
                <button onClick={() => setSearchParams(buildParams({ kategori_id: undefined }))} className="ml-0.5 hover:text-primary-900">✕</button>
              </span>
            )}
            {/* Dinamik Filtre Etiketleri */}
            {Object.entries(getSelectedDynamicFilters()).map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 bg-surface-100 text-surface-700 text-xs font-medium px-2.5 py-1 rounded-full border border-surface-200">
                {key}: {value}
                <button onClick={() => {
                  const p = buildParams();
                  delete p[key];
                  setSearchParams(p);
                }} className="ml-0.5 hover:text-surface-900">✕</button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium ml-1">
              Tümünü Temizle
            </button>
          </div>
        )}

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
            {(urlQuery || urlCategoryId) && (
              <button 
                onClick={clearFilters}
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
