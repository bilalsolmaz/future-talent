import React from 'react';
import { Shield, Lock } from 'lucide-react';

const KVKK = () => (
  <div className="max-w-3xl mx-auto space-y-8">
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold">
        <Shield size={16} /> Yasal
      </div>
      <h1 className="text-3xl font-extrabold text-surface-900">KVKK & Gizlilik Politikası</h1>
      <p className="text-surface-500">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
    </div>

    <div className="card p-8 space-y-6 prose prose-sm max-w-none text-surface-700">
      <section>
        <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2"><Lock size={18} className="text-primary-600" /> 1. Veri Sorumlusu</h2>
        <p>LocalShop Tic. Ltd. Şti. ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar çerçevesinde işlemektedir.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-surface-900">2. İşlenen Kişisel Veriler</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kimlik bilgileri: Ad, soyad</li>
          <li>İletişim bilgileri: E-posta adresi, telefon numarası</li>
          <li>Sipariş bilgileri: Teslimat adresi, sipariş geçmişi</li>
          <li>Müşteri işlem bilgileri: Sepet içerikleri, favoriler</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-surface-900">3. Verilerin İşlenme Amaçları</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sipariş süreçlerinin yürütülmesi</li>
          <li>Müşteri hizmetlerinin sağlanması</li>
          <li>İade ve değişim süreçlerinin yönetimi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Kampanya ve bildirim gönderimi (izniniz dahilinde)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-surface-900">4. Veri Güvenliği</h2>
        <p>Kişisel verileriniz, 256-bit SSL şifreleme, güvenlik duvarları ve erişim kontrolleri ile korunmaktadır. Verilerinize yalnızca yetkili personel erişebilir.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-surface-900">5. Haklarınız</h2>
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yanlış veya eksik işlenmişse düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-surface-900">6. İletişim</h2>
        <p>KVKK kapsamındaki taleplerinizi <strong>destek@localshop.com</strong> adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanacaktır.</p>
      </section>
    </div>
  </div>
);

export default KVKK;
