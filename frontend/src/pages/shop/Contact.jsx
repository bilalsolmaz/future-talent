import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ isim: '', email: '', konu: '', mesaj: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gerçek bir uygulamada API'ye gönderilir
    setSubmitted(true);
    setForm({ isim: '', email: '', konu: '', mesaj: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold">
          <MessageSquare size={16} /> İletişim
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900">Bize Ulaşın</h1>
        <p className="text-surface-500 max-w-xl mx-auto">Sorularınız, önerileriniz veya şikayetleriniz için bizimle iletişime geçebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* İletişim Bilgileri */}
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Adres', value: 'Levent Mah. Teknoloji Cad. No:42\nBağcılar / İstanbul' },
            { icon: Phone, title: 'Telefon', value: '0850 123 45 67\nPzt - Cmt: 09:00 - 18:00' },
            { icon: Mail, title: 'E-posta', value: 'destek@localshop.com\ninfo@localshop.com' },
          ].map(item => (
            <div key={item.title} className="card p-5 flex items-start gap-4 hover:shadow-floating transition-shadow">
              <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 text-sm">{item.title}</h3>
                <p className="text-sm text-surface-500 mt-1 whitespace-pre-line">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* İletişim Formu */}
        <div className="lg:col-span-2">
          {submitted && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
              <CheckCircle2 size={20} />
              <p className="text-sm font-medium">Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-surface-600 mb-1.5 block">Adınız Soyadınız</label>
                <input
                  type="text" required
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={form.isim} onChange={e => setForm({...form, isim: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-600 mb-1.5 block">E-posta Adresiniz</label>
                <input
                  type="email" required
                  className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-600 mb-1.5 block">Konu</label>
              <select
                className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={form.konu} onChange={e => setForm({...form, konu: e.target.value})} required
              >
                <option value="">Konu seçiniz...</option>
                <option value="siparis">Sipariş Hakkında</option>
                <option value="iade">İade / Değişim</option>
                <option value="urun">Ürün Bilgisi</option>
                <option value="oneri">Öneri / Şikayet</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-600 mb-1.5 block">Mesajınız</label>
              <textarea
                className="w-full border border-surface-200 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                rows={5} required
                value={form.mesaj} onChange={e => setForm({...form, mesaj: e.target.value})}
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              <Send size={16} /> Mesajı Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
