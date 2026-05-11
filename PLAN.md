---
name: LocalShop plan
overview: >
  Küçük ve yerel işletmeler için AI-agent destekli dijital vitrin & operasyon otomasyon platformu.
  React + FastAPI + PostgreSQL + Gemini API tabanlı full-stack uygulama.
  Hackathon kapsamında CustomerAgent (WhatsApp/chat), CargoAgent (kargo takip),
  StockAgent (stok uyarı), WorkflowAgent (sabah briefing) ve AnalyticsAgent ekleniyor.
  Hostinger VPS (Ubuntu 24.04) üzerinde Nginx + Systemd + APScheduler + Redis ile
  production deploy hedeflenmektedir.
todos:
  - id: confirm-stack
    content: React + FastAPI + PostgreSQL + Redis + Gemini API mimarisini onayla
    status: completed
  - id: write-docs
    content: MVP v2, PRD v2 ve PLAN v2 belgelerini oluştur; hackathon kapsamı entegre edildi
    status: completed
  - id: server-setup
    content: >
      VPS kurulumu: Ubuntu 24.04, PostgreSQL, Redis, Python 3.11, Nginx, Node.js 20,
      UFW, PostgreSQL ve Redis kullanıcısı/veritabanı oluşturma
    status: pending
  - id: backend-scaffold
    content: >
      FastAPI + SQLAlchemy + Alembic + APScheduler iskelet:
      tüm modeller (mevcut + 5 yeni tablo), migration, healthcheck,
      Redis bağlantısı, Swagger doğrulama
    status: pending
  - id: build-auth
    content: JWT kayıt/giriş/yenileme, admin/musteri rolleri, korumalı endpoint'ler
    status: pending
  - id: build-core-api
    content: >
      Temel e-ticaret API: kategori CRUD, ürün CRUD (filtre+arama+sayfalama+stok_esigi),
      sipariş oluşturma (stok kontrolü + kargo_no alanı), sipariş yönetimi,
      Gemini AI açıklama endpoint'i
    status: pending
  - id: build-customer-agent
    content: >
      CustomerAgent: POST /api/agent/chat, Gemini niyet sınıflandırma
      (sipariş_sorgu / stok_sorgu / genel), konuşma hafızası (Redis),
      agent_konusmalar tablosu, yanıt süresi ≤3sn
    status: pending
  - id: build-cargo-agent
    content: >
      CargoAgent: Yurtiçi Kargo API entegrasyonu, kargo_takip tablosu,
      APScheduler her 2 saatte kargo durum kontrolü, gecikme tespiti,
      müşteriye + admin'e otomatik e-posta (SendGrid)
    status: pending
  - id: build-stock-agent
    content: >
      StockAgent: sipariş oluşturulunca eşik kontrolü, stok_uyarilari tablosu,
      admin e-posta + dashboard uyarısı, Gemini yenileme miktarı önerisi,
      GET /api/stock/alerts endpoint'i
    status: pending
  - id: build-workflow-agent
    content: >
      WorkflowAgent: APScheduler sabah 08:00 briefing cron,
      günlük sipariş + paket + stok özeti, SendGrid e-posta gönderimi,
      briefing_gecmisi tablosu, GET /api/workflow/briefing/today endpoint'i
    status: pending
  - id: build-analytics-agent
    content: >
      AnalyticsAgent (opsiyonel): 30 günlük satış trend analizi,
      Gemini ile stok tahmini, GET /api/analytics/insights endpoint'i,
      analitik_ozet tablosu
    status: pending
  - id: build-whatsapp-webhook
    content: >
      WhatsApp Business API webhook: Meta doğrulama, gelen mesaj parse,
      CustomerAgent'a yönlendirme, yanıt gönderimi
    status: pending
  - id: build-frontend-shell
    content: >
      React + TailwindCSS uygulama kabuğu: React Router, AuthContext, CartContext,
      agentService/cargoService/analyticsService, Navbar, Footer
    status: pending
  - id: build-customer-ui
    content: >
      Müşteri arayüzü: vitrin, ürün listesi, ürün detay, sepet, sipariş,
      profil/sipariş geçmişi, ChatWidget bileşeni (CustomerAgent)
    status: pending
  - id: build-admin-ui
    content: >
      Admin paneli: dashboard (briefing widget + stok uyarı badge + analitik),
      ürün listesi/ekle/düzenle (AI butonu), sipariş listesi/detay,
      kargo takip görünümü, stok uyarıları sayfası, analitik sekmesi
    status: pending
  - id: api-integration
    content: >
      Frontend-backend bağlantısı: axios interceptor (token + refresh),
      tüm servis fonksiyonları, loading/error state, agent chat entegrasyonu
    status: pending
  - id: deploy
    content: >
      Production deploy: React build, Nginx config, FastAPI+APScheduler Systemd servisi,
      Redis servisi, Let's Encrypt SSL, env değişkenleri, smoke test
    status: pending
  - id: write-readme
    content: >
      README.md: proje amacı, hackathon kapsamı, kurulum talimatları, agent mimarisi,
      klasör yapısı, ortam değişkenleri, teknoloji listesi
    status: pending
  - id: reflection-report
    content: >
      Yansıtma raporu: AI kullanılan aşamalar, işe yarayan promptlar,
      değiştirilen kodlar, özgün katkılar, hackathon uyumu
    status: pending
  - id: video-demo
    content: 8–10 dakikalık YouTube video demo — agent senaryoları dahil
    status: pending
