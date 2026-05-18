from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BriefingGecmisi(Base):
    """
    briefing_gecmisi tablosu.
    WorkflowAgent tarafından her sabah 08:00'de oluşturulan günlük raporlar tutulur.
    Aynı gün için birden fazla oluşturmayı engellemek için `tarih` alanı unique'dir.
    """

    __tablename__ = "briefing_gecmisi"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tarih: Mapped[date] = mapped_column(Date, unique=True, nullable=False)
    icerik: Mapped[dict] = mapped_column(JSON, nullable=False)
    gonderildi: Mapped[bool] = mapped_column(Boolean, default=False)
    olusturulma: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<BriefingGecmisi(tarih={self.tarih}, gonderildi={self.gonderildi})>"
