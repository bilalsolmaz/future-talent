# 🛍️ LocalShop — MVP (Minimum Viable Product)

> Küçük ve yerel işletmeler için komisyonsuz dijital vitrin & sipariş sistemi.

---

## 🎯 MVP Hedefi

LocalShop'un ilk çalışan sürümü; bir işletme sahibinin ürünlerini yönetebileceği, müşterilerin ürünleri inceleyip sipariş verebileceği ve yapay zekâ destekli içerik üretiminin kullanılabildiği **tam işlevsel bir web uygulamasıdır.**

MVP kapsamı bilinçli olarak sınırlı tutulmuştur: karmaşıklık yerine çalışan, test edilebilir ve deploy edilebilir bir ürün önceliklidir.

---

## ✅ MVP Kapsamındaki Özellikler

### 1. Kullanıcı Girişi & Rol Yönetimi
- [ ] Kullanıcı kayıt ol (ad, e-posta, şifre)
- [ ] Kullanıcı giriş yap (JWT access token)
- [ ] İki rol: `admin` (işletme sahibi) ve `musteri`
- [ ] Korumalı rotalar — yetkisiz erişimde yönlendirme
- [ ] Token yenileme (refresh token)
- [ ] Şifre bcrypt ile hash'lenir, plaintext hiçbir yerde tutulmaz

### 2. Ürün Vitrini & Yönetimi
- [ ] Admin: ürün ekle (ad, açıklama, fiyat, stok, kategori, görsel URL)
- [ ] Admin: ürün düzenle
- [ ] Admin: ürün sil (soft delete — `aktif = false`)
- [ ] Admin: stok güncelle
- [ ] Müşteri: tüm aktif ürünleri listele
- [ ] Müşteri: kategoriye göre filtrele
- [ ] Müşteri: ada göre arama
- [ ] Müşteri: ürün detay sayfası

### 3. Sepet & Sipariş Akışı
- [ ] Müşteri: sepete ürün ekle / çıkar / miktar güncelle
- [ ] Müşteri: teslimat adresi ve not girerek sipariş oluştur
- [ ] Admin: tüm siparişleri listele
- [ ] Admin: sipariş detayını görüntüle
- [ ] Admin: sipariş durumunu güncelle (`bekliyor` → `hazırlanıyor` → `teslim_edildi` → `iptal`)
- [ ] Müşteri: kendi sipariş geçmişini görüntüle

### 4. 🌟 Gemini AI — Ürün Açıklama Üreteci *(Özgün Özellik)*
- [ ] Admin ürün ekleme formunda "AI ile Açıklama Oluştur" butonu
- [ ] Ürün adı + fiyat → Gemini API → Türkçe profesyonel açıklama önerisi
- [ ] Öneri düzenlenebilir metin alanına aktarılır
- [ ] Admin isterse düzenler, isterse doğrudan kaydeder
- [ ] API anahtarı yalnızca backend `.env` dosyasında tutulur

---

## 🚫 MVP Dışında Kalan Özellikler

Bunlar v2 / sonraki sürümler için planlanmıştır:

| Özellik | Gerekçe |
|---|---|
| Ödeme sistemi (iyzico, Stripe) | Entegrasyon karmaşıklığı |
| SMS / e-posta bildirimi | Üçüncü taraf servis bağımlılığı |
| Çok-tenant (birden fazla işletme) | Mimari genişletme gerektirir |
| Ürün yorumları & puanlama | Ek moderasyon ihtiyacı |
| Kargo takip entegrasyonu | Sağlayıcı API bağımlılığı |
| Gelişmiş dashboard (grafik, analitik) | MVP sonrası nice-to-have |
| Mobil uygulama (React Native) | Ayrı proje kapsamı |

---

## 🗂️ MVP Veri Modeli

```
users               → id, email, password_hash, rol, isim, telefon, created_at
kategoriler         → id, isim, slug, created_at
urunler             → id, isim, aciklama, fiyat, stok, kategori_id, resim_url, aktif, created_at
siparisler          → id, user_id, toplam_tutar, durum, adres, not, created_at, updated_at
siparis_kalemleri   → id, siparis_id, urun_id, adet, birim_fiyat
```

---

## 📐 MVP Sayfa Yapısı

### Public (Müşteri)
```
/                   → Vitrin — öne çıkan ürünler
/urunler            → Tüm ürünler (filtre + arama)
/urun/:id           → Ürün detay
/sepet              → Sepet
/siparis            → Sipariş oluştur
/giris              → Giriş
/kayit              → Kayıt
/profilim           → Sipariş geçmişi
```

### Admin (Korumalı — sadece admin rolü)
```
/admin              → Dashboard
/admin/urunler      → Ürün listesi
/admin/urun/ekle    → Yeni ürün ekle (AI destekli)
/admin/urun/:id     → Ürün düzenle / sil
/admin/siparisler   → Sipariş listesi
/admin/siparis/:id  → Sipariş detayı & durum güncelle
/admin/kategoriler  → Kategori yönetimi
```

---

## 🏗️ Teknik Stack

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 + TailwindCSS |
| Backend | Python 3.11 + FastAPI |
| Veritabanı | PostgreSQL 15 |
| ORM | SQLAlchemy 2.x |
| Migration | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| AI | Google Gemini API (`gemini-2.0-flash`) |
| Web Sunucusu | Nginx |
| Süreç Yönetimi | Uvicorn + Systemd |
| SSL | Let's Encrypt (Certbot) |
| Versiyon Kontrolü | Git + GitHub |

---

## 🚀 MVP Başarı Kriterleri

MVP tamamlanmış sayılır, aşağıdaki senaryolar uçtan uca çalıştığında:

1. **Admin** sisteme giriş yapabilir
2. **Admin** yeni ürün ekleyebilir; AI butonu çalışan bir açıklama üretebilir
3. **Müşteri** kayıt olabilir ve giriş yapabilir
4. **Müşteri** ürünleri listeleyebilir, filtreleyebilir, arama yapabilir
5. **Müşteri** sepete ürün ekleyip sipariş oluşturabilir
6. **Admin** siparişi görebilir ve durumunu güncelleyebilir
7. **Müşteri** sipariş geçmişini görebilir
8. Uygulama VPS üzerinde HTTPS ile erişilebilir durumdadır

---

## 📦 Teslim Edilecekler

- [ ] GitHub reposu (kaynak kod)
- [ ] `.zip` dosyası (Classroom'a yükleme)
- [ ] `README.md` (kurulum + çalıştırma talimatları)
- [ ] YouTube video demo (8–10 dakika)
- [ ] Yansıtma raporu

---

*LocalShop MVP — 2026*
