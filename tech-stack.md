# 🔧 tech-stack.md — Teknoloji Seçimleri & AI Kullanımı

> LocalShop projesinde kullanılan teknolojiler, seçim gerekçeleri ve geliştirme sürecinde yapay zekanın nasıl kullanıldığı.

---

## 1. Teknoloji Haritası

| Katman | Teknoloji | Versiyon | Gerekçe |
|--------|-----------|----------|---------|
| **Frontend** | React | 19 | Component tabanlı mimari, geniş ekosistem, hızlı geliştirme |
| **CSS Framework** | TailwindCSS | 4 | Utility-first yaklaşım, responsive tasarım, design token desteği |
| **Build Tool** | Vite | 8 | HMR hızı, ESBuild tabanlı derleme, modern ESM desteği |
| **Routing** | React Router | 7 | Nested routes, korumalı rotalar, deklaratif navigasyon |
| **HTTP Client** | Axios | 1.15 | Interceptor desteği (JWT refresh), istek/yanıt yönetimi |
| **Animasyon** | Framer Motion | 12 | Deklaratif animasyon API'si, gesture desteği |
| **İkonlar** | Lucide React | 1.12 | Hafif, tree-shakeable, tutarlı SVG ikon seti |
| **Backend** | FastAPI (Python) | 0.109+ | Async desteği, otomatik Swagger/OpenAPI, Pydantic tip güvenliği |
| **ORM** | SQLAlchemy | 2.x | Modern ORM, ilişkisel model desteği, migration uyumu |
| **Migration** | Alembic | 1.13+ | Veritabanı şema versiyonlama, otomatik migration üretimi |
| **Veritabanı** | PostgreSQL | 17 | ACID uyumlu, JSONB desteği, production-grade performans |
| **Cache/Session** | Redis | 7 | Agent session cache, bildirim kuyruğu, düşük latency |
| **Auth** | JWT + bcrypt | — | Stateless kimlik doğrulama, güvenli şifre hash (rounds=12) |
| **AI/LLM** | OpenAI API (gpt-4o-mini) | 1.0+ | Yüksek kaliteli metin üretimi, düşük maliyet, hızlı yanıt |
| **Zamanlayıcı** | APScheduler | 3.10+ | Python-native cron görevleri, Celery'ye gerek kalmadan |
| **Kargo Takip** | Yurtiçi Kargo API | — | Türkiye'nin en yaygın kargo firması API'si |
| **E-posta** | SendGrid | — | Güvenilir transactional e-posta gönderimi |
| **Reverse Proxy** | Nginx | Alpine | SSL terminasyonu, statik dosya sunumu, yük dengeleme |
| **Container** | Docker + Docker Compose | — | Tutarlı geliştirme/production ortamı, tek komutla deploy |

---

## 2. Seçim Gerekçeleri

### Neden FastAPI (Flask / Django REST yerine)?
- **Async desteği:** AI Agent'lar OpenAI API'ye asenkron istekler atıyor. Flask'ın sync yapısı darboğaz yaratırdı.
- **Otomatik Swagger:** `/api/docs` adresinde tüm endpoint'ler otomatik belgeleniyor — jüri değerlendirmesi için büyük kolaylık.
- **Pydantic entegrasyonu:** Request/response validasyonu tip güvenliğiyle sağlanıyor. Yanlış veri format sunucuya gelmeden reddediliyor.

### Neden OpenAI API (Gemini yerine)?
- Proje başlangıçta Google Gemini API ile geliştirildi, ardından **daha tutarlı yanıt kalitesi ve Chat Completions API'nin basitliği** nedeniyle OpenAI'a geçildi.
- `gpt-4o-mini` modeli maliyet/performans dengesi açısından en uygun seçim.
- Exponential backoff retry mekanizması ile hata toleransı sağlandı.

### Neden PostgreSQL (SQLite / MySQL yerine)?
- **JSONB desteği:** Agent konuşma geçmişi, ürün özellikleri ve analitik verileri JSON formatında saklanıyor.
- **Transaction güvenliği:** Sipariş oluşturma sırasında stok kontrolü ve düşümü atomik yapılıyor.
- **Production-grade:** Docker ile kolayca deploy ediliyor, veri bütünlüğü garanti.

### Neden Redis?
- **Agent session cache:** CustomerAgent sohbet oturumları hızlı erişim için Redis'te tutuluyor.
- **Rate limiting:** Chat endpoint'ine aşırı istek koruması.
- **Bildirim kuyruğu:** E-posta gönderim başarısızlıklarında mesajlar kuyruğa alınıyor.

### Neden TailwindCSS 4?
- **Design token sistemi:** `@theme` bloğu ile renk paleti, font ve gölgeler merkezi tanımlanıyor.
- **Component katmanı:** `@layer components` ile `.btn`, `.card`, `.input-field` gibi yeniden kullanılabilir sınıflar.
- **Performans:** Sadece kullanılan sınıflar bundle'a dahil (tree-shaking).

