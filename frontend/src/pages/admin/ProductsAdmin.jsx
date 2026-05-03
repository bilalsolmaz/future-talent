import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // AI durumları
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [formData, setFormData] = useState({
    isim: '',
    aciklama: '',
    fiyat: '',
    stok: '',
    kategori_id: '',
    aktif: true
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
        aktif: product.aktif
      });
    } else {
      setEditingProduct(null);
      setFormData({
        isim: '',
        aciklama: '',
        fiyat: '',
        stok: '',
        kategori_id: categories[0]?.id || '',
        aktif: true
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

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek (pasife almak) istediğinize emin misiniz?')) {
      try {
        await api.delete(`/urunler/${id}`);
        fetchData();
      } catch (error) {
        alert('Silme hatası');
      }
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
                  <td className="p-4 font-medium text-surface-900">{product.isim}</td>
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
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Sil (Pasife Al)">
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
    </div>
  );
};

export default ProductsAdmin;
