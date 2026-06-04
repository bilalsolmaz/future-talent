# 📒 Progress.md — Geliştirme Günlüğü

> Yapılan her işlemin, alınan kararların ve hataların kaydı.

---

## Faz 1 — Proje İskeleti & Altyapı

### ✅ Proje Dokümanları Hazırlanması
- **Tarih:** Proje başlangıcı
- **Yapılan:** PRD v2, MVP v2, PLAN v2 dokümanları oluşturuldu.
- **Kararlar:** 
  - Proje iki katmanlı tasarlandı: Katman 1 (temel e-ticaret) + Katman 2 (AI agent otomasyon).
  - 5 AI Agent mimarisi belirlendi: CustomerAgent, CargoAgent, StockAgent, WorkflowAgent, AnalyticsAgent.
  - Tek-tenant mimari ile başlanması, çok-tenant'ın v2'ye bırakılmasına karar verildi.

### ✅ Backend İskeleti
- **Yapılan:** FastAPI + SQLAlchemy + Alembic + APScheduler altyapısı kuruldu.
- **Modeller:** User, Urun, Kategori, Siparis, SiparisKalemi, KargoTakip, AgentKonusma, StokUyarisi, BriefingGecmisi, AnalitikOzet, Iade, Yorum, Favori, Kupon — toplam 14 model.
- **Konfigürasyon:** `pydantic-settings` ile tip güvenlikli ayar yönetimi (`config.py`).
- **Kararlar:**
  - Soft delete stratejisi: Ürünler fiziksel olarak silinmez, `aktif=False` yapılır (sipariş geçmişi korunsun diye).
  - JSONB alanları: Ürün özellikleri (`ozellikler`), konuşma geçmişi (`mesajlar`), analitik verileri.

### ✅ Docker Altyapısı
- **Yapılan:** `docker-compose.yml` ile 5 container orchestration'ı kuruldu:
  - `localshop_db` (PostgreSQL 17)
  - `localshop_redis` (Redis 7 Alpine)
  - `localshop_backend` (Python 3.12 + FastAPI)
  - `localshop_frontend` (Node 22 → Build → Nginx)
  - `localshop_proxy` (Nginx reverse proxy, port 8090)
- **Kararlar:**
  - Backend ve frontend ayrı container olarak çalışır, proxy birleştirir.
  - PostgreSQL ve Redis dışarıya açık değil, sadece Docker network içinden erişilebilir.

---

## Faz 2 — Authentication & Core API

### ✅ JWT Kimlik Doğrulama
- **Yapılan:** Register, login, refresh token endpoint'leri.
- **Özellikler:** 
  - Access token (30 dk) + Refresh token (7 gün) mekanizması.
  - bcrypt hash (rounds=12) ile şifre güvenliği.
  - `admin` ve `musteri` rolleri, korumalı endpoint'ler (`require_admin` dependency).

### ✅ Ürün & Kategori CRUD
- **Yapılan:** Tam CRUD API'leri (filtre, arama, sayfalama, dinamik özellik filtreleme).
- **Özellikler:**
  - ILIKE arama (isim + açıklama).
  - Dinamik JSON filtreleme (`?Marka=Apple` gibi query parametreleri ile `ozellikler` JSONB sütununda arama).
  - Stok eşik sistemi (`stok_esigi` alanı).

### ✅ Sipariş Sistemi
- **Yapılan:** Sipariş oluşturma (stok kontrolü + transaction), durum akışı yönetimi.
- **Durum akışı:** `bekliyor → hazirlaniyor → kargolandi → teslim_edildi / iptal`
- **Kararlar:**
  - `siparis_no`: Benzersiz sipariş numarası (UUID tabanlı).
  - Sipariş oluşturulduğunda stok otomatik düşer.

---

## Faz 3 — AI Agent Katmanı

### ✅ Agent Mimarisi Tasarımı
- **Yapılan:** `BaseAgent` soyut sınıfı oluşturuldu.
- **Mimari:**
  - Her agent `db` (SQLAlchemy Session) ve `llm` (OpenAIService) erişimine sahip.
  - `execute()` metodu alt sınıflar tarafından implement edilir.
  - Standart `log_action()` ve `log_error()` metotları ile loglama.

