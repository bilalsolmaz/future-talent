import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Sparkles, AlertCircle, Upload, X } from 'lucide-react';
import api from '../../services/api';

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // AI durumları
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [formData, setFormData] = useState({
    isim: '',
    aciklama: '',
    fiyat: '',
    stok: '',
    kategori_id: '',
    aktif: true,
    resim_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/urunler/'),
        api.get('/kategoriler/')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (product = null) => {
    setAiError('');
    if (product) {
      setEditingProduct(product);
      setFormData({
        isim: product.isim,
        aciklama: product.aciklama,
        fiyat: product.fiyat,
        stok: product.stok,
        kategori_id: product.kategori_id,
        aktif: product.aktif,
        resim_url: product.resim_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        isim: '',
        aciklama: '',
        fiyat: '',
        stok: '',
        kategori_id: categories[0]?.id || '',
        aktif: true,
        resim_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!formData.isim || !formData.fiyat) {
      setAiError('Yapay zeka asistanı için ürün adı ve fiyatı girilmesi zorunludur.');
      return;
    }

    setIsAILoading(true);
    setAiError('');

    try {
      const response = await api.post('/ai/aciklama-olustur', {
        urun_adi: formData.isim,
        fiyat: parseFloat(formData.fiyat)
      });
      
      setFormData(prev => ({
        ...prev,
        aciklama: response.data.aciklama
      }));
    } catch (error) {
      setAiError(error.response?.data?.detail || 'Gemini API ile iletişim kurulamadı. API Key kontrol edin.');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya formatı kontrolü
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp|\.gif)$/i;
    if (!allowedExtensions.exec(file.name)) {
      alert('Geçersiz dosya formatı. Sadece JPG, JPEG, PNG, WEBP ve GIF dosyalarına izin verilir.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/urunler/upload-gorsel', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({
        ...prev,
        resim_url: response.data.url
      }));
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken bir hata oluştu: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        fiyat: parseFloat(formData.fiyat),
        stok: parseInt(formData.stok, 10),
        kategori_id: parseInt(formData.kategori_id, 10)
      };

      if (editingProduct) {
        await api.put(`/urunler/${editingProduct.id}`, submitData);
      } else {
        await api.post('/urunler/', submitData);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Hata oluştu: ' + (error.response?.data?.detail || error.message));
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/urunler/${productToDelete.id}`);
      fetchData();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      alert('Silme hatası: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Ürün Yönetimi</h1>
          <p className="text-sm text-surface-500">Ürün ekle, düzenle ve Gemini AI ile açıklama oluştur.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={18} className="mr-2" /> Yeni Ürün
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-sm font-semibold text-surface-500 uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Ürün Adı</th>
                <th className="p-4">Fiyat</th>
                <th className="p-4">Stok</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-surface-50 transition-colors">
                  <td className="p-4 text-sm text-surface-500">#{product.id}</td>
                  <td className="p-4 font-medium text-surface-900">
                    <div className="flex items-center gap-3">
                      {product.resim_url ? (
                        <img src={product.resim_url} alt={product.isim} className="w-10 h-10 object-cover rounded-lg border border-surface-200" />
                      ) : (
                        <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center text-surface-400 border border-surface-200 text-[10px] font-semibold text-center leading-3">Görsel Yok</div>
                      )}
                      <span>{product.isim}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-surface-900">₺{product.fiyat}</td>
                  <td className="p-4 text-sm text-surface-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stok < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stok}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={() => openModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Düzenle">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => confirmDelete(product)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Sil (Pasife Al)">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-surface-500">Kayıtlı ürün bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-100 sticky top-0 bg-white/90 backdrop-blur z-10">
              <h2 className="text-xl font-bold">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-900">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Ürün Adı</label>
                  <input type="text" required className="input-field" value={formData.isim} onChange={e => setFormData({...formData, isim: e.target.value})} />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Ürün Görseli</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Bilgisayardan Yükleme Alanı */}
                      <div className="relative border-2 border-dashed border-surface-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-surface-50 transition-colors group cursor-pointer min-h-[100px]">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-primary-500" size={24} />
                            <span className="text-xs text-surface-500 font-medium">Yükleniyor...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <Upload className="text-surface-400 group-hover:text-primary-500 transition-colors" size={24} />
                            <span className="text-xs text-surface-600 font-semibold">Bilgisayardan Görsel Seç</span>
                            <span className="text-[10px] text-surface-400">PNG, JPG, WEBP (Max 5MB)</span>
                          </div>
                        )}
                      </div>

                      {/* URL ile Giriş Alanı */}
                      <div className="flex flex-col justify-center">
                        <span className="text-xs text-surface-400 mb-1 text-center font-medium sm:hidden">— VEYA —</span>
                        <label className="text-xs text-surface-500 mb-1 hidden sm:block">Görsel İnternet Adresi (URL)</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com/resim.jpg" 
                          className="input-field" 
                          value={formData.resim_url} 
                          onChange={e => setFormData({...formData, resim_url: e.target.value})} 
                        />
                      </div>
                    </div>

                    {/* Önizleme ve Kaldırma Kartı */}
                    {formData.resim_url && (
                      <div className="flex items-center gap-4 bg-surface-50 p-3 rounded-xl border border-surface-200 shadow-sm relative group/preview">
                        <div className="w-16 h-16 rounded-lg border border-surface-200 overflow-hidden flex-shrink-0 bg-white shadow-inner">
                          <img 
                            src={formData.resim_url} 
                            alt="Önizleme" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=G%C3%B6rsel+Bulunamad%C4%B1'; }} 
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-semibold text-surface-700 truncate">Seçilen Görsel</p>
                          <p className="text-[10px] text-surface-400 truncate font-mono">{formData.resim_url}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, resim_url: ''})}
                          className="p-1.5 bg-white text-red-500 border border-surface-200 hover:bg-red-50 hover:text-red-600 rounded-lg shadow-sm transition-all"
                          title="Görseli Kaldır"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Fiyat (₺)</label>
                  <input type="number" step="0.01" required className="input-field" value={formData.fiyat} onChange={e => setFormData({...formData, fiyat: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select required className="input-field" value={formData.kategori_id} onChange={e => setFormData({...formData, kategori_id: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.isim}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stok Miktarı</label>
                  <input type="number" required className="input-field" value={formData.stok} onChange={e => setFormData({...formData, stok: e.target.value})} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Açıklama</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateAI}
                    disabled={isAILoading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                  >
                    {isAILoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI ile Oluştur
                  </button>
                </div>
                {aiError && (
                  <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-start gap-1">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {aiError}
                  </div>
                )}
                <textarea 
                  required 
                  className="input-field min-h-[120px]" 
                  value={formData.aciklama} 
                  onChange={e => setFormData({...formData, aciklama: e.target.value})}
                  placeholder="Yapay zeka asistanını kullanarak harika bir açıklama oluşturabilirsiniz..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Ürünü Sil?</h2>
            <p className="text-surface-500 mb-6">
              <strong className="text-surface-900">{productToDelete?.isim}</strong> adlı ürünü silmek (pasife almak) istediğinize emin misiniz?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary flex-1">İptal</button>
              <button onClick={handleDelete} className="btn bg-red-600 hover:bg-red-700 text-white flex-1">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
