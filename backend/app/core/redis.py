import redis.asyncio as redis
import logging

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Redis bağlantı havuzu
# Async redis client oluşturuyoruz (FastAPI ile uyumlu olması için)
redis_client = None

async def init_redis():
    """Uygulama başlarken Redis bağlantısını kurar."""
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_timeout=5.0,
            socket_connect_timeout=5.0
        )
        # Bağlantıyı test et
        await redis_client.ping()
        logger.info("Redis bağlantısı başarılı.")
    except Exception as e:
        logger.error(f"Redis bağlantı hatası: {e}")
        # Uygulamanın çökmesini istemiyorsak raise etmiyoruz, ama Redis'siz çalışacak
        # Production'da kritikse raise edilmeli.
        redis_client = None

async def close_redis():
    """Uygulama kapanırken Redis bağlantısını temizler."""
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis bağlantısı kapatıldı.")

async def get_redis() -> redis.Redis | None:
    """FastAPI Dependency: Endpoint'lerde Redis kullanmak için."""
    return redis_client
