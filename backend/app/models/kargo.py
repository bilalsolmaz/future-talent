from datetime import datetime

from sqlalchemy import String, Boolean, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class KargoTakip(Base):
    """
    kargo_takip tablosu.
    Siparişlerin kargo durumlarını ve gecikme tespitlerini tutar.
    CargoAgent tarafından güncellenir.
    """

    __tablename__ = "kargo_takip"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    siparis_id: Mapped[int] = mapped_column(ForeignKey("siparisler.id"), nullable=False)
    firma: Mapped[str | None] = mapped_column(String(50), nullable=True)
    takip_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    durum: Mapped[str | None] = mapped_column(String(50), nullable=True)
    son_konum: Mapped[str | None] = mapped_column(Text, nullable=True)
    gecikme_var: Mapped[bool] = mapped_column(Boolean, default=False)
    guncelleme: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # İlişkiler
    siparis: Mapped["Siparis"] = relationship("Siparis")

    def __repr__(self) -> str:
        return f"<KargoTakip(id={self.id}, siparis_id={self.siparis_id}, durum={self.durum})>"
