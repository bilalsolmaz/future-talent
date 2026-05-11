# 🛍️ LocalShop — MVP (Minimum Viable Product)

> Küçük ve yerel işletmeler için AI-agent destekli dijital vitrin, sipariş ve operasyon otomasyon platformu.

---

## 🎯 MVP Hedefi

LocalShop MVP'si iki katmanlıdır:

**Katman 1 — Temel E-ticaret**
Ürün vitrini, sepet & sipariş, kullanıcı yönetimi.

**Katman 2 — AI Otomasyon**
Müşteri iletişim ajanı, kargo takibi, stok uyarıları, iş akışı otomasyonu.

MVP, bu iki katmanın birlikte çalışan, test edilebilir ve deploy edilebilir halini kapsar.

---

## ✅ Katman 1 — Temel E-ticaret Özellikleri

### 1. Kullanıcı Girişi & Rol Yönetimi
- [ ] Kullanıcı kayıt / giriş (JWT access + refresh token)
- [ ] İki rol: `admin` ve `musteri`
- [ ] Korumalı rotalar, bcrypt şifre hash

### 2. Ürün Vitrini & Yönetimi
- [ ] Admin: ürün ekle / düzenle / sil (soft delete) / stok güncelle
- [ ] Müşteri: listeleme, kategori filtresi, arama, detay sayfası
- [ ] **Gemini AI — Ürün Açıklama Üreteci** (özgün özellik)

### 3. Sepet & Sipariş Akışı
- [ ] Sepete ekle / çıkar / miktar güncelle
- [ ] Sipariş oluşturma (stok kontrolü + otomatik düşüm)
- [ ] Sipariş durum akışı: `bekliyor → hazirlaniyor → teslim_edildi / iptal`
- [ ] Admin: sipariş listesi + durum güncelleme

---

## ✅ Katman 2 — AI Otomasyon Özellikleri (Hackathon)

### 4. Müşteri İletişim Ajanı — CustomerAgent
- [ ] `/api/agent/chat` endpoint — doğal dil sorgu arayüzü
- [ ] "Siparişim nerede?" → Otomatik sipariş sorgusu + kargo durumu yanıtı
- [ ] "X ürün stokta var mı?" → Anlık stok kontrolü yanıtı
- [ ] Konuşma geçmişi bağlam hafızası (son 10 mesaj)
- [ ] WhatsApp Business API webhook entegrasyonu *(v1.1)*

### 5. Kargo Takip Ajanı — CargoAgent
- [ ] Kargo API entegrasyonu (Yurtiçi Kargo öncelikli, PTT/Aras eklenti)
- [ ] Sipariş oluşturulunca kargo takip numarası kaydı
- [ ] Gecikme tespiti: kargo durumu "gecikme" işaretlenince otomatik tespit
- [ ] Gecikme → müşteriye otomatik bildirim (e-posta)
- [ ] Gecikme → admin'e özet rapor

### 6. Stok & Envanter Ajanı — StockAgent
- [ ] Stok eşik sistemi: her ürün için `stok_esigi` alanı
- [ ] Stok eşiğin altına düşünce admin'e otomatik uyarı (e-posta + dashboard)
- [ ] Geçmiş satış verisine dayalı yenileme miktarı önerisi (Gemini)
- [ ] Kritik stok dashboard widget'ı

### 7. İş Akışı Ajanı — WorkflowAgent
- [ ] Sabah 08:00 otomatik briefing (APScheduler cron)
  - O güne ait siparişler
  - Hazırlanması gereken paketler
  - Kritik stok uyarıları
  - Bugün teslim edilmesi gerekenler
- [ ] Briefing e-posta ile admin'e gönderilir
- [ ] Dashboard'da "Bugünün Özeti" widget'ı

### 8. Analitik & İçgörü Ajanı — AnalyticsAgent *(Opsiyonel)*
- [ ] Son 30 günlük satış trend analizi
- [ ] En çok satan 5 ürün tahmini (Gemini + geçmiş veri)
- [ ] Admin dashboard analitik sekmesi
- [ ] Haftalık özet rapor (e-posta)

---

