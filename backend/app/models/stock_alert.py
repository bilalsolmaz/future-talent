from datetime import datetime

from sqlalchemy import Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StokUyarisi(Base):
    """
    stok_uyarilari tablosu.
    Ürün stokları eşiğin altına düştüğünde StockAgent tarafından oluşturulur.
    Admin uyarıyı dikkate alınca (örneğin stok ekleyince) 'kapatildi' olarak işaretlenir.
    """

    __tablename__ = "stok_uyarilari"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"), nullable=False)
    esik: Mapped[int] = mapped_column(Integer, nullable=False)
    mevcut_stok: Mapped[int] = mapped_column(Integer, nullable=False)
    oneri: Mapped[str | None] = mapped_column(Text, nullable=True) # Gemini yenileme önerisi
    durum: Mapped[str] = mapped_column(String(20), default="acik") # 'acik' | 'kapatildi'
    tetiklenme: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    kapatilma: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # İlişkiler
    urun: Mapped["Urun"] = relationship("Urun")

    def __repr__(self) -> str:
        return f"<StokUyarisi(urun_id={self.urun_id}, durum={self.durum})>"
