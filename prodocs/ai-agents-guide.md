# 🤖 AI Agents Geliştirme Referans Kılavuzu

> LocalShop AI Agent sistemi için geliştirme referans dokümanı.  
> Bu dosya, yapay zeka ajanlarının nasıl çalıştığını, nasıl genişletileceğini ve hangi prompt stratejilerinin kullanıldığını açıklar.

---

## 1. Agent Mimarisi Genel Bakış

LocalShop'ta 5 farklı AI Agent bulunur. Tüm agent'lar `BaseAgent` soyut sınıfından türer ve ortak altyapıyı paylaşır.

### BaseAgent Yapısı

```python
class BaseAgent:
    AGENT_NAME = "BaseAgent"
    SYSTEM_INSTRUCTION = "Sen yardımsever bir asistansın."

    def __init__(self, db: Session, session_id: str | None = None):
        self.db = db                    # SQLAlchemy veritabanı erişimi
        self.session_id = session_id    # Opsiyonel oturum ID
        self.llm = OpenAIService(system_instruction=self.SYSTEM_INSTRUCTION)
        self.logger = logging.getLogger(f"agent.{self.AGENT_NAME.lower()}")

    async def execute(self, task_input: str, **kwargs):
        raise NotImplementedError()

    def log_action(self, action: str, details: str = ""): ...
    def log_error(self, error: str): ...
```

### Yeni Agent Oluşturma Şablonu

```python
from app.agents.base import BaseAgent

class YeniAgent(BaseAgent):
    AGENT_NAME = "YeniAgent"
    SYSTEM_INSTRUCTION = """
    Sen LocalShop'un [görev tanımı] uzmanısın.
    [Davranış kuralları]
    """

    def __init__(self, db: Session):
        super().__init__(db)

    async def execute(self, **kwargs):
        self.log_action("STARTED", "Görev başlatıldı.")

        # 1. Veritabanından veri çek
        data = self.db.execute(...).scalars().all()

        # 2. LLM'e prompt gönder
        prompt = f"Veri: {data}\nLütfen analiz et."
        result = await self.llm.generate_content(prompt)

        # 3. Sonucu kaydet
        self.db.add(...)
        self.db.commit()

        self.log_action("COMPLETED", "Görev tamamlandı.")
        return result
```

---

## 2. OpenAI Service Kullanımı

### Tek Seferlik Üretim
```python
service = OpenAIService(system_instruction="Sen bir metin yazarısın.")
result = await service.generate_content("Ürün açıklaması yaz.", temperature=0.7)
```

### Stateful Chat Oturumu
```python
service = OpenAIService(system_instruction="Sen bir satış danışmanısın.")
session = service.start_chat(history=[
    {"role": "user", "content": "Merhaba"},
    {"role": "model", "content": "Hoş geldiniz!"}
])
response = await service.send_chat_message(session, "Laptop arıyorum")
```

> **Not:** Geçmişteki `role: "model"` otomatik olarak OpenAI'ın `role: "assistant"` formatına çevrilir.

### Retry Mekanizması
- Hata durumunda **exponential backoff** ile `max_retries` (varsayılan: 3) kez tekrar dener.
- Bekleme süreleri: 2s → 4s → 8s
- Tüm denemeler başarısızsa `None` döner.

---

## 3. Agent Bazında Prompt Stratejileri

### CustomerAgent — RAG Pattern
```
Sistem Promptu:
  "Sen LocalShop'un dijital satış danışmanısın..."

Kullanıcı Mesajı (Zenginleştirilmiş):
  "KULLANICI MESAJI: {user_message}
   [GİZLİ SİSTEM BİLGİSİ: Mevcut ürün kataloğu:
   - iPhone 15: 45000 TL (Stokta Var)
   - Samsung S24: 38000 TL (Tükendi)
   ...]"
```

**Önemli kurallar:**
- Zenginleştirilmiş prompt (katalog bilgisi dahil) DB'ye **kaydedilmez** — sadece gerçek kullanıcı mesajı saklanır.
- Hallucination önleme: "Hayal ürünü ürün veya fiyat uydurma" talimatı.

