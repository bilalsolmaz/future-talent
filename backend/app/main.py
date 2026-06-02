"""
FastAPI uygulama giriş noktası.

Ne işe yarıyor?
  Uygulamayı başlatır, middleware'leri ekler, router'ları kaydeder.
  Swagger UI otomatik olarak /api/docs adresinde oluşturulur.

Alternatifi ne olurdu?
  - Flask: Daha eski, async desteği zayıf, Swagger otomatik değil
  - Django REST: Ağır, çok fazla boilerplate, öğrenme eğrisi dik

Neden FastAPI seçtik?
  Modern, hızlı (async), otomatik Swagger/OpenAPI dökümantasyonu,
  Pydantic ile tip güvenliği. Hata mesajları bile otomatik JSON.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.redis import init_redis, close_redis
from app.routers import auth, categories, products, orders, ai, returns, reviews, favorites, coupons, stock, cargo, analytics

settings = get_settings()

# ============================================================
# FASTAPI LIFESPAN
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken:
    await init_redis()
    
    from app.core.scheduler import setup_scheduler, shutdown_scheduler
    setup_scheduler()
    
    yield
    # Uygulama kapanırken:
    shutdown_scheduler()
    await close_redis()

# ============================================================
# FASTAPI UYGULAMA OLUŞTURMA
# ============================================================
app = FastAPI(
    title="LocalShop API",
    description="Küçük ve yerel işletmeler için dijital vitrin & sipariş sistemi",
    version="1.0.0",
    docs_url="/api/docs",             # Swagger UI adresi
    redoc_url="/api/redoc",           # ReDoc (alternatif dokümantasyon) adresi
    openapi_url="/api/openapi.json",  # OpenAPI şema dosyası
    lifespan=lifespan,
)

# ============================================================
# STATİK DOSYALAR (UPLOAD) BÖLÜMÜ
# ============================================================
import os
from fastapi.staticfiles import StaticFiles

# Uygulama için yükleme klasörlerini oluşturup mount ediyoruz
os.makedirs("static/uploads", exist_ok=True)
app.mount("/api/static", StaticFiles(directory="static"), name="static")

# ============================================================
# CORS MIDDLEWARE
# ============================================================
# CORS (Cross-Origin Resource Sharing):
# Tarayıcı güvenlik politikası — farklı domain'lerden gelen istekleri
# varsayılan olarak engeller. Frontend (localhost:5173) ve backend
# (localhost:8000) farklı portlarda olduğu için CORS izni gerekli.
#
# allow_credentials=True → Cookie ve Authorization header gönderilmesine izin ver
# allow_methods=["*"]    → GET, POST, PUT, DELETE, PATCH... tümüne izin ver
# allow_headers=["*"]    → Authorization, Content-Type... tümüne izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi import APIRouter

# ============================================================
# ROUTER KAYITLARI (VERSIONING)
# ============================================================
api_router = APIRouter()

# Her yeni router modulu buraya eklenir.
api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(ai.router)
api_router.include_router(returns.router)
api_router.include_router(reviews.router)
api_router.include_router(favorites.router)
api_router.include_router(coupons.router)
api_router.include_router(stock.router)
api_router.include_router(cargo.router)
api_router.include_router(analytics.router)

# Yeni standart: /api/v1
app.include_router(api_router, prefix="/api/v1")

# Geriye dönük uyumluluk (Frontend güncellenene kadar geçici olarak tutulacak)
app.include_router(api_router, prefix="/api")


from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import Depends
from app.core.database import get_db

# ============================================================
# HEALTHCHECK ENDPOINT
# ============================================================
@app.get("/api/healthcheck", tags=["Sistem"])
async def healthcheck(db: Session = Depends(get_db)):
    """
    Sunucunun çalışıp çalışmadığını kontrol eder.
    Deploy doğrulaması ve monitoring araçları bu endpoint'i kullanır.
    """
    status_data = {
        "status": "ok",
        "mesaj": "LocalShop API çalışıyor 🚀",
        "versiyon": "1.0.0",
        "services": {
            "postgresql": "error",
            "redis": "error"
        }
    }
    
    # DB kontrolü
    try:
        db.execute(text("SELECT 1"))
        status_data["services"]["postgresql"] = "ok"
    except Exception as e:
        status_data["status"] = "error"
        status_data["mesaj"] = f"DB Hatası: {e}"

    # Redis kontrolü
    from app.core.redis import get_redis
    redis_client = await get_redis()
    if redis_client:
        try:
            await redis_client.ping()
            status_data["services"]["redis"] = "ok"
        except Exception as e:
            status_data["status"] = "error"
            status_data["mesaj"] = f"Redis Hatası: {e}"
    else:
        status_data["status"] = "error"
        status_data["mesaj"] = "Redis bağlantısı kurulamadı"
        
    return status_data
