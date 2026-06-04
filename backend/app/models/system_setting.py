"""
Sistem Ayarları modeli — Dinamik entegrasyon yönetimi için anahtar-değer deposu.

Ne işe yarıyor?
  Kargo API anahtarları, SMTP bilgileri, WhatsApp token'ları gibi
  entegrasyon bilgilerini veritabanında saklar. Bu sayede her müşteri
  (SaaS modeli) kendi API anahtarlarını admin panelinden girebilir
  ve .env dosyasına dokunmak gerekmez.

Neden veritabanında?
  - SaaS / White-label: Her müşteri firma kendi bilgilerini girer
  - Sıcak güncelleme: Uygulama yeniden başlatılmadan ayar değişir
  - Güvenlik: Faz 2'de AES-256 şifreleme eklenebilir
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import validates

from app.core.database import Base


class SystemSetting(Base):
    """
    Dinamik sistem ayarları tablosu.
    
    Her satır bir anahtar-değer çiftidir.
    `grup` alanı UI'da gruplu gösterim için kullanılır.
    
    Örnek kayıtlar:
      anahtar="smtp_host",       deger="smtp.gmail.com",    grup="mail"
      anahtar="yurtici_api_key", deger="abc123",            grup="kargo"
      anahtar="whatsapp_token",  deger="EAAx...",           grup="whatsapp"
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Ayar anahtarı — benzersiz, Örn: "smtp_host", "kargo_firma", "whatsapp_token"
    anahtar = Column(String(100), unique=True, nullable=False, index=True)
    
    # Ayar değeri — API anahtarı, URL, şifre vb.
    deger = Column(Text, nullable=False, default="")
    
    # Grup adı — UI'da sekmeli gösterim için. Örn: "kargo", "mail", "whatsapp"
    grup = Column(String(50), nullable=False, default="genel", index=True)
    
    # UI'da yardımcı bilgi göstermek için. Örn: "Yurtiçi Kargo API Anahtarı"
    aciklama = Column(String(255), nullable=True, default="")
    
    # Hassas alan mı? (şifre, token, API key) — maskeleme için kullanılır
    hassas = Column(String(10), nullable=False, default="hayir")
    
    # Zaman damgaları
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    @validates("grup")
    def validate_grup(self, key, value):
        """Grup adı sadece izin verilen değerlerden biri olmalı."""
        allowed = {"kargo", "mail", "whatsapp", "genel"}
        if value not in allowed:
            raise ValueError(f"Geçersiz grup: {value}. İzin verilenler: {allowed}")
        return value

    def __repr__(self):
        return f"<SystemSetting(anahtar='{self.anahtar}', grup='{self.grup}')>"
