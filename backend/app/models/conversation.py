from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AgentKonusma(Base):
    """
    agent_konusmalar tablosu.
    Kullanıcıların veya misafirlerin CustomerAgent ile yaptıkları konuşmaları tutar.
    Konuşma geçmişi (context) Gemini'ye gönderilmek için buradan çekilir.
    """

    __tablename__ = "agent_konusmalar"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    mesajlar: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    kanal: Mapped[str] = mapped_column(String(20), default="web") # 'web' | 'whatsapp'
    olusturulma: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    son_aktif: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # İlişkiler
    user: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<AgentKonusma(session_id={self.session_id}, kanal={self.kanal})>"
