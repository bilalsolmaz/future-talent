"""
Favori modeli — favoriler tablosu.

Müşteriler beğendikleri ürünleri favorilerine ekleyebilir.
"""

from datetime import datetime

from sqlalchemy import ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Favori(Base):
    __tablename__ = "favoriler"
    __table_args__ = (
        UniqueConstraint("user_id", "urun_id", name="uq_user_urun_favori"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User")
    urun = relationship("Urun", backref="favoriler")

    def __repr__(self) -> str:
        return f"<Favori(user_id={self.user_id}, urun_id={self.urun_id})>"