### Neden APScheduler (Celery yerine)?
- **Basitlik:** Celery ayrı bir worker process ve message broker (RabbitMQ) gerektirirdi.
- **Yeterlilik:** Projenin ölçeğinde (saatlik stok kontrolü, günlük brifing) APScheduler fazlasıyla yeterli.
- **Entegrasyon:** FastAPI'nin `lifespan` event'i ile doğal entegrasyon, ayrı servise gerek yok.

---

## 3. AI Kullanımı — Geliştirme Sürecinde

### 3.1. Yapay Zeka Destekli Geliştirme

Projenin geliştirme sürecinde yapay zeka asistanları aşağıdaki alanlarda kullanılmıştır:

| Kullanım Alanı | Araç | Açıklama |
|----------------|------|----------|
| **Kod yazımı ve refactoring** | Google Gemini, Claude (Antigravity IDE) | Agent mimarisi, API endpoint'leri, frontend bileşenleri |
| **Hata ayıklama (Debug)** | Claude (Antigravity IDE) | Docker container logları, CORS sorunları, JWT token akışı |
| **Belge ve doküman üretimi** | Claude (Antigravity IDE) | PRD, PLAN, README, teknik dokümanlar |
| **Mimari tasarım** | Google Gemini | Agent orchestration pattern'i, veritabanı şema tasarımı |
| **Code review** | Claude (Antigravity IDE) | Güvenlik açıkları, performans iyileştirmeleri |

### 3.2. Ürün İçinde AI Kullanımı

LocalShop, AI'ı sadece geliştirme aracı olarak değil, **ürünün çekirdek özelliği** olarak kullanmaktadır:

| Özellik | AI Modeli | Kullanım Şekli |
|---------|-----------|----------------|
| **Müşteri Chatbot** | OpenAI gpt-4o-mini | RAG pattern ile ürün kataloğunu bağlam olarak verip doğal dil yanıtları üretme |
| **Ürün Açıklama Üreteci** | OpenAI gpt-4o-mini | Ürün adı ve fiyatına göre SEO uyumlu, profesyonel Türkçe açıklama üretme |
| **Stok Yenileme Önerisi** | OpenAI gpt-4o-mini | Kritik stoktaki ürünler için yeniden tedarik miktarı ve gerekçesi üretme |
| **Kargo Gecikme Bildirimi** | OpenAI gpt-4o-mini | Gecikme durumunda müşteriye gönderilecek empatik bilgilendirme mesajı oluşturma |
| **Günlük Brifing Raporu** | OpenAI gpt-4o-mini | Sistem istatistiklerini analiz ederek yöneticiye okunabilir günlük rapor hazırlama |

### 3.3. AI Agent Mimarisi Detayı

```
OpenAIService (Wrapper)
  ├── generate_content()     — Tek seferlik prompt → yanıt
  ├── start_chat()           — Stateful sohbet oturumu başlatma
  └── send_chat_message()    — Oturuma mesaj gönderme + geçmiş yönetimi

BaseAgent (Abstract)
  ├── llm: OpenAIService     — Her agent'ın LLM erişimi
  ├── db: Session            — Veritabanı erişimi
  ├── execute()              — Ana iş mantığı (override)
  └── log_action/error()     — Standart loglama

Orchestration:
  - CustomerAgent → Gerçek zamanlı (HTTP isteğiyle)
  - StockAgent    → Periyodik (APScheduler — her 1 saat)
  - CargoAgent    → Periyodik (APScheduler — her 2 saat)
  - WorkflowAgent → Cron (APScheduler — her gün 08:00)
  - AnalyticsAgent → Cron (APScheduler — her gece 23:50)
```

---

## 4. Özgün Katkılar ve AI Sınırları

### İnsan Tarafından Yapılan Özgün Katkılar
- **Mimari kararlar:** Agent pattern seçimi, veritabanı şeması tasarımı, Docker multi-container orchestration
- **İş kuralları:** Stok eşik sistemi, sipariş durum akışı, soft delete stratejisi, kargo gecikme tespiti mantığı
- **Güvenlik:** JWT rotation, bcrypt hash, rate limiting, CORS politikası, webhook imza doğrulama tasarımı
- **UX tasarım:** Responsive layout, admin panel akışı, chatbot widget deneyimi
- **Hata yönetimi:** Retry mekanizması, fallback yanıtlar, graceful degradation

### AI'ın Sınırları ve Manuel Düzeltmeler
- AI tarafından üretilen kodda CORS konfigürasyonu, Docker networking ve Alembic migration sıralaması gibi konularda manuel düzeltmeler yapıldı
- OpenAI'a geçiş sırasında Gemini-specific API pattern'leri tamamen yeniden yazıldı
- Agent sistem prompt'ları iteratif olarak test edilip optimize edildi

---

*LocalShop tech-stack.md — 2026–2027*