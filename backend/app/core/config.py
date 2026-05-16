"""
Uygulama yapılandırması — .env dosyasından ortam değişkenlerini okur.

Ne işe yarıyor?
  Tüm ayarları (DB URL, JWT secret, API key vb.) tek bir class'ta toplar.
  .env dosyasından okur, böylece kod ve ayarlar ayrı tutulur.

Alternatifi ne olurdu?
  os.getenv() ile tek tek okumak — tip güvenliği yok, validasyon yok.

Neden bunu seçtik?
  pydantic-settings: otomatik .env okuma + tip validasyonu + IDE desteği.
  Yanlış tip girersen uygulama başlamadan hata verir (fail-fast prensibi).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Tüm uygulama ayarları.
    .env dosyasındaki değişkenler otomatik olarak bu class'a yüklenir.
    Büyük/küçük harf duyarsız (DATABASE_URL = database_url)
    """

    # Veritabanı
    DATABASE_URL: str
    REDIS_URL: str

    # JWT — JSON Web Token ayarları
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_TIMEOUT_SECONDS: int = 10
    GEMINI_MAX_RETRIES: int = 3

    # Kargo Entegrasyonu
    YURTICI_API_KEY: str = ""
    YURTICI_API_URL: str = "https://api.yurticikargo.com"
    PTT_API_KEY: str = ""
    CARGO_CHECK_INTERVAL_HOURS: int = 2

    # Bildirim (SendGrid)
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@localshop.com"
    ADMIN_EMAIL: str = "admin@localshop.com"

    # WhatsApp Webhook
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_VERIFY_TOKEN: str = ""
    WHATSAPP_PHONE_ID: str = ""

    # İş Akışı
    BRIEFING_CRON_HOUR: int = 8
    BRIEFING_CRON_MINUTE: int = 0

    # Güvenlik & Uygulama
    APP_ENV: str = "development"
    RATE_LIMIT_ENABLED: bool = True
    SWAGGER_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"

    # CORS — hangi frontend adreslerinden istek kabul edilecek
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:8080"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache
def get_settings() -> Settings:
    """
    Settings singleton — uygulama boyunca tek instance kullanılır.

    lru_cache sayesinde her çağrıda yeniden .env okumaz,
    ilk çağrıda oluşturup sonrakilerde cache'den döner.
    Bu hem performans hem tutarlılık sağlar.
    """
    return Settings()
