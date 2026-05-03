import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isim, setIsim] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategoriler/');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenemedi', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setIsim(category.isim);
    } else {
      setEditingCategory(null);
      setIsim('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/kategoriler/${editingCategory.id}`, { isim });
      } else {
        await api.post('/kategoriler/', { isim });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Kategoriyi silmek istediğinize emin misiniz? (Bağlı ürünler etkilenebilir)')) {
      try {
        await api.delete(`/kategoriler/${id}`);
        fetchCategories();
      } catch (error) {
        alert('Kategori silinirken hata oluştu.');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Kategori Yönetimi</h1>
          <p className="text-sm text-surface-500">Ürün kategorilerini ekle, sil ve düzenle.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={18} className="mr-2" /> Yeni Kategori
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200 text-sm font-semibold text-surface-500 uppercase tracking-wider">
              <th className="p-4 w-16">ID</th>
              <th className="p-4">Kategori Adı</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-surface-50 transition-colors">
                <td className="p-4 text-sm text-surface-500">#{category.id}</td>
                <td className="p-4 font-medium text-surface-900">{category.isim}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => openModal(category)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Düzenle">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Sil">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan="3" className="p-8 text-center text-surface-500">Kayıtlı kategori bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h2 className="text-xl font-bold">{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-900">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Adı</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={isim} 
                  onChange={e => setIsim(e.target.value)} 
                  placeholder="Örn: Akıllı Telefonlar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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

export default CategoriesAdmin;
