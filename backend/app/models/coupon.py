"""
Kupon modeli — kuponlar tablosu.

Admin kupon kodu oluşturur, müşteriler sepette uygular.
İndirim tipi: 'yuzde' veya 'sabit' (TL).
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Numeric, Integer, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Kupon(Base):
    __tablename__ = "kuponlar"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    kod: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    indirim_tipi: Mapped[str] = mapped_column(
        String(10), nullable=False  # 'yuzde' | 'sabit'
    )
    deger: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    min_tutar: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=0
    )
    max_kullanim: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    kullanim_sayisi: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    bitis_tarihi: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<Kupon(kod={self.kod}, tip={self.indirim_tipi}, deger={self.deger})>"
