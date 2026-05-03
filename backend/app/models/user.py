"""
Kullanıcı modeli — users tablosu.

Her kullanıcı ya 'admin' (işletme sahibi) ya da 'musteri' (son kullanıcı) rolünde.
email alanı unique — aynı email ile iki kez kayıt olunamaz.
password_hash: şifre asla düz metin saklanmaz, bcrypt hash'i tutulur.
"""

from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    """
    users tablosu.

    SQLAlchemy 2.x'te Mapped[] + mapped_column() kullanılır.
    Eski stil: Column(String(255)) → Yeni stil: Mapped[str] = mapped_column(String(255))
    Yeni stil tip güvenliği sağlar, IDE otocomplete çalışır.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(
        String(10), nullable=False, default="musteri"
    )  # 'admin' | 'musteri'
    isim: Mapped[str] = mapped_column(String(100), nullable=False)
    telefon: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, rol={self.rol})>"
