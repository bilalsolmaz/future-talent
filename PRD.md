# 📋 LocalShop — PRD (Product Requirements Document)

> **Sürüm:** 2.0 — Plan Genişletmesi  
> **Proje:** KOBİ Otomasyon  
> **Yıl:** 2025–2026

---

## 1. Ürün Özeti

**LocalShop**, Türkiye'deki küçük ve yerel işletmelerin komisyon ödemeden kendi dijital vitrinlerini kurabilecekleri, siparişlerini yönetebilecekleri ve **AI destekli otomasyon** ile operasyonel yüklerini azaltabilecekleri bir web platformudur.

### Problem (Genişletilmiş)

Küçük işletmeler iki katmanlı bir sorunla karşı karşıyadır:

**Dijital Kanal Sorunu:** WhatsApp/telefon sipariş kaosundan kurtulup dijital satış kanalı kuramamak.

**Operasyonel Yük Sorunu:** Sipariş durumu sorularını yanıtlamak (günde 2–3 saat), stok tükenmesini geç fark etmek, kargo gecikmelerinden müşteriden önce haberdar olamamak.

### Çözüm

Hackathon kapsamında LocalShop şu dönüşümü gerçekleştirir:

```
Basit E-ticaret  →  AI-Agent Destekli Operasyon Platformu
```

---

## 2. Hedef Kitle

| Segment | Tanım |
|---|---|
| Küçük e-ticaret | 20–200 ürün, günde 10–100 sipariş |
| Butik / bölgesel satıcı | Fiziksel + online karma yapı |
| Üretici kooperatifleri | Tarım, gıda, el sanatları |
| Tek mağaza işletmesi | Kafe, pastane, market |

---

## 3. Kullanıcı Hikayeleri

### Temel E-ticaret (Katman 1)

```
US-01  Müşteri olarak ürünleri kategoriye göre filtreleyebilmek istiyorum.
US-02  Müşteri olarak ürün adına göre arama yapabilmek istiyorum.
US-03  Müşteri olarak sepete ürün ekleyip miktarı güncelleyebilmek istiyorum.
US-04  Müşteri olarak adres girerek sipariş oluşturabilmek istiyorum.
US-05  Müşteri olarak sipariş geçmişimi ve durumlarını görebilmek istiyorum.
US-06  Admin olarak ürün ekleyebilmeli, AI ile açıklama üretebilmeliyim.
US-07  Admin olarak siparişleri listeleyip durumlarını güncelleyebilmeliyim.
```

### AI Otomasyon (Katman 2)

```
US-08  Müşteri olarak "siparişim nerede?" yazınca insan müdahalesi olmadan
       anlık kargo bilgisi alabilmek istiyorum.

US-09  Müşteri olarak "X ürün var mı?" yazınca anlık stok bilgisi
       alabilmek istiyorum.

US-10  Admin olarak bir ürünün stoğu kritik eşiğin altına düşünce
       otomatik uyarı ve yenileme önerisi almak istiyorum.

US-11  Admin olarak kargo gecikmesi olan siparişleri müşteri şikayet
       etmeden önce tespit etmek istiyorum.

US-12  Admin olarak her sabah günün sipariş özetini, hazırlanması
       gereken paketleri ve kritik stokları otomatik e-posta ile
       almak istiyorum.

US-13  Admin olarak son 30 günlük satış trendini ve gelecek hafta
       için stok tahminini dashboard'dan görebilmek istiyorum.
```

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Auth & Rol Yönetimi

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-01 | Kayıt / giriş (e-posta + şifre) | Zorunlu |
| F-02 | JWT access (30 dk) + refresh (7 gün) token | Zorunlu |
| F-03 | Admin ve musteri rolleri, korumalı rotalar | Zorunlu |
| F-04 | bcrypt şifre hash (rounds=12) | Zorunlu |

### 4.2 Ürün & Kategori Yönetimi

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-05 | Ürün CRUD (soft delete) + stok güncelleme | Zorunlu |
| F-06 | Kategori CRUD | Zorunlu |
| F-07 | Listeleme: filtre (kategori) + arama (ILIKE) + sayfalama | Zorunlu |
| F-08 | Her ürüne `stok_esigi` alanı | Zorunlu |
| F-09 | OpenAI AI ürün açıklama üreteci | Zorunlu |

### 4.3 Sipariş Akışı

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-10 | Sipariş oluşturma (stok kontrolü + transaction) | Zorunlu |
| F-11 | Kargo takip numarası alanı sipariş tablosunda | Zorunlu |
| F-12 | Durum akışı: bekliyor → hazirlaniyor → teslim_edildi / iptal | Zorunlu |
| F-13 | Admin: tüm siparişler; Müşteri: kendi siparişleri | Zorunlu |

