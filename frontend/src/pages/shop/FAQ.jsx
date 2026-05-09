import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

const faqData = [
  {
    category: 'Sipariş & Teslimat',
    items: [
      { q: 'Siparişim ne zaman teslim edilir?', a: 'Siparişleriniz genellikle 1-3 iş günü içinde kargoya verilir. Kargo süreci bulunduğunuz bölgeye göre 1-5 iş günü sürebilir. 500₺ ve üzeri siparişlerde kargo ücretsizdir.' },
      { q: 'Siparişimi nasıl takip edebilirim?', a: 'Profilinizden "Siparişlerim" sekmesine giderek sipariş durumunuzu anlık olarak takip edebilirsiniz. Sipariş numaranız ile kargo firması üzerinden de takip yapabilirsiniz.' },
      { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: 'Havale/EFT yöntemiyle ödeme kabul ediyoruz. Sipariş oluşturulduktan sonra IBAN bilgileri ekranınızda görüntülenir.' },
      { q: 'Minimum sipariş tutarı var mı?', a: 'Hayır, minimum sipariş tutarı bulunmamaktadır. Ancak 500₺ altı siparişlerde 39.90₺ kargo ücreti uygulanır.' },
    ]
  },
  {
    category: 'İade & Değişim',
    items: [
      { q: 'İade süreci nasıl işliyor?', a: 'Profilinizden "Siparişlerim" sekmesine gidip ilgili siparişte "İade Talebi Oluştur" butonuna tıklayarak iade başvurusunda bulunabilirsiniz. Talebiniz yönetim ekibimiz tarafından incelendikten sonra sonuç bildirilir.' },
      { q: 'İade süresi ne kadardır?', a: 'Teslimat tarihinden itibaren 14 gün içinde iade talebinde bulunabilirsiniz. Ürünün kullanılmamış, orijinal ambalajında ve etiketlerinin sökülmemiş olması gerekmektedir.' },
      { q: 'İade onaylandıktan sonra paramı ne zaman alırım?', a: 'İade talebiniz onaylandıktan sonra iade tutarınız 3-5 iş günü içinde hesabınıza yatırılır.' },
      { q: 'Hangi ürünler iade edilemez?', a: 'Kişisel bakım ürünleri, iç giyim, kozmetik gibi hijyen gerektiren ürünler açıldıktan sonra iade edilemez.' },
    ]
  },
  {
    category: 'Hesap & Güvenlik',
    items: [
      { q: 'Nasıl hesap oluşturabilirim?', a: '"Kayıt Ol" sayfasından adınız, e-posta adresiniz ve şifrenizle hızlıca hesap açabilirsiniz. Hesap oluşturmak tamamen ücretsizdir.' },
      { q: 'Şifremi unuttum, ne yapmalıyım?', a: 'Profil sayfanızdan "Şifre Değiştir" seçeneğini kullanarak mevcut şifrenizi girip yeni şifre belirleyebilirsiniz.' },
      { q: 'Kişisel bilgilerim güvende mi?', a: 'Evet, 256-bit SSL sertifikası ile tüm verileriniz şifrelenmektedir. KVKK kapsamında kişisel verileriniz korunmaktadır.' },
    ]
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  const filtered = faqData.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  let globalIdx = 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold">
          <HelpCircle size={16} /> Yardım Merkezi
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900">Sıkça Sorulan Sorular</h1>
        <p className="text-surface-500">Aradığınız cevabı bulamadıysanız <a href="/iletisim" className="text-primary-600 font-semibold hover:underline">bize ulaşın</a>.</p>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Sorunuzu arayın..."
          className="w-full pl-12 pr-4 py-3.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.map(cat => (
        <div key={cat.category}>
          <h2 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
            {cat.category}
          </h2>
          <div className="space-y-2">
            {cat.items.map(item => {
              const idx = globalIdx++;
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="card overflow-hidden">
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
                  >
                    <span className="font-medium text-surface-900 text-sm pr-4">{item.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-primary-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-surface-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-surface-100">
                      <p className="text-sm text-surface-600 leading-relaxed pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