### ✅ Gemini → OpenAI Geçişi
- **Tarih:** Geliştirme süreci ortası
- **Problem:** Google Gemini API ile tutarsız yanıt kalitesi ve chat session yönetim zorluğu.
- **Çözüm:** Tüm AI altyapısı OpenAI API (gpt-4o-mini) ile yeniden yazıldı.
- **Yapılan değişiklikler:**
  - `requirements.txt`: `google-generativeai` → `openai`
  - Yeni `openai_service.py`: AsyncOpenAI client, exponential backoff retry, `OpenAIChatSession` (stateful chat).
  - `config.py`: Gemini config → `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TIMEOUT_SECONDS`, `OPENAI_MAX_RETRIES`.
  - `base.py`: Gemini service referansları → OpenAIService.
  - `ai.py` router: Gemini çağrıları → OpenAI çağrıları.
  - `docker-compose.yml`: `GEMINI_API_KEY` → `OPENAI_API_KEY`.
- **Hatalar ve çözümler:**
  - ❌ İlk geçişte chatbot "Bir hata oluştu" yanıtı döndü → `role: "model"` → `role: "assistant"` mapping eksikti → `OpenAIChatSession.__init__` düzeltildi.

### ✅ CustomerAgent
- **Yapılan:** Müşteri chatbot'u — RAG pattern ile ürün kataloğu bağlamı.
- **Özellikler:**
  - `_get_products_context()`: Aktif ürünleri DB'den çekip string bağlam oluşturma.
  - Zenginleştirilmiş prompt: Kullanıcı mesajı + gizli ürün kataloğu bağlamı.
  - Konuşma geçmişi: `agent_konusmalar` tablosunda JSONB olarak saklanır.
  - Güvenlik: Bağlam bilgisi (katalog) DB'ye kaydedilmez — token israfı ve veri sızıntısı önlenir.

### ✅ StockAgent
- **Yapılan:** Stok eşik kontrolü + AI destekli yenileme önerisi.
- **Akış:** Ürün stoğu < stok_esigi → mevcut uyarı yoksa → LLM'den öneri al → `stok_uyarilari` tablosuna kaydet.
- **Kararlar:**
  - `<` operatörü kullanıldı (`<=` değil) → `stok_esigi=0` durumunda spam uyarı önlendi.
  - Aynı ürün için zaten "acik" durumda uyarı varsa yeni uyarı oluşturulmaz (dedup).

### ✅ CargoAgent
- **Yapılan:** Kargo durum kontrolü, gecikme tespiti, otomatik bildirim.
- **Akış:** Kargolanan siparişleri bul → Provider'dan durum çek → Gecikme varsa LLM ile mesaj üret → WhatsApp/Email gönder.
- **Kararlar:**
  - `joinedload(Siparis.user)` ile N+1 sorgu sorunu önlendi.
  - Mock provider: Development'ta gerçek kargo API'si yerine simülasyon provider kullanılır.

### ✅ WorkflowAgent
- **Yapılan:** Günlük sabah brifing'i hazırlama ve e-posta gönderimi.
- **Akış:** Bekleyen siparişler + açık stok uyarıları + geciken kargolar → LLM ile rapor üret → E-posta at → `briefing_gecmisi` kayıt.
- **Kararlar:**
  - Aynı gün için çift brifing engellendi (tarih unique kontrolü).

### ✅ AnalyticsAgent
- **Yapılan:** Satış metrikleri pre-aggregation.
- **Metrikler:** Toplam ciro, sipariş sayısı, yeni müşteri, iade oranı.
- **Kararlar:**
  - Heavy-query'leri önlemek için sonuçlar `analitik_ozet` tablosuna yazılır (pre-aggregation pattern).
  - Timezone-aware datetime kullanılır (UTC).

### ✅ APScheduler Görevleri
- **Yapılan:** 4 periyodik görev tanımlandı.
  - StockAgent: Her 1 saatte bir
  - CargoAgent: Her 2 saatte bir
  - WorkflowAgent: Her gün 08:00 (Europe/Istanbul)
  - AnalyticsAgent: Her gece 23:50 (Europe/Istanbul)

---

## Faz 4 — Frontend Geliştirme

### ✅ React Uygulama Kabuğu
- **Yapılan:** React 19 + TailwindCSS 4 + Vite 8 + React Router 7.
- **Bileşenler:** Navbar, Footer, ChatbotWidget, ProductCard, AuthRoutes.
- **Context'ler:** AuthContext (login/logout/token yönetimi), CartContext (sepet).
- **API Servisi:** Axios instance + request/response interceptor (JWT auto-refresh).

