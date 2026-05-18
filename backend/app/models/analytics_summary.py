from datetime import datetime

from sqlalchemy import Integer, String, Numeric, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnalitikOzet(Base):
    """
    analitik_ozet tablosu.
    AnalyticsAgent tarafından veritabanındaki yoğun sorgular yapılarak hesaplanan 
    değerler (ciro, dönüşüm oranı vb.) periyodik olarak (örneğin saatlik) buraya kaydedilir.
    Dashboard bu veriyi kullanarak hızlı yüklenir (Pre-aggregation).
    """

    __tablename__ = "analitik_ozet"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    periyot: Mapped[str] = mapped_column(String(20), nullable=False) # 'gunluk', 'haftalik', 'aylik' vb.
    donem_baslangic: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    donem_bitis: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Metrikler
    toplam_satis: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    siparis_sayisi: Mapped[int] = mapped_column(Integer, default=0)
    yeni_musteri: Mapped[int] = mapped_column(Integer, default=0)
    iade_orani: Mapped[float] = mapped_column(Numeric(5, 2), default=0) # Yüzde olarak
    
    # Popüler Kategoriler ve Ürünler
    top_kategoriler: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    top_urunler: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    hesaplanma: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<AnalitikOzet(periyot={self.periyot}, siparis={self.siparis_sayisi})>"
