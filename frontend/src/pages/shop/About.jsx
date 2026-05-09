import React from 'react';
import { Store, Users, Award, Target, Heart, Zap } from 'lucide-react';

const About = () => (
  <div className="max-w-4xl mx-auto space-y-12">
    {/* Hero */}
    <div className="text-center space-y-4">
      <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold">
        <Store size={16} /> Hakkımızda
      </div>
      <h1 className="text-4xl font-extrabold text-surface-900">LocalShop Hikayesi</h1>
      <p className="text-lg text-surface-500 max-w-2xl mx-auto leading-relaxed">
        2024 yılında kurulan LocalShop, Türkiye'nin en güvenilir ve müşteri odaklı e-ticaret platformu olma vizyonuyla yola çıkmıştır.
      </p>
    </div>

    {/* Değerler */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { icon: Target, title: 'Misyonumuz', desc: 'Kaliteli ürünleri uygun fiyatlarla müşterilerimize ulaştırarak online alışveriş deneyimini dönüştürmek.' },
        { icon: Award, title: 'Vizyonumuz', desc: 'Türkiye\'nin en çok tercih edilen, güvenilir ve yenilikçi e-ticaret platformu olmak.' },
        { icon: Heart, title: 'Değerlerimiz', desc: 'Müşteri memnuniyeti, şeffaflık, kalite ve sürekli gelişim temel değerlerimizdir.' },
      ].map(item => (
        <div key={item.title} className="card p-6 text-center hover:shadow-floating transition-shadow">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <item.icon size={28} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">{item.title}</h3>
          <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    {/* İstatistikler */}
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
      <h2 className="text-2xl font-bold text-center mb-8">Rakamlarla LocalShop</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { value: '10.000+', label: 'Mutlu Müşteri' },
          { value: '5.000+', label: 'Ürün Çeşidi' },
          { value: '81', label: 'İl Teslimat' },
          { value: '%99', label: 'Memnuniyet' },
        ].map(stat => (
          <div key={stat.label}>
            <div className="text-3xl font-extrabold">{stat.value}</div>
            <div className="text-sm text-primary-100 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Ekip */}
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-surface-900">Neden Biz?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
        {[
          { icon: Zap, title: 'Hızlı Teslimat', desc: 'Siparişleriniz aynı gün kargoya verilir, 1-3 iş günü içinde kapınızda.' },
          { icon: Users, title: '7/24 Destek', desc: 'Müşteri hizmetlerimiz her an yanınızda. Sorularınız için bize ulaşın.' },
          { icon: Award, title: 'Kalite Garantisi', desc: 'Tüm ürünlerimiz orijinal ve kalite kontrol sürecinden geçmiştir.' },
          { icon: Heart, title: 'Kolay İade', desc: '14 gün içinde koşulsuz iade garantisi sunuyoruz.' },
        ].map(item => (
          <div key={item.title} className="flex gap-4 p-4 card hover:shadow-floating transition-shadow">
            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <item.icon size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-surface-900">{item.title}</h4>
              <p className="text-sm text-surface-500 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default About;
