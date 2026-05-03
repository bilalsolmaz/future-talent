"""
SQLAlchemy veritabanı bağlantı yönetimi.

Ne işe yarıyor?
  PostgreSQL'e bağlantı kurar ve her HTTP request için bir session açar,
  işlem bitince otomatik kapatır. (Dependency Injection pattern)

Alternatifi ne olurdu?
  - Raw SQL (psycopg2 direkt) — SQL injection riski yüksek, her sorguyu elle yazmak gerekir
  - Django ORM — sadece Django ile çalışır, FastAPI ile kullanamayız

Neden SQLAlchemy seçtik?
  Python dünyasının en güçlü ORM'u. SQL injection koruması otomatik.
  Framework bağımsız (FastAPI, Flask hepsinde çalışır).
  2.x sürümü modern Python tip sistemiyle tam uyumlu.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Engine: veritabanına bağlantı havuzu (connection pool) yönetir
# pool_pre_ping=True → her bağlantıyı kullanmadan önce "canlı mı?" kontrolü yapar
# Bu, uzun süre kullanılmayan bağlantıların zaman aşımına uğramasını önler
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,  # True yaparsan tüm SQL sorguları konsola loglanır (debug için)
)

# SessionLocal: her request için yeni session oluşturan factory
# autocommit=False → her değişiklik commit() ile onaylanmalı (güvenlik)
# autoflush=False → sorgu öncesi otomatik flush yapma (performans + kontrol)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    Tüm SQLAlchemy modellerin türetileceği temel sınıf.

    SQLAlchemy 2.x'te DeclarativeBase kullanılır (eski: declarative_base() fonksiyonu).
    Bu class'tan türeyen her class otomatik olarak bir veritabanı tablosuna karşılık gelir.
    """
    pass


def get_db():
    """
    FastAPI dependency — her HTTP request'te yeni bir DB session açar,
    request bitince (başarılı veya hatalı) otomatik kapatır.

    Bu pattern "Unit of Work" olarak bilinir:
    - Her request izole bir transaction'dır
    - Hata olursa değişiklikler geri alınır (rollback)
    - Başarılıysa commit edilir

    Kullanımı:
        @router.get("/urunler")
        def list_products(db: Session = Depends(get_db)):
            return db.query(Urun).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
