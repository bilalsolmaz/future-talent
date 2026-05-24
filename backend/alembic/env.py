"""
Alembic migration ortam yapılandırması.

Bu dosya Alembic'e şunları söyler:
1. Veritabanı URL'ini .env'den oku (alembic.ini'den değil)
2. Model metadata'sını kullan (autogenerate için)
3. Online/offline migration'ı çalıştır
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Uygulama ayarlarını ve model metadata'sını import et
from app.core.config import get_settings
from app.models import Base  # Tum modeller burada import ediliyor

# Alembic Config objesi — .ini dosyasindaki degerlere erisim saglar
config = context.config

# .env'den DATABASE_URL'i al ve alembic config'e yaz
# Boylece alembic.ini'de hardcode etmeye gerek yok
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Python logging yapilandirmasi
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Autogenerate icin model metadata'si
# Bu sayede "alembic revision --autogenerate" komutu
# modellerdeki degisiklikleri otomatik algilar
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Offline migration — veritabanina baglanmadan SQL ciktilar.
    CI/CD pipeline'larinda veya SQL review icin kullanilir.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Online migration — veritabanina baglanip degisiklikleri uygular.
    Normal kullanim senaryosu budur.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