## 🚫 MVP Dışında Kalan Özellikler

| Özellik | Versiyon |
|---|---|
| WhatsApp Business API tam entegrasyon | v1.1 |
| Ödeme sistemi (iyzico/Stripe) | v2 |
| SMS bildirim (Twilio) | v2 |
| Çok-tenant mimari | v2 |
| Mobil uygulama | v3 |
| Canlı sohbet (WebSocket) | v2 |
| Gelişmiş ML tahmin modeli | v2 |

---

## 🗂️ Genişletilmiş Veri Modeli

```
-- Mevcut tablolar
users               → id, email, password_hash, rol, isim, telefon, created_at
kategoriler         → id, isim, slug, created_at
urunler             → id, isim, aciklama, fiyat, stok, stok_esigi*, kategori_id, resim_url, aktif, created_at
siparisler          → id, user_id, toplam_tutar, durum, adres, not, kargo_no*, created_at, updated_at
siparis_kalemleri   → id, siparis_id, urun_id, adet, birim_fiyat

-- Yeni tablolar (hackathon)
kargo_takip         → id, siparis_id, firma, takip_no, durum, son_konum, guncelleme, gecikme_var
agent_konusmalar    → id, user_id, mesajlar (JSONB), olusturulma, son_aktif
stok_uyarilari      → id, urun_id, esik, mevcut_stok, durum, tetiklenme, kapatilma
briefing_gecmisi    → id, tarih, icerik (JSONB), gonderildi
analitik_ozet       → id, tarih, veriler (JSONB), tip (gunluk/haftalik/aylik)

* yeni alanlar mevcut tablolara eklenir
```

---

## 🏗️ Teknik Stack (Güncellenmiş)

| Katman | Teknoloji | Amaç |
|---|---|---|
| Frontend | React 18 + TailwindCSS | UI |
| Backend | Python 3.11 + FastAPI | API + Agent orchestration |
| Veritabanı | PostgreSQL 15 | Ana veri |
| Önbellek/Kuyruk | Redis | Agent mesaj kuyruğu, session cache |
| ORM | SQLAlchemy 2.x + Alembic | Veri erişimi |
| Auth | JWT + bcrypt | Kimlik doğrulama |
| AI Orchestrator | Google Gemini API | Tüm agent'ların beyni |
| Zamanlayıcı | APScheduler | Cron görevleri (briefing, kargo kontrol) |
| Kargo | Yurtiçi API + PTT API | Kargo takibi |
| Bildirim | SendGrid (e-posta) | Otomatik bildirimler |
| WhatsApp | Meta Business API | Müşteri iletişim kanalı |
| Sunucu | Nginx + Uvicorn + Systemd | Deploy |
| SSL | Let's Encrypt | HTTPS |

---

## 🤖 Agent Mimarisi

```
Gemini Agent Core (Orchestrator)
├── CustomerAgent     → Doğal dil sorgu · sipariş/stok yanıtlama
├── CargoAgent        → Kargo takip · gecikme tespiti · bildirim
├── StockAgent        → Stok izleme · eşik uyarısı · yenileme önerisi
├── WorkflowAgent     → Sabah briefing · görev dağılımı
└── AnalyticsAgent    → Satış trendi · tahmin · özet rapor
```

Her agent: Gemini API + ilgili veritabanı + harici API erişimine sahip.
Orchestrator: hangi agent'ın devreye gireceğini kullanıcı niyetine göre belirler.

---

## 🚀 MVP Başarı Kriterleri

1. Admin ürün ekleyebilir, AI açıklama üreteci çalışır
2. Müşteri sipariş verebilir, sepet akışı uçtan uca çalışır
3. Müşteri chat'te "siparişim nerede?" yazınca otomatik yanıt alır
4. Sipariş kargo gecikmesinde hem müşteri hem admin bildirim alır
5. Stok eşiği aşılınca admin uyarı alır + yenileme önerisi gelir
6. Her sabah 08:00'de admin günlük briefing e-postası alır
7. Admin dashboard'da analitik özet görünür
8. Tüm akış VPS üzerinde HTTPS ile erişilebilir

---

*LocalShop MVP — 2025–2026*
