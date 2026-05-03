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

    # JWT — JSON Web Token ayarları
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google Gemini AI
    GEMINI_API_KEY: str = ""

    # CORS — hangi frontend adreslerinden istek kabul edilecek
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

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
