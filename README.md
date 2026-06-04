# 🛍️ LocalShop — AI-Agent Destekli KOBİ Otomasyon Platformu

> Küçük ve yerel işletmelerin komisyonsuz dijital vitrini, yapay zeka destekli operasyon otomasyonu.

---

## 📋 Proje Özeti

**LocalShop**, Türkiye'deki küçük ve yerel işletmelerin (butik, pastane, kooperatif, atölye vb.) pazar yeri komisyonu ödemeden kendi dijital vitrinlerini kurabilecekleri, siparişlerini yönetebilecekleri ve **5 farklı AI Agent** ile günlük operasyonel yüklerini otomatikleştirebilecekleri bir web platformudur.

### Çözülen Problem

Küçük işletmeler iki katmanlı bir sorunla karşı karşıyadır:
1. **Dijital Kanal Eksikliği** — WhatsApp / telefon sipariş kaosundan kurtulup düzgün bir e-ticaret kanalı kuramamak.
2. **Operasyonel Yük** — Sipariş sorularını yanıtlamak (günde 2-3 saat), stok tükenmesini geç fark etmek, kargo gecikmelerinden müşteriden önce haberdar olamamak.

### Hedef Kullanıcılar

| Segment | Tanım |
|---------|-------|
| Küçük e-ticaret | 20–200 ürün, günde 10–100 sipariş |
| Butik / bölgesel satıcı | Fiziksel + online karma yapı |
| Üretici kooperatifleri | Tarım, gıda, el sanatları |
| Tek mağaza işletmesi | Kafe, pastane, market |

---

## ✨ Temel Özellikler

### Katman 1 — E-Ticaret Altyapısı
- 🛒 Ürün vitrini, kategori filtreleme ve tam metin arama
- 🧺 Sepet yönetimi ve sipariş oluşturma (stok kontrolü + otomatik düşüm)
- 👤 JWT tabanlı kimlik doğrulama (access + refresh token) ve rol yönetimi (admin / müşteri)
- 📦 Sipariş durum akışı (`bekliyor → hazirlaniyor → kargolandi → teslim_edildi / iptal`)
- ⭐ Favoriler, ürün yorumları ve puanlama
- 🏷️ Kupon / indirim kodu sistemi
- 🔄 İade yönetimi
- 📊 Admin finans paneli ve istatistikler
- 🖼️ Yerel görsel yükleme (File Upload) ile ürün resim yönetimi

### Katman 2 — AI Agent Otomasyon Sistemi

| Agent | Görev | Tetiklenme |
|-------|-------|-----------|
| **CustomerAgent** | Müşteri chatbot'u — ürün sorgulama, stok kontrolü, sipariş bilgisi | Kullanıcı mesajı (Gerçek zamanlı) |
| **StockAgent** | Stok eşik kontrolü, AI destekli yenileme önerisi | APScheduler (Her saat) |
| **CargoAgent** | Kargo durum kontrolü, gecikme tespiti, otomatik bildirim | APScheduler (Her 2 saat) |
| **WorkflowAgent** | Günlük sabah brifing'i hazırlama ve e-posta gönderimi | APScheduler (Her gün 08:00) |
| **AnalyticsAgent** | Satış trendi, ciro ve iade oranı analizi | APScheduler (Her gece 23:50) |

---

## 🏗️ Mimari

```
Browser / WhatsApp
      │
      ▼
   Nginx (Reverse Proxy — :8090)
      ├── /              → React SPA (Frontend Container)
      └── /api           → FastAPI (Backend Container — :8000)
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
         Agent Layer      PostgreSQL           Redis
        (OpenAI Core)    (Container)        (Container)
              │
    ┌─────────┼─────────┬──────────┐
    │         │         │          │
Customer  Cargo     Stock    Workflow   Analytics
 Agent    Agent     Agent     Agent      Agent
    │         │         │          │          │
OpenAI   Kargo API  APScheduler  SendGrid  Pre-aggregation
 API                                        (DB)
```

---

## 🗂️ Klasör Yapısı

```
LocalShop/
├── frontend/                    # React 19 + TailwindCSS 4 + Vite 8
│   ├── src/
│   │   ├── components/          # Navbar, Footer, ChatbotWidget, ProductCard, AuthRoutes
│   │   ├── contexts/            # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── admin/           # AdminHome, ProductsAdmin, OrdersAdmin, CategoriesAdmin,
│   │   │   │                    # FinanceAdmin, ReturnsAdmin, Dashboard
│   │   │   ├── auth/            # Login, Register
│   │   │   └── shop/            # Home, Products, ProductDetail, Cart, Profile,
│   │   │                        # Favorites, About, FAQ, Contact, KVKK
│   │   ├── services/            # api.js (Axios instance + interceptors)
│   │   └── utils/               # Yardımcı fonksiyonlar
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # Python 3.12 + FastAPI + SQLAlchemy 2
│   ├── app/
│   │   ├── agents/              # BaseAgent, CustomerAgent, StockAgent,
│   │   │                        # CargoAgent, WorkflowAgent, AnalyticsAgent
│   │   ├── core/                # config, database, redis, security, scheduler
│   │   ├── models/              # User, Urun, Kategori, Siparis, SiparisKalemi,
│   │   │                        # KargoTakip, AgentKonusma, StokUyarisi,
│   │   │                        # BriefingGecmisi, AnalitikOzet, Iade, Yorum,
│   │   │                        # Favori, Kupon
│   │   ├── routers/             # auth, products, categories, orders, ai, returns,
│   │   │                        # reviews, favorites, coupons
│   │   ├── schemas/             # Pydantic request/response modelleri
│   │   └── services/            # openai_service, cargo_provider, notification_provider
│   ├── alembic/                 # Veritabanı migration dosyaları
│   ├── static/uploads/          # Yüklenen ürün görselleri (bind mount ile kalıcı)
│   ├── seed_data.py             # Test verileri yükleyici
│   ├── Dockerfile
│   └── requirements.txt
│
├── nginx/                       # Nginx reverse proxy konfigürasyonu
│   └── default.conf
│
├── prodocs/                     # AI ajanları için geliştirme referans dosyaları
│   └── ai-agents-guide.md
│
├── docker-compose.yml           # 5 servis: db, redis, backend, frontend, proxy
├── .env.example                 # Örnek ortam değişkenleri şablonu
├── .gitignore
├── README.md                    # ← Bu dosya
├── PRD.md                       # Product Requirements Document
├── PLAN.md                      # Teknik geliştirme planı
├── tech-stack.md                # Teknoloji seçimleri ve AI kullanımı
├── DesignSystem.md              # Renk paleti, tipografi, component kuralları
└── Progress.md                  # Geliştirme günlüğü (karar, hata, çözüm)
```