### 4.4 CustomerAgent — Müşteri İletişim Otomasyonu

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-14 | `POST /api/agent/chat` — doğal dil mesaj kabul eder | Zorunlu |
| F-15 | Niyet sınıflandırma: sipariş_sorgu / stok_sorgu / genel | Zorunlu |
| F-16 | Sipariş sorgusu: sipariş_id veya e-posta ile anlık durum | Zorunlu |
| F-17 | Stok sorgusu: ürün adı ile anlık stok kontrolü | Zorunlu |
| F-18 | Konuşma geçmişi hafızası (son 10 mesaj bağlam) | Zorunlu |
| F-19 | WhatsApp webhook endpoint (`POST /api/webhook/whatsapp`) | Yüksek |
| F-20 | Agent yanıtı 3 saniye içinde dönmeli | Zorunlu |

### 4.5 CargoAgent — Kargo Süreç Yönetimi

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-21 | Kargo takip API entegrasyonu (Yurtiçi öncelikli) | Zorunlu |
| F-22 | `GET /api/cargo/track/{siparis_id}` — anlık kargo durumu | Zorunlu |
| F-23 | Periyodik kargo durum kontrolü (APScheduler — her 2 saatte) | Zorunlu |
| F-24 | Gecikme tespiti → müşteriye otomatik e-posta bildirimi | Zorunlu |
| F-25 | Gecikme tespiti → admin'e özet rapor | Zorunlu |
| F-26 | `kargo_takip` tablosunda durum geçmişi tutulması | Zorunlu |

### 4.6 StockAgent — Stok & Envanter Yönetimi

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-27 | Sipariş oluşturulunca stok eşik kontrolü (synchronous) | Zorunlu |
| F-28 | Stok < eşik → `stok_uyarilari` tablosuna kayıt | Zorunlu |
| F-29 | Stok < eşik → admin'e e-posta + dashboard uyarısı | Zorunlu |
| F-30 | OpenAI: geçmiş satış verisine göre yenileme miktarı önerisi | Zorunlu |
| F-31 | `GET /api/stock/alerts` — açık uyarılar listesi [admin] | Zorunlu |
| F-32 | Uyarı kapatma / onaylama mekanizması | Yüksek |

### 4.7 WorkflowAgent — Görev & İş Akışı Otomasyonu

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-33 | APScheduler cron: her sabah 08:00 briefing tetikleme | Zorunlu |
| F-34 | Briefing içeriği: günlük siparişler, hazır paketler, kritik stoklar | Zorunlu |
| F-35 | Briefing e-posta ile admin'e gönderilir (SendGrid) | Zorunlu |
| F-36 | Dashboard "Bugünün Özeti" widget'ı anlık güncellenir | Zorunlu |
| F-37 | `GET /api/workflow/briefing/today` — günlük özet endpoint'i | Zorunlu |
| F-38 | Briefing içeriği `briefing_gecmisi` tablosuna kaydedilir | Yüksek |

### 4.8 AnalyticsAgent — Analitik & İçgörü (Opsiyonel)

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-39 | Son 30 günlük satış trend analizi | Orta |
| F-40 | En çok satan 5 ürün tahmini (OpenAI + geçmiş veri) | Orta |
| F-41 | `GET /api/analytics/insights` — haftalık özet | Orta |
| F-42 | Admin dashboard analitik sekmesi | Orta |

---

## 5. Fonksiyonel Olmayan Gereksinimler

### 5.1 Güvenlik
- JWT token expiry zorunlu; refresh token rotation uygulanır
- API key'ler yalnızca `.env` dosyasında; frontend'e çıkmaz
- WhatsApp webhook `X-Hub-Signature-256` doğrulaması yapılır
- Harici API çağrıları (kargo, e-posta) yalnızca backend üzerinden
- PostgreSQL ve Redis dışarıya kapalı (sadece localhost)
- Rate limiting: `/api/agent/chat` → max 20 istek/dakika/kullanıcı

### 5.2 Performans
- Agent chat yanıt süresi: ≤ 3 saniye
- Kargo durum kontrolü: her 2 saatte bir, asenkron
- Sabah briefing oluşturma: ≤ 30 saniye
- Ürün listeleme: sayfalama ile ≤ 500ms

### 5.3 Güvenilirlik
- Agent çağrısı başarısız olursa 3 kez retry, sonra fallback mesaj
- Kargo API'si erişilemezse son bilinen durum döndürülür
- E-posta gönderimi başarısız olursa sıraya alınır (Redis)
- APScheduler görev başarısız olursa loglama ve admin bildirimi

