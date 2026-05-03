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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, categories, products, orders, ai

settings = get_settings()

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
)

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


# ============================================================
# ROUTER KAYITLARI
# ============================================================
# Her yeni router modulu buraya eklenir.
# include_router() ile router'daki tum endpoint'ler uygulamaya dahil olur.
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(ai.router)


# ============================================================
# HEALTHCHECK ENDPOINT
# ============================================================
@app.get("/api/healthcheck", tags=["Sistem"])
def healthcheck():
    """
    Sunucunun çalışıp çalışmadığını kontrol eder.
    Deploy doğrulaması ve monitoring araçları bu endpoint'i kullanır.

    Döndürdüğü:
        {"status": "ok", "mesaj": "...", "versiyon": "1.0.0"}
    """
    return {
        "status": "ok",
        "mesaj": "LocalShop API çalışıyor 🚀",
        "versiyon": "1.0.0",
    }
