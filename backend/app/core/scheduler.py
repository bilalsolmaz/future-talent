import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.database import SessionLocal
from app.agents.stock import StockAgent
from app.agents.cargo import CargoAgent
from app.agents.workflow import WorkflowAgent
from app.agents.analytics import AnalyticsAgent

logger = logging.getLogger(__name__)

# Global scheduler nesnesi
scheduler = AsyncIOScheduler()

async def run_stock_agent():
    """Her saat başı stok kontrolü yapar."""
    db = SessionLocal()
    try:
        agent = StockAgent(db)
        await agent.execute()
    except Exception as e:
        logger.error(f"StockAgent çalışırken hata: {e}")
    finally:
        db.close()

async def run_cargo_agent():
    """Her 2 saatte bir kargo durumu kontrolü yapar."""
    db = SessionLocal()
    try:
        agent = CargoAgent(db)
        await agent.execute()
    except Exception as e:
        logger.error(f"CargoAgent çalışırken hata: {e}")
    finally:
        db.close()

async def run_workflow_agent():
    """Her sabah 08:00'de günlük sistem analizi yapıp mail atar."""
    db = SessionLocal()
    try:
        agent = WorkflowAgent(db)
        await agent.execute()
    except Exception as e:
        logger.error(f"WorkflowAgent çalışırken hata: {e}")
    finally:
        db.close()

async def run_analytics_agent():
    """Günde bir kez veya saatlik olarak verileri harmanlar."""
    db = SessionLocal()
    try:
        agent = AnalyticsAgent(db)
        await agent.execute(periyot="gunluk")
    except Exception as e:
        logger.error(f"AnalyticsAgent çalışırken hata: {e}")
    finally:
        db.close()


def setup_scheduler():
    """
    Uygulama başlarken çağrılır. Görevleri zamanlar ve scheduler'ı başlatır.
    """
    # 1. Stock Agent - Her saat başı
    scheduler.add_job(
        run_stock_agent,
        trigger=IntervalTrigger(hours=1),
        id="stock_check_job",
        name="Stok Kontrol Görevi",
        replace_existing=True,
    )
    
    # 2. Cargo Agent - Her 2 saatte bir
    scheduler.add_job(
        run_cargo_agent,
        trigger=IntervalTrigger(hours=2),
        id="cargo_check_job",
        name="Kargo Takip Görevi",
        replace_existing=True,
    )
    
    # 3. Workflow Agent - Her gün sabah 08:00
    scheduler.add_job(
        run_workflow_agent,
        trigger=CronTrigger(hour=8, minute=0),
        id="workflow_briefing_job",
        name="Günlük Yönetici Brifingi",
        replace_existing=True,
    )
    
    # 4. Analytics Agent - Her gün gece 23:50'de
    scheduler.add_job(
        run_analytics_agent,
        trigger=CronTrigger(hour=23, minute=50),
        id="analytics_daily_job",
        name="Günlük Analitik Özet Çıkarımı",
        replace_existing=True,
    )
    
    scheduler.start()
    logger.info("APScheduler başlatıldı. Tüm AI Agent görevleri zamanlandı.")

def shutdown_scheduler():
    """Uygulama kapanırken çağrılır."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler durduruldu.")