### 5.4 Gözlemlenebilirlik
- Tüm agent çağrıları ve yanıtları loglanır (tarih, süre, hata)
- Kargo durum geçmişi `kargo_takip` tablosunda tutulur
- Briefing geçmişi `briefing_gecmisi` tablosunda tutulur
- FastAPI `/api/healthcheck` endpoint'i tüm servisleri kontrol eder

---

## 6. Sistem Mimarisi

```
Browser / WhatsApp
      │
      ▼
   Nginx (80/443)
      ├── /              → React SPA
      └── /api           → FastAPI (localhost:8000)
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
          Agent Layer      PostgreSQL           Redis
        (OpenAI Core)    (localhost:5432)  (localhost:6379)
              │
    ┌─────────┼─────────┬──────────┐
    │         │         │          │
Customer  Cargo    Stock     Workflow
 Agent    Agent    Agent     Agent
    │         │         │          │
    └────┬────┘    ┌────┘    ┌─────┘
         │         │         │
    OpenAI API  Kargo API  APScheduler
                          SendGrid
```

---

## 7. Genişletilmiş API Endpoint Listesi

### Mevcut (Katman 1)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/urunler              ?kategori=&q=&sayfa=
GET    /api/urunler/:id
POST   /api/urunler              [admin]
PUT    /api/urunler/:id          [admin]
DELETE /api/urunler/:id          [admin]

GET    /api/kategoriler
POST   /api/kategoriler          [admin]
PUT    /api/kategoriler/:id      [admin]
DELETE /api/kategoriler/:id      [admin]

GET    /api/siparisler           [admin]
GET    /api/siparisler/benim     [musteri]
POST   /api/siparisler           [musteri]
PATCH  /api/siparisler/:id/durum [admin]

POST   /api/ai/aciklama-olustur  [admin]
```

### Yeni (Katman 2)
```
# CustomerAgent
POST   /api/agent/chat           { "mesaj": "...", "session_id": "..." }
GET    /api/agent/konusmalar     [musteri] kendi geçmişi
POST   /api/webhook/whatsapp     Meta webhook (imza doğrulamalı)

# CargoAgent
GET    /api/cargo/track/:siparis_id
POST   /api/cargo/sync           [admin] manuel kargo güncelleme tetikle

# StockAgent
GET    /api/stock/alerts         [admin] açık uyarılar
PATCH  /api/stock/alerts/:id     [admin] uyarı kapat

# WorkflowAgent
GET    /api/workflow/briefing/today   [admin]
GET    /api/workflow/briefing/:tarih  [admin] geçmiş briefing

# AnalyticsAgent
GET    /api/analytics/insights   [admin] ?tip=haftalik|aylik
GET    /api/analytics/tahmin     [admin] önümüzdeki hafta önerisi
```

---

## 8. Genişletilmiş Veritabanı Şeması

```sql
-- Mevcut tablolara eklenen alanlar
ALTER TABLE urunler    ADD COLUMN stok_esigi INTEGER DEFAULT 10;
ALTER TABLE siparisler ADD COLUMN kargo_no VARCHAR(100);

