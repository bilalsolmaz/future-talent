"""
Ürün modeli — urunler tablosu.

aktif alanı: Soft delete mekanizması.
  Ürün silindiğinde veritabanından kaldırılmaz, aktif=False yapılır.
  Neden? Sipariş geçmişinde ürün bilgisi kaybolmasın diye.
  Müşteriler sadece aktif=True olan ürünleri görür.

fiyat: NUMERIC(10,2) — kuruş hassasiyetinde. Float KULLANMA (yuvarlama hataları!)
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    String,
    Text,
    Numeric,
    Integer,
    Boolean,
    ForeignKey,
    DateTime,
    func,
    JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Urun(Base):
    """
    urunler tablosu.

    Decimal kullanımı önemli:
      float → 0.1 + 0.2 = 0.30000000000000004 (hata!)
      Decimal → 0.1 + 0.2 = 0.3 (doğru!)
    Para hesaplamalarında HER ZAMAN Decimal kullanılmalı.
    """

    __tablename__ = "urunler"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    isim: Mapped[str] = mapped_column(String(255), nullable=False)
    aciklama: Mapped[str | None] = mapped_column(Text, nullable=True)
    fiyat: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stok: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    kategori_id: Mapped[int | None] = mapped_column(
        ForeignKey("kategoriler.id"), nullable=True
    )
    resim_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ozellikler: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # İlişkiler
    kategori: Mapped["Kategori"] = relationship("Kategori", back_populates="urunler")
    siparis_kalemleri: Mapped[list["SiparisKalemi"]] = relationship("SiparisKalemi", back_populates="urun")

    def __repr__(self) -> str:
        return f"<Urun(id={self.id}, isim={self.isim}, fiyat={self.fiyat})>"