isProject: true
---

# LocalShop — Geliştirme Planı v2.0

## Proje Özeti

**LocalShop**, Türkiye'deki küçük işletmelerin komisyon ödemeden kendi dijital vitrinlerini kurabilecekleri, **AI destekli otomasyon ile** sipariş/stok/kargo süreçlerini otomatikleştirebildikleri bir platform.

### Hackathon Boyutu
KOBİ operasyon otomasyonu hackathonuna katılım kapsamında proje genişletildi:
- **Müşteri iletişimi otomasyonu** → CustomerAgent
- **Kargo süreç yönetimi** → CargoAgent
- **Stok & envanter yönetimi** → StockAgent
- **İş akışı otomasyonu** → WorkflowAgent (sabah briefing)
- **Analitik & içgörü** → AnalyticsAgent (opsiyonel)

## Varsayımlar

- İlk sürüm tek işletme (tek-tenant); çok-tenant v2'ye bırakıldı.
- Gemini API gemini-2.0-flash modeli — ücretsiz tier yeterli.
- Kargo entegrasyonu Yurtiçi Kargo öncelikli; PTT/Aras eklenti.
- WhatsApp webhook MVP'de altyapısı kurulur, tam entegrasyon v1.1.
- E-posta bildirimleri SendGrid üzerinden.
- APScheduler FastAPI içinde çalışır; ayrı Celery worker gerektirmez.

## Kullanıcı Rolleri

| Rol | Açıklama |
|---|---|
| `admin` | İşletme sahibi. Tüm yönetim + AI agent araçları. |
| `musteri` | Son kullanıcı. Vitrin, sepet, sipariş, chat agent. |
| `scheduler` | APScheduler otomatik görevler (sistem içi). |

## Agent Mimarisi

```
Gemini Agent Core (Orchestrator)
│
├── CustomerAgent
│   ├── Niyet: sipariş_sorgu → siparisler tablosu + kargo_takip
│   ├── Niyet: stok_sorgu → urunler tablosu
│   └── Niyet: genel → Gemini serbest yanıt
│
├── CargoAgent
│   ├── APScheduler her 2 saatte: tüm aktif siparişleri kontrol
│   ├── Gecikme var → müşteri e-posta (SendGrid)
│   └── Gecikme var → admin özet rapor
│
├── StockAgent
│   ├── Tetikleyici: sipariş oluşturma (synchronous)
│   ├── stok < stok_esigi → stok_uyarilari kayıt
│   ├── → Admin e-posta + dashboard
│   └── Gemini: geçmiş satış → yenileme önerisi
│
├── WorkflowAgent
│   ├── APScheduler her gün 08:00
│   ├── Bugünkü siparişler + hazır paketler + kritik stoklar
│   ├── → Admin e-posta briefing
│   └── → briefing_gecmisi kayıt
│
└── AnalyticsAgent (opsiyonel)
    ├── Son 30 gün satış verisi analizi
    ├── Gemini: önümüzdeki hafta tahmin
    └── → analitik_ozet kayıt
```

## Teknik Stack

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Frontend | React 18 + TailwindCSS | Bileşen tabanlı, hızlı geliştirme |
| Backend | Python 3.11 + FastAPI | Async, Swagger, Python bilgisi |
| Veritabanı | PostgreSQL 15 | İlişkisel veri + transaction |
| Önbellek/Kuyruk | Redis | Agent session cache, bildirim kuyruğu |
| ORM | SQLAlchemy 2.x + Alembic | Güvenli ORM + migration |
| Auth | JWT + bcrypt | Stateless, rol bazlı |
| AI Orchestrator | Google Gemini API (flash 2.0) | Tüm agent beyni |
| Zamanlayıcı | APScheduler | Cron görevleri |
| Kargo | Yurtiçi API + PTT | Kargo takibi |
| E-posta | SendGrid | Otomatik bildirimler |
| WhatsApp | Meta Business API | Müşteri iletişim kanalı |
| Proxy | Nginx | Reverse proxy + SSL |
| Süreç | Uvicorn + Systemd | Production 7/24 |