-- Yeni tablolar
CREATE TABLE kargo_takip (
  id SERIAL PRIMARY KEY,
  siparis_id INTEGER NOT NULL REFERENCES siparisler(id),
  firma VARCHAR(50),
  takip_no VARCHAR(100),
  durum VARCHAR(50),
  son_konum TEXT,
  gecikme_var BOOLEAN DEFAULT FALSE,
  guncelleme TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_konusmalar (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(100) UNIQUE,
  mesajlar JSONB NOT NULL DEFAULT '[]',
  kanal VARCHAR(20) DEFAULT 'web', -- 'web' | 'whatsapp'
  olusturulma TIMESTAMP DEFAULT NOW(),
  son_aktif TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stok_uyarilari (
  id SERIAL PRIMARY KEY,
  urun_id INTEGER NOT NULL REFERENCES urunler(id),
  esik INTEGER NOT NULL,
  mevcut_stok INTEGER NOT NULL,
  oneri TEXT,
  durum VARCHAR(20) DEFAULT 'acik', -- 'acik' | 'kapatildi'
  tetiklenme TIMESTAMP DEFAULT NOW(),
  kapatilma TIMESTAMP
);

CREATE TABLE briefing_gecmisi (
  id SERIAL PRIMARY KEY,
  tarih DATE UNIQUE NOT NULL,
  icerik JSONB NOT NULL,
  gonderildi BOOLEAN DEFAULT FALSE,
  olusturulma TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analitik_ozet (
  id SERIAL PRIMARY KEY,
  baslangic_tarihi DATE,
  bitis_tarihi DATE,
  tip VARCHAR(20), -- 'gunluk' | 'haftalik' | 'aylik'
  veriler JSONB NOT NULL,
  olusturulma TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Klasör Yapısı (Güncellenmiş)

```
localshop/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   ├── product/
│       │   └── agent/         # ChatWidget, BriefingCard, StockAlertBadge
│       ├── pages/
│       │   ├── public/
│       │   └── admin/
│       │       └── Analytics/ # Yeni analitik sayfası
│       ├── hooks/
│       ├── services/
│       │   ├── agentService.js
│       │   ├── cargoService.js
│       │   └── analyticsService.js
│       └── context/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   ├── cargo.py         # Yeni
│   │   │   ├── conversation.py  # Yeni
│   │   │   ├── stock_alert.py   # Yeni
│   │   │   └── briefing.py      # Yeni
│   │   ├── schemas/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── orders.py
│   │   │   ├── categories.py
│   │   │   ├── ai.py
│   │   │   ├── agent.py         # Yeni — CustomerAgent
│   │   │   ├── cargo.py         # Yeni — CargoAgent
│   │   │   ├── stock.py         # Yeni — StockAgent
│   │   │   ├── workflow.py      # Yeni — WorkflowAgent
│   │   │   ├── analytics.py     # Yeni — AnalyticsAgent
│   │   │   └── webhooks.py      # Yeni — WhatsApp webhook
│   │   ├── agents/              # Yeni agent katmanı
│   │   │   ├── core.py          # Gemini orchestrator
│   │   │   ├── customer_agent.py
│   │   │   ├── cargo_agent.py
│   │   │   ├── stock_agent.py
│   │   │   ├── workflow_agent.py
│   │   │   └── analytics_agent.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── cargo_service.py    # Yeni — kargo API wrapper
│   │   │   ├── email_service.py    # Yeni — SendGrid wrapper
│   │   │   └── notification_service.py  # Yeni
│   │   ├── scheduler/              # Yeni
│   │   │   ├── __init__.py
│   │   │   ├── tasks.py            # APScheduler görev tanımları
│   │   │   └── jobs/
│   │   │       ├── briefing_job.py
│   │   │       ├── cargo_check_job.py
│   │   │       └── stock_check_job.py
│   │   └── core/
│   │       ├── config.py
│   │       ├── security.py
│   │       ├── database.py
│   │       └── redis.py            # Yeni
│   ├── alembic/
│   ├── .env.example
│   └── requirements.txt
│
├── README.md
├── MVP.md
├── PRD.md
└── PLAN.md
```

---

## 10. Ortam Değişkenleri (Güncellenmiş)

```bash
# backend/.env.example

# Veritabanı
DATABASE_URL=postgresql://localshop_user:sifre@localhost:5432/localshop
REDIS_URL=redis://localhost:6379/0

# Auth
SECRET_KEY=en-az-32-karakter-gizli-anahtar
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI
OPENAI_API_KEY=openai-api-anahtariniz
OPENAI_MODEL=gpt-4o-mini

# Kargo
YURTICI_API_KEY=yurtici-api-anahtari
YURTICI_API_URL=https://api.yurticikargo.com
PTT_API_KEY=ptt-api-anahtari

# Bildirim
SENDGRID_API_KEY=sendgrid-api-anahtariniz
ADMIN_EMAIL=admin@localshop.com
FROM_EMAIL=noreply@localshop.com

# WhatsApp
WHATSAPP_TOKEN=meta-whatsapp-token
WHATSAPP_VERIFY_TOKEN=webhook-dogrulama-tokeni
WHATSAPP_PHONE_ID=whatsapp-telefon-id

# App
CORS_ORIGINS=["http://localhost:3000","https://localshop.com"]
BRIEFING_CRON_HOUR=8
CARGO_CHECK_INTERVAL_HOURS=2
```

---

## 11. Değerlendirme Kriterleri Karşılama

| Değerlendirme Kriteri | LocalShop Karşılığı |
|---|---|
| AI ajanları tasarımı | 5 agent (Customer, Cargo, Stock, Workflow, Analytics) |
| Doğal dil işleme | CustomerAgent — OpenAI ile niyet sınıflandırma |
| Veri ile etkileşim (RAG) | Agent'lar DB + geçmiş veriyi bağlam olarak OpenAI'ye iletir |
| Harici sistem entegrasyonu | Kargo API + SendGrid + WhatsApp API |
| Aksiyon alabilen sistemler | Otomatik bildirim, yenileme önerisi, briefing gönderimi |
| İnsan müdahalesini azaltma | Kargo + stok + briefing tamamen otomatik |
| Kullanıcı deneyimi | Chat widget, dashboard briefing, anlık uyarılar |

---

*LocalShop PRD v2.0 — 2026–2027*
