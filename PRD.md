# 📋 LocalShop — PRD (Product Requirements Document)

> **Sürüm:** 1.0  
> **Proje:**  LocalShop
> **Yıl:** 2026  

---

## 1. Ürün Özeti

**LocalShop**, Türkiye'deki küçük ve yerel işletmelerin (kafe, butik, market, pastane vb.) komisyon ödemeden kendi dijital vitrinlerini kurmalarını ve sipariş almalarını sağlayan bir web uygulamasıdır.

### Problem

Küçük esnaf dijital satış kanalı kuramıyor. Sipariş WhatsApp'tan alınıyor, stok telefonda soruluyor. Büyük e-ticaret platformları yüksek komisyon alıyor ve küçük işletmeler için gereksiz yere karmaşık.

### Çözüm

Her işletme için kurulum gerektirmeyen, komisyonsuz, sade bir mini e-ticaret mağazası. Gemini AI desteğiyle işletme sahibi teknik bilgiye ihtiyaç duymadan profesyonel içerik üretebilir.

### Hedef Kullanıcılar

| Kullanıcı | Açıklama |
|---|---|
| **Admin** | İşletme sahibi. Ürün ve sipariş yönetimi yapar. |
| **Müşteri** | Son kullanıcı. Vitrine bakar, sipariş verir. |

---

## 2. Hedefler & Başarı Metrikleri

| Hedef | Metrik |
|---|---|
| Temel özellikler çalışıyor olmalı | 3 temel özellik uçtan uca test edilebilir |
| Özgün AI özelliği implement edilmeli | Gemini API entegrasyonu çalışıyor |
| Production deploy tamamlanmalı | HTTPS ile erişilebilir VPS |
| Kod kalitesi akademik & ticari standarda uygun | Modüler yapı, hata yönetimi, güvenlik |
| Sunum savunulabilir olmalı | Her mimari karar açıklanabilir |

---

## 3. Kullanıcı Hikayeleri (User Stories)

### Müşteri

```
US-01  Bir müşteri olarak, ürünleri kategorilere göre filtreleyebilmek istiyorum;
       böylece aradığımı hızlıca bulabilirim.

US-02  Bir müşteri olarak, ürün adına göre arama yapabilmek istiyorum.

US-03  Bir müşteri olarak, ürün detay sayfasını görebilmek istiyorum;
       böylece fiyat, stok ve açıklamayı öğrenebilirim.

US-04  Bir müşteri olarak, sepetime ürün ekleyip miktarı güncelleyebilmek istiyorum.

US-05  Bir müşteri olarak, teslimat adresimi ve notumu girerek sipariş verebilmek istiyorum.

US-06  Bir müşteri olarak, geçmiş siparişlerimi ve durumlarını görebilmek istiyorum.

US-07  Bir müşteri olarak, e-posta ve şifreyle kayıt olup giriş yapabilmek istiyorum.
```

### Admin (İşletme Sahibi)

```
US-08  Bir admin olarak, yeni ürün ekleyebilmek istiyorum;
       ad, fiyat, stok, kategori ve görsel URL girebilmeliyim.

US-09  Bir admin olarak, ürün açıklamasını AI yardımıyla oluşturabilmek istiyorum;
       böylece pazarlama metni yazmak için zaman harcamam.

US-10  Bir admin olarak, mevcut ürünleri düzenleyip silebilmek istiyorum.

US-11  Bir admin olarak, gelen siparişleri listeleyip detaylarını görebilmek istiyorum.

US-12  Bir admin olarak, sipariş durumunu güncelleyebilmek istiyorum
       (bekliyor → hazırlanıyor → teslim edildi / iptal).

US-13  Bir admin olarak, kategorileri yönetebilmek istiyorum (ekle / sil / düzenle).
```

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Kimlik Doğrulama & Yetkilendirme

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-01 | Kullanıcı e-posta + şifre ile kayıt olabilmeli | Zorunlu |
| F-02 | Kullanıcı e-posta + şifre ile giriş yapabilmeli | Zorunlu |
| F-03 | Giriş başarılı olduğunda JWT access token döndürülmeli | Zorunlu |
| F-04 | Refresh token ile access token yenilenebilmeli | Zorunlu |
| F-05 | Admin rotaları sadece `rol=admin` kullanıcıya açık olmalı | Zorunlu |
| F-06 | Şifre bcrypt ile hash'lenerek saklanmalı | Zorunlu |

### 4.2 Ürün Yönetimi

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-07 | Admin ürün ekleyebilmeli (ad, açıklama, fiyat, stok, kategori_id, resim_url) | Zorunlu |
| F-08 | Admin ürün güncelleyebilmeli | Zorunlu |
| F-09 | Admin ürünü soft-delete yapabilmeli (`aktif=false`) | Zorunlu |
| F-10 | Admin stok miktarını güncelleyebilmeli | Zorunlu |
| F-11 | Müşteri sadece `aktif=true` ürünleri görebilmeli | Zorunlu |
| F-12 | Ürünler kategori bazlı filtrelenebilmeli | Zorunlu |
| F-13 | Ürünler ada göre aranabilmeli (ILIKE sorgusu) | Zorunlu |

### 4.3 Sipariş Akışı

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-14 | Müşteri oturum açmadan sepete ürün ekleyebilmeli (localStorage) | Orta |
| F-15 | Sipariş oluşturmak için oturum açılmış olmalı | Zorunlu |
| F-16 | Sipariş oluşturulurken stok kontrolü yapılmalı | Zorunlu |
| F-17 | Sipariş oluşturulduğunda stok otomatik düşülmeli | Zorunlu |
| F-18 | Sipariş durumu 4 adımda takip edilebilmeli | Zorunlu |
| F-19 | Admin tüm siparişleri görebilmeli, müşteri sadece kendininkini | Zorunlu |

### 4.4 Gemini AI Entegrasyonu

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-20 | Admin ürün adı + fiyat girince AI açıklama önerisi alabilmeli | Zorunlu |
| F-21 | AI isteği backend üzerinden yapılmalı (API key frontend'e çıkmaz) | Zorunlu |
| F-22 | AI yanıtı düzenlenebilir textarea'ya aktarılmalı | Zorunlu |
| F-23 | AI servisi başarısız olursa kullanıcıya anlamlı hata mesajı gösterilmeli | Zorunlu |

---

## 5. Fonksiyonel Olmayan Gereksinimler

### 5.1 Güvenlik

- Tüm şifreler bcrypt (`rounds=12`) ile hash'lenir
- JWT token süresi: access = 30 dakika, refresh = 7 gün
- SQL injection koruması: SQLAlchemy ORM (parameterized queries)
- CORS: sadece tanımlı origin'lerden istek kabul edilir
- PostgreSQL: dışarıya kapalı, sadece `localhost` erişimi
- `.env` dosyası git'e eklenmez (`.gitignore`)
- Gemini API anahtarı yalnızca `backend/.env` dosyasında

### 5.2 Performans

- Ürün listeleme endpoint'i sayfalama (pagination) destekler
- Veritabanı sorgularında uygun index'ler tanımlı

### 5.3 Erişilebilirlik & UX

- Arayüz tüm modern tarayıcılarda çalışmalı
- Mobil uyumlu (responsive) tasarım
- Anlamlı hata mesajları (form doğrulama hataları kullanıcıya gösterilir)
- Yükleme durumları (loading state) gösterilir

### 5.4 Deploy

- Uygulama VPS (Ubuntu 24.04) üzerinde çalışır
- HTTPS zorunlu (Let's Encrypt SSL)
- FastAPI: Uvicorn + Systemd (otomatik başlama)
- React build dosyaları Nginx tarafından statik olarak serve edilir

---

## 6. Sistem Mimarisi

```
Browser
  │
  ▼
Nginx (port 80/443)
  ├── /          →  React (static files — /var/www/localshop/frontend)
  └── /api       →  FastAPI (localhost:8000)
                        │
                        ├── SQLAlchemy ORM
                        │       └── PostgreSQL (localhost:5432)
                        │
                        └── Gemini API (external — HTTPS)
```

---

## 7. API Endpoint Listesi

### Auth
```
POST   /api/auth/register          Yeni kullanıcı kayıt
POST   /api/auth/login             Giriş → access + refresh token
POST   /api/auth/refresh           Token yenile
POST   /api/auth/logout            Çıkış (refresh token geçersizleştir)
```

### Ürünler
```
GET    /api/urunler                Ürün listesi (filtre: kategori, arama, sayfa)
GET    /api/urunler/:id            Ürün detay
POST   /api/urunler                Ürün ekle          [admin]
PUT    /api/urunler/:id            Ürün güncelle      [admin]
DELETE /api/urunler/:id            Ürün sil           [admin]
```

### Kategoriler
```
GET    /api/kategoriler            Tüm kategoriler
POST   /api/kategoriler            Kategori ekle      [admin]
PUT    /api/kategoriler/:id        Kategori güncelle  [admin]
DELETE /api/kategoriler/:id        Kategori sil       [admin]
```

### Siparişler
```
GET    /api/siparisler             Tüm siparişler     [admin]
GET    /api/siparisler/benim       Kendi siparişlerim [musteri]
GET    /api/siparisler/:id         Sipariş detay      [admin | sipariş sahibi]
POST   /api/siparisler             Sipariş oluştur    [musteri]
PATCH  /api/siparisler/:id/durum   Durum güncelle     [admin]
```

### AI
```
POST   /api/ai/aciklama-olustur    Ürün açıklaması üret (Gemini) [admin]
```

---

## 8. Veritabanı Şeması

```sql
-- Kullanıcılar
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(10) NOT NULL DEFAULT 'musteri',  -- 'admin' | 'musteri'
    isim          VARCHAR(100) NOT NULL,
    telefon       VARCHAR(20),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Kategoriler
CREATE TABLE kategoriler (
    id         SERIAL PRIMARY KEY,
    isim       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ürünler
CREATE TABLE urunler (
    id          SERIAL PRIMARY KEY,
    isim        VARCHAR(255) NOT NULL,
    aciklama    TEXT,
    fiyat       NUMERIC(10, 2) NOT NULL,
    stok        INTEGER NOT NULL DEFAULT 0,
    kategori_id INTEGER REFERENCES kategoriler(id),
    resim_url   VARCHAR(500),
    aktif       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Siparişler
CREATE TABLE siparisler (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    toplam_tutar  NUMERIC(10, 2) NOT NULL,
    durum         VARCHAR(20) NOT NULL DEFAULT 'bekliyor',
    adres         TEXT NOT NULL,
    not           TEXT,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Sipariş Kalemleri
CREATE TABLE siparis_kalemleri (
    id          SERIAL PRIMARY KEY,
    siparis_id  INTEGER NOT NULL REFERENCES siparisler(id),
    urun_id     INTEGER NOT NULL REFERENCES urunler(id),
    adet        INTEGER NOT NULL,
    birim_fiyat NUMERIC(10, 2) NOT NULL
);
```

---

## 9. Klasör Yapısı

```
localshop/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/          # Tekrar kullanılabilir bileşenler
│       │   ├── ui/              # Button, Input, Card vb.
│       │   ├── layout/          # Navbar, Footer, AdminLayout
│       │   └── product/         # ProductCard, ProductList vb.
│       ├── pages/
│       │   ├── public/          # Home, Products, ProductDetail, Cart, Order
│       │   └── admin/           # Dashboard, Products, Orders, Categories
│       ├── hooks/               # useCart, useAuth, useProducts
│       ├── services/            # api.js, authService.js, productService.js
│       ├── context/             # AuthContext, CartContext
│       └── utils/               # formatPrice, validators vb.
│
├── backend/
│   ├── app/
│   │   ├── models/              # user.py, product.py, order.py, category.py
│   │   ├── schemas/             # Pydantic request & response şemaları
│   │   ├── routers/             # auth.py, products.py, orders.py, ai.py
│   │   ├── services/            # auth_service.py, ai_service.py
│   │   ├── core/                # config.py, security.py, database.py
│   │   └── main.py              # FastAPI app başlangıcı, CORS, router kayıtları
│   ├── alembic/
│   │   ├── versions/            # Migration dosyaları
│   │   └── env.py
│   ├── .env                     # Ortam değişkenleri (git'e eklenmez)
│   ├── .env.example             # Örnek env (git'e eklenir)
│   └── requirements.txt
│
├── README.md
├── MVP.md                       # Bu dosya
└── PRD.md                       # Bu dosya
```

---

## 10. Ortam Değişkenleri

```bash
# backend/.env.example

DATABASE_URL=postgresql://kullanici:sifre@localhost:5432/localshop
SECRET_KEY=cok-gizli-jwt-anahtari-buraya
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

GEMINI_API_KEY=buraya-gemini-api-anahtarini-gir

CORS_ORIGINS=["http://localhost:3000", "https://localshop.com"]
```

---

## 11. Geliştirme Aşamaları

| Aşama | İçerik | Durum |
|---|---|---|
| **1 — Sunucu Kurulumu** | Ubuntu, PostgreSQL, Python, Nginx, Node.js | ⬜ Bekliyor |
| **2 — Backend İskeleti** | FastAPI + SQLAlchemy + Alembic, ilk migration, GET /api/urunler | ⬜ Bekliyor |
| **3 — Authentication** | JWT login/register, roller, korumalı endpoint'ler | ⬜ Bekliyor |
| **4 — Tüm API Endpoint'leri** | Ürün CRUD, Kategori CRUD, Sipariş, AI endpoint | ⬜ Bekliyor |
| **5 — Frontend** | React + TailwindCSS, vitrin sayfaları, admin paneli, API bağlantısı | ⬜ Bekliyor |
| **6 — Deploy** | React build, Nginx config, Systemd, SSL (Let's Encrypt) | ⬜ Bekliyor |
| **7 — Dokümantasyon** | README, yansıtma raporu, video demo | ⬜ Bekliyor |

---

## 12. Kapsam Dışı (v2 Planı)

| Özellik | Hedef Sürüm |
|---|---|
| Ödeme sistemi (iyzico / Stripe) | v2 |
| E-posta bildirimleri (sipariş onayı) | v2 |
| Çok-tenant mimari (birden fazla işletme) | v2 |
| Ürün yorumları & puanlama | v2 |
| Gelişmiş dashboard (Chart.js grafikleri) | v2 |
| Kargo takip entegrasyonu | v2 |
| Mobil uygulama (React Native) | v3 |

---

## 13. Teknik Borç & Notlar

- Ürün görselleri MVP'de URL ile eklenir; v2'de dosya yükleme (S3/Cloudflare R2) eklenecek
- Sepet MVP'de `localStorage`'da tutulur; v2'de backend'e taşınacak (oturum sürekliliği)
- Rate limiting MVP'de yok; v2'de `slowapi` ile eklenecek
- Unit test MVP'de yok; v2'de `pytest` ile kritik servisler test edilecek

---

*LocalShop PRD v1.0 — 2026*