### StockAgent — Aksiyon Odaklı
```
Sistem: "Kesinlikle uzun laf kalabalığı yapma, sadece aksiyon odaklı öneri ver."
Prompt: "Ürün: X | Stok: 3 | Eşik: 10 | Fiyat: 500 TL → Yeniden tedarik tavsiyesi yaz."
```
- `temperature=0.4` — Düşük yaratıcılık, tutarlı ve mantıklı öneriler.

### CargoAgent — Empati Odaklı
```
Sistem: "Müşteriye atılacak çok kibar, güven verici ve empati kuran kısa bir bilgilendirme mesajı yaz."
Prompt: "Müşteri: Ali | Sipariş: SP-123 | Kargo: YK-456 | Konum: İstanbul → Gecikme bildirimi yaz."
```
- `temperature=0.6` — Biraz yaratıcı ama kontrollü.

### WorkflowAgent — Profesyonel Rapor
```
Sistem: "Motive edici ve eyleme geçirilebilir bir Günlük Brifing yaz."
Prompt: "Bekleyen siparişler: 12 | Kritik stoklar: 3 | Geciken kargolar: 1 → Brifing hazırla."
```

### AnalyticsAgent — Veri Toplama (LLM Kullanmaz)
- Bu agent şu an doğrudan SQL sorguları ile metrikleri toplar.
- LLM kullanımı gelecek versiyonda eklenecek (trend yorumlama).

---

## 4. APScheduler Görev Ekleme

### Yeni Periyodik Görev

```python
# scheduler.py içinde:

async def run_yeni_agent():
    db = SessionLocal()
    try:
        agent = YeniAgent(db)
        await agent.execute()
    except Exception as e:
        logger.error(f"YeniAgent hata: {e}")
    finally:
        db.close()

# setup_scheduler() içine ekle:
scheduler.add_job(
    run_yeni_agent,
    trigger=IntervalTrigger(hours=6),  # Her 6 saatte bir
    id="yeni_agent_job",
    name="Yeni Agent Görevi",
    replace_existing=True,
)
```

---

## 5. Veritabanı Modelleri (Agent İlişkili)

| Model | Tablo | İlişkili Agent | Amaç |
|-------|-------|----------------|------|
| `AgentKonusma` | `agent_konusmalar` | CustomerAgent | Sohbet geçmişi (JSONB) |
| `StokUyarisi` | `stok_uyarilari` | StockAgent | Kritik stok uyarıları |
| `KargoTakip` | `kargo_takip` | CargoAgent | Kargo durum geçmişi |
| `BriefingGecmisi` | `briefing_gecmisi` | WorkflowAgent | Günlük brifing raporu |
| `AnalitikOzet` | `analitik_ozet` | AnalyticsAgent | Pre-aggregated metrikler |

---

## 6. Test ve Debug

### Agent'ı Manuel Test Etme

```python
# Backend container'a bağlan:
docker exec -it localshop_backend python

# Test:
import asyncio
from app.core.database import SessionLocal
from app.agents.customer import CustomerAgent

async def test():
    db = SessionLocal()
    agent = CustomerAgent(db, session_id="test-123")
    response = await agent.execute("Merhaba, laptop arıyorum")
    print(response)
    db.close()

asyncio.run(test())
```

### Scheduler Görevlerini Manuel Tetikleme

```python
from app.core.scheduler import run_stock_agent, run_workflow_agent
asyncio.run(run_stock_agent())
asyncio.run(run_workflow_agent())
```

---

## 7. Güvenlik Notları

1. **API anahtarları asla frontend'e çıkmaz** — Tüm AI çağrıları backend üzerinden.
2. **Sistem prompt'ları kullanıcıya gösterilmez** — Zenginleştirilmiş bağlam DB'ye kaydedilmez.
3. **Rate limiting** — `/ai/chat` endpoint'i aşırı kullanıma karşı korunmalı.
4. **Input sanitization** — Kullanıcı mesajları LLM'e gönderilmeden önce uzunluk sınırı kontrol edilmeli.

---

*LocalShop AI Agents Guide — 2025–2026*
