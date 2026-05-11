"""
Yorum modeli — yorumlar tablosu.

Müşteriler satın aldıkları ürünlere 1-5 yıldız puanlama ve
yorum bırakabilir. Her kullanıcı, aynı ürüne yalnızca 1 yorum
yazabilir.
"""

from datetime import datetime

from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Yorum(Base):
    """
    yorumlar tablosu.

    UniqueConstraint: Aynı kullanıcının aynı ürüne birden fazla
    yorum bırakmasını engeller.
    """

    __tablename__ = "yorumlar"
    __table_args__ = (
        UniqueConstraint("user_id", "urun_id", name="uq_user_urun_yorum"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    urun_id: Mapped[int] = mapped_column(ForeignKey("urunler.id"), nullable=False)
    puan: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    yorum: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # İlişkiler
    user: Mapped["User"] = relationship("User")
    urun: Mapped["Urun"] = relationship("Urun", backref="yorumlar")

    def __repr__(self) -> str:
        return f"<Yorum(id={self.id}, puan={self.puan}, user_id={self.user_id})>"
