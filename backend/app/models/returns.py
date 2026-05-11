"""
İade talebi modeli — iadeler tablosu.

Durum akışı: bekliyor → onaylandi / reddedildi
  Admin inceleme sonucu onaylar veya reddeder.
  Onaylanırsa stoklar otomatik geri yüklenir.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Text, Numeric, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Iade(Base):
    """
    iadeler tablosu.

    Bir sipariş için iade talebi oluşturulabilir.
    İade onaylanınca ürünler stoğa geri eklenir.
    """

    __tablename__ = "iadeler"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    iade_no: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False,
        default=lambda: f"IA-{uuid.uuid4().hex[:8].upper()}"
    )
    siparis_id: Mapped[int] = mapped_column(ForeignKey("siparisler.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # İade sebebi kategorileri
    sebep_kategori: Mapped[str] = mapped_column(
        String(50), nullable=False, default="diger"
    )  # 'hasarli', 'yanlis_urun', 'beden_uyumsuz', 'kalite', 'vazgecme', 'diger'
    
    sebep_aciklama: Mapped[str] = mapped_column(Text, nullable=False)
    
    # İade tutarı (sipariş toplam tutarından kopyalanır)
    iade_tutari: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Durum: bekliyor, onaylandi, reddedildi
    durum: Mapped[str] = mapped_column(
        String(20), nullable=False, default="bekliyor"
    )
    
    # Admin yanıtı (onay/ret sebebi)
    admin_notu: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # İlişkiler
    siparis: Mapped["Siparis"] = relationship("Siparis", backref="iadeler")
    user: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<Iade(id={self.id}, iade_no={self.iade_no}, durum={self.durum})>"