### ✅ Müşteri Arayüzü (10 Sayfa)
- Home (vitrin), Products (ürün listesi), ProductDetail (detay + yorum + favori)
- Cart (sepet), Profile (profil + sipariş geçmişi + adres yönetimi)
- Favorites, About, FAQ, Contact, KVKK
- ChatbotWidget: Floating chatbot butonu, mesaj geçmişi, gerçek zamanlı AI yanıtları

### ✅ Admin Paneli (7 Sayfa)
- AdminHome (dashboard — KPI kartları + son siparişler + stok uyarıları)
- ProductsAdmin (ürün yönetimi + AI açıklama üreteci + görsel yükleme)
- CategoriesAdmin, OrdersAdmin, FinanceAdmin, ReturnsAdmin
- Dashboard (sidebar layout, responsive tasarım)

---

## Faz 5 — Ürün Görsel Yükleme (File Upload)

### ✅ Backend Statik Dosya Sistemi
- **Yapılan:** `main.py` içinde `static/uploads` dizini otomatik oluşturma + `/api/static` mount.
- **API:** `POST /api/v1/urunler/upload-gorsel` — Admin yetkili, dosya uzantısı doğrulaması (.jpg, .jpeg, .png, .webp, .gif), UUID ile benzersiz isim.

### ✅ Docker Bind Mount
- **Yapılan:** `docker-compose.yml` → `./backend/static:/app/static` volume bağıntısı.
- **Neden:** Container silinse/yeniden oluşturulsa bile yüklenen görseller disk üzerinde kalıcı.

### ✅ Frontend Görsel Yükleme Arayüzü
- **Yapılan:** ProductsAdmin.jsx'e dual upload sistemi:
  - "Bilgisayardan Görsel Seç" — dashed upload kutusu + yükleniyor animasyonu
  - "Görsel URL Gir" — alternatif internet adresi girişi
  - Önizleme kartı + Kaldır (X) butonu
- **Hatalar ve çözümler:**
  - Başlangıçta form'da `resim_url` input alanı yoktu → eklendi.
  - URL input'u `type="url"` idi ve yerel yüklenen dosya yolu (`/api/static/uploads/...`) ile uyumsuzdu → `type="text"` yapılmadan `value` kontrolüyle çözüldü.

---

## Faz 6 — Jüri Teslim Hazırlığı

### ✅ Zorunlu Dokümanlar
- **Yapılan:** Jüri gereksinimlerine uygun tüm dokümanlar oluşturuldu/güncellendi:
  - `README.md` — Uygulama one-pager, mimari, deploy talimatları
  - `PRD.md` — Product Requirements Document (güncellenmiş)
  - `PLAN.md` — Teknik geliştirme planı (güncellenmiş)
  - `tech-stack.md` — Teknoloji seçimleri ve AI kullanımı
  - `DesignSystem.md` — Renk paleti, tipografi, component kuralları
  - `Progress.md` — Geliştirme günlüğü (bu dosya)
  - `.env.example` — Örnek ortam değişkenleri şablonu
  - `.gitignore` — Gereksiz dosyaların repoya girmesini engeller
  - `/prodocs/ai-agents-guide.md` — AI agent geliştirme referansı

---

## Bilinen Sorunlar / Gelecek İyileştirmeler

| # | Sorun/İyileştirme | Durum | Not |
|---|-------------------|-------|-----|
| 1 | WhatsApp Business API tam entegrasyonu | Planlanan (v1.1) | Webhook altyapısı hazır |
| 2 | Ödeme sistemi (iyzico) | Planlanan (v2) | Şu an sipariş oluşturma ödeme almadan çalışıyor |
| 3 | WebSocket canlı bildirimler | Planlanan (v2) | Şu an polling tabanlı |
| 4 | Çoklu kargo firması desteği | Planlanan (v1.1) | Mock provider ile test ediliyor |
| 5 | Rate limiting endpoint'lere eklenmesi | Kısmen hazır | Redis altyapısı mevcut |
| 6 | Mobil uygulama | Planlanan (v3) | Responsive web şu an yeterli |

---

*LocalShop Progress.md — 2026–2027*
