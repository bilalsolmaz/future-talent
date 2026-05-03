"""
Kategori modeli — kategoriler tablosu.

slug alanı: URL-friendly isim. Örnek: "Sıcak İçecekler" → "sicak-icecekler"
Ürünler kategorilere bağlıdır (one-to-many ilişki).
"""

from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Kategori(Base):
    """
    kategoriler tablosu.

    relationship("Urun"): Bu kategoriye ait ürünleri otomatik yükler.
    back_populates: İki yönlü ilişki — Urun.kategori ↔ Kategori.urunler
    """

    __tablename__ = "kategoriler"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    isim: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # İlişki: Bir kategorinin birden çok ürünü olabilir (one-to-many)
    urunler = relationship("Urun", back_populates="kategori")

    def __repr__(self) -> str:
        return f"<Kategori(id={self.id}, isim={self.isim}, slug={self.slug})>"