---

## 🚀 Kurulum ve Deploy (Docker)

### Ön Gereksinimler
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) veya Docker Engine + Docker Compose (Linux)
- Git

### 1. Repoyu Klonla
```bash
git clone https://github.com/kullanici/LocalShop.git
cd LocalShop
```

### 2. Ortam Değişkenlerini Ayarla
```bash
cp .env.example .env
# .env dosyasını açıp API anahtarlarını doldurun
```

> **Zorunlu:** `OPENAI_API_KEY` — AI Agent'ların çalışması için gereklidir.
> Diğer değişkenler opsiyoneldir ve varsayılan değerlerle çalışır.

### 3. Docker ile Başlat
```bash
docker compose up --build -d
```

Bu komut 5 container başlatır:
| Container | Port | Açıklama |
|-----------|------|----------|
| `localshop_db` | 5432 (internal) | PostgreSQL 17 veritabanı |
| `localshop_redis` | 6379 (internal) | Redis 7 (cache, session) |
| `localshop_backend` | 8000 | FastAPI backend |
| `localshop_frontend` | 80 (internal) | React SPA (Nginx serve) |
| `localshop_proxy` | **8090** | Nginx reverse proxy |

### 4. Veritabanı Migration
```bash
docker exec -it localshop_backend alembic upgrade head
```

### 5. (Opsiyonel) Test Verileri Yükle
```bash
docker exec -it localshop_backend python seed_data.py
```

### 6. Uygulamaya Eriş
- **Mağaza:** http://localhost:8090
- **Admin Paneli:** http://localhost:8090/admin
- **API Docs (Swagger):** http://localhost:8090/api/docs

---

## 🔑 Varsayılan Hesaplar (seed_data ile)

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@localshop.com | admin123 |
| Müşteri | musteri@test.com | test123 |

---

## 📡 API Endpoint Özeti

```
# Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

# Ürünler
GET    /api/v1/urunler?kategori_id=&q=&min_fiyat=&max_fiyat=&siralama=&sayfa=
GET    /api/v1/urunler/:id
POST   /api/v1/urunler              [admin]
PUT    /api/v1/urunler/:id          [admin]
DELETE /api/v1/urunler/:id          [admin]
POST   /api/v1/urunler/upload-gorsel [admin]  — Yerel görsel yükleme

# Kategoriler
GET/POST/PUT/DELETE  /api/v1/kategoriler

# Siparişler
GET    /api/v1/siparisler           [admin]
GET    /api/v1/siparisler/benim     [müşteri]
POST   /api/v1/siparisler           [müşteri]
PATCH  /api/v1/siparisler/:id/durum [admin]

# AI
POST   /api/v1/ai/aciklama-olustur  [admin]   — AI ürün açıklaması
POST   /api/v1/ai/chat                        — Chatbot

# Favoriler, Yorumlar, Kuponlar, İadeler
GET/POST/DELETE  /api/v1/favoriler
GET/POST         /api/v1/yorumlar
GET/POST         /api/v1/kuponlar
GET/POST/PATCH   /api/v1/iadeler

# Sistem
GET    /api/healthcheck
```

---

## 🤖 AI Agent Mimarisi

Tüm agent'lar `BaseAgent` sınıfından türer. Her agent kendi **sistem prompt'u** ile OpenAI API'ye bağlanır, veritabanı erişimine sahiptir ve otonom şekilde çalışır.

```
BaseAgent (Abstract)
  ├── db: Session          — SQLAlchemy veritabanı erişimi
  ├── llm: OpenAIService   — OpenAI gpt-4o-mini erişimi
  ├── execute()            — Ana giriş noktası (abstract)
  └── log_action/error()   — Standart loglama

CustomerAgent  → Müşteri sohbet + RAG (ürün kataloğu bağlamı)
StockAgent     → Stok eşik kontrolü + AI tedarik önerisi
CargoAgent     → Kargo API + gecikme tespiti + bildirim
WorkflowAgent  → Günlük brifing + e-posta
AnalyticsAgent → Satış metrikleri pre-aggregation
```

---

## 📄 Lisans

MIT Lisansı

*LocalShop — 2026–2027*