## Veri Modeli Özeti

```
-- Mevcut (değişen)
urunler       + stok_esigi alanı
siparisler    + kargo_no alanı

-- Yeni
kargo_takip         siparis_id, firma, takip_no, durum, gecikme_var
agent_konusmalar    user_id, session_id, mesajlar (JSONB), kanal
stok_uyarilari      urun_id, esik, mevcut_stok, oneri, durum
briefing_gecmisi    tarih, icerik (JSONB), gonderildi
analitik_ozet       tip, baslangic/bitis, veriler (JSONB)
```

## Geliştirme Fazları

### Faz 1 — Sunucu Kurulumu
- Ubuntu 24.04 güncellemesi
- PostgreSQL + Redis kurulum ve yapılandırma
- Python 3.11, Node.js 20, Nginx
- UFW: 22, 80, 443 açık

### Faz 2 — Backend İskeleti
- FastAPI + SQLAlchemy + Alembic + Redis bağlantısı
- Tüm modeller (mevcut + 5 yeni tablo)
- APScheduler entegrasyonu (başlangıç skeleton)
- Alembic migration ve uygulama
- GET /api/healthcheck → tüm servisleri kontrol

### Faz 3 — Authentication
- Register / login / refresh endpoint'leri
- JWT dependency'leri + rol koruma

### Faz 4 — Temel E-ticaret API
- Kategori + Ürün CRUD (stok_esigi alanıyla)
- Sipariş oluşturma (kargo_no alanıyla)
- Sipariş yönetimi ve durum akışı
- Gemini AI açıklama endpoint'i

### Faz 5 — Agent Katmanı
- Gemini orchestrator core
- CustomerAgent (niyet sınıflandırma + sorgu)
- StockAgent (eşik kontrolü + yenileme önerisi)
- CargoAgent (Yurtiçi API + gecikme tespiti)
- WorkflowAgent (briefing oluşturma)
- AnalyticsAgent (opsiyonel)
- APScheduler cron görevleri

### Faz 6 — Bildirim & Entegrasyonlar
- SendGrid e-posta servisi
- Otomatik bildirim tetikleyicileri
- WhatsApp webhook altyapısı

### Faz 7 — Frontend
- React + TailwindCSS + Router kurulumu
- AuthContext + CartContext
- Axios interceptor + tüm servis dosyaları
- Müşteri sayfaları + ChatWidget
- Admin paneli (briefing widget + stok badge + analitik)

### Faz 8 — Deploy
- React build + Nginx konfigürasyonu
- FastAPI + APScheduler Systemd servisi
- Redis Systemd servisi
- Let's Encrypt SSL
- Production smoke testi (tüm agent senaryoları)


## Kapsam Haritası

| Kapsam Alanı | LocalShop Çözümü | Durum |
|---|---|---|
| Müşteri İletişimi Otomasyonu | CustomerAgent + WhatsApp | Faz 5-6 |
| Ürün ve Sipariş Takibi | Temel API + CustomerAgent | Faz 4-5 |
| Kargo Süreç Yönetimi | CargoAgent + APScheduler | Faz 5-6 |
| Stok ve Envanter Yönetimi | StockAgent + eşik sistemi | Faz 5 |
| İş Akışı ve Görev Yönetimi | WorkflowAgent + briefing | Faz 5-6 |
| Analitik ve İçgörü (Opsiyonel) | AnalyticsAgent | Faz 5 |

## Başarı Kriterleri

- [ ] Admin giriş + ürün ekle + AI açıklama üreteci çalışır
- [ ] Müşteri chat'te "siparişim nerede?" yazınca otomatik yanıt alır
- [ ] Kargo gecikmesi → müşteri + admin otomatik bildirim alır
- [ ] Stok eşiği aşılınca admin uyarı + Gemini yenileme önerisi alır
- [ ] Her sabah 08:00 admin briefing e-postası alır
- [ ] Admin dashboard'da analitik özet ve stok uyarıları görünür
- [ ] Tüm akış VPS'te HTTPS üzerinden çalışır
- [ ] README kurulum talimatlarıyla proje sıfırdan ayağa kalkar

## MVP Sonrası (v2) Yol Haritası

| Özellik | Versiyon |
|---|---|
| WhatsApp Business API tam entegrasyon | v1.1 |
| Çoklu kargo firması otomatik seçimi | v1.1 |
| Ödeme sistemi (iyzico) | v2 |
| SMS bildirimleri (Twilio) | v2 |
| Çok-tenant mimari | v2 |
| Gelişmiş ML tahmin modeli | v2 |
| WebSocket canlı bildirimler | v2 |
| Mobil uygulama (React Native) | v3 |
