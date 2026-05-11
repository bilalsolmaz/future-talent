"""
Sipariş ve sipariş kalemi modelleri — siparisler & siparis_kalemleri tabloları.

İki tablo arasında one-to-many ilişki var:
  Bir siparişin birden çok kalemi olabilir.

Durum akışı: bekliyor → hazirlaniyor → teslim_edildi / iptal
  Bu bir state machine pattern — her durum sadece belirli durumlara geçebilir.

NOT: Orijinal şemada 'not' alanı vardı. Ancak 'not' hem Python hem SQL'de
  reserved word olduğu için 'notlar' olarak değiştirildi.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Text, Numeric, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Siparis(Base):
    """
    siparisler tablosu.

    cascade="all, delete-orphan":
      Sipariş silinirse, ona ait tüm kalemler de otomatik silinir.
      Orphan (sahipsiz) kalem bırakmaz. Veri bütünlüğü korunur.

    onupdate=func.now():
      Satır güncellendiğinde updated_at otomatik güncellenir.
      Sipariş durumu değiştiğinde "son güncelleme" zamanı otomatik kayıt olur.
    """

    __tablename__ = "siparisler"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    siparis_no: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False,
        default=lambda: f"LS-{uuid.uuid4().hex[:8].upper()}"
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    toplam_tutar: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    durum: Mapped[str] = mapped_column(
        String(20), nullable=False, default="bekliyor"
    )
    adres: Mapped[str] = mapped_column(Text, nullable=False)
    # "not" Python ve SQL'de reserved word → "notlar" kullanıyoruz
    notlar: Mapped[str | None] = mapped_column(Text, nullable=True)
    kupon_kodu: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # İlişkiler
    user: Mapped["User"] = relationship("User")
    kalemler: Mapped[list["SiparisKalemi"]] = relationship(
        "SiparisKalemi",
        back_populates="siparis",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Siparis(id={self.id}, durum={self.durum}, toplam={self.toplam_tutar})>"


class SiparisKalemi(Base):
    """
    siparis_kalemleri tablosu.

    birim_fiyat: Sipariş anındaki fiyat kaydedilir.
    Neden? Ürün fiyatı sonradan değişebilir ama siparişteki fiyat sabit kalmalı.
    Bu "snapshot" pattern olarak bilinir — sipariş anının fotoğrafını çekeriz.
    """

    __tablename__ = "siparis_kalemleri"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    siparis_id: Mapped[int] = mapped_column(
        ForeignKey("siparisler.id"), nullable=False
    )
    urun_id: Mapped[int] = mapped_column(
        ForeignKey("urunler.id"), nullable=False
    )
    adet: Mapped[int] = mapped_column(Integer, nullable=False)
    birim_fiyat: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # İlişkiler
    siparis: Mapped["Siparis"] = relationship("Siparis", back_populates="kalemler")
    urun: Mapped["Urun"] = relationship("Urun", back_populates="siparis_kalemleri")

    def __repr__(self) -> str:
        return f"<SiparisKalemi(urun_id={self.urun_id}, adet={self.adet})>"
