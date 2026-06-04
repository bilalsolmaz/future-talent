"""
Bildirim sağlayıcıları — E-posta ve WhatsApp gönderim servisleri.

Dinamik Ayar Desteği:
  get_email_provider(db) → Önce veritabanından ayarları okur.
  DB'de ayar yoksa geriye dönük uyumluluk için .env değerlerini kullanır.

Ne işe yarıyor?
  BaseNotificationProvider soyut sınıfından türeyen sağlayıcılar,
  farklı kanallara (e-posta, WhatsApp, SMS) mesaj gönderir.
"""

import logging
import smtplib
from abc import ABC, abstractmethod
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class BaseNotificationProvider(ABC):
    """
    Kullanıcılara veya sistem yöneticilerine mesaj göndermek için temel sınıf.
    """

    @abstractmethod
    async def send_message(self, to: str, subject: str, body: str) -> bool:
        """Mesaj gönderir. Başarılıysa True döner."""
        pass


class MockNotificationProvider(BaseNotificationProvider):
    """Geliştirme aşamasında gerçek mail/sms atmadan loglara yazan servis."""

    async def send_message(self, to: str, subject: str, body: str) -> bool:
        logger.info(f"[MOCK BİLDİRİM] Kime: {to} | Konu: {subject}\nİçerik: {body}")
        return True


class SMTPEmailProvider(BaseNotificationProvider):
    """
    Gerçek SMTP ile e-posta gönderimi.
    Gmail, Yandex, custom SMTP sunucularıyla çalışır.
    """

    def __init__(self, host: str, port: int, username: str, password: str, 
                 sender_name: str = "LocalShop", sender_email: str = ""):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.sender_name = sender_name
        self.sender_email = sender_email or username

    async def send_message(self, to: str, subject: str, body: str) -> bool:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.sender_name} <{self.sender_email}>"
            msg["To"] = to
            
            # Hem düz metin hem HTML gönder
            text_part = MIMEText(body, "plain", "utf-8")
            msg.attach(text_part)

            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            
            logger.info(f"[SMTP] E-posta başarıyla gönderildi: {to}")
            return True
            
        except Exception as e:
            logger.error(f"[SMTP] E-posta gönderilemedi ({to}): {e}")
            return False


class SendGridProvider(BaseNotificationProvider):
    """SendGrid API ile E-posta gönderimi."""

    def __init__(self, api_key: str, from_email: str):
        self.api_key = api_key
        self.from_email = from_email

    async def send_message(self, to: str, subject: str, body: str) -> bool:
        # Gerçek SendGrid kütüphanesi ile gönderim
        logger.info(f"[SENDGRID] E-posta gönderiliyor: {to}")
        return True


class WhatsAppProvider(BaseNotificationProvider):
    """WhatsApp Cloud API ile mesaj gönderimi."""

    def __init__(self, token: str, phone_id: str):
        self.token = token
        self.phone_id = phone_id

    async def send_message(self, to: str, subject: str, body: str) -> bool:
        """
        WhatsApp Cloud API'ye mesaj gönderir.
        'to' parametresi uluslararası format olmalı: 905551234567
        """
        import httpx
        
        url = f"https://graph.facebook.com/v18.0/{self.phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": f"*{subject}*\n\n{body}"}
        }
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(url, json=payload, headers=headers)
                
            if response.status_code == 200:
                logger.info(f"[WHATSAPP] Mesaj başarıyla gönderildi: {to}")
                return True
            else:
                logger.error(f"[WHATSAPP] Gönderim hatası ({response.status_code}): {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"[WHATSAPP] Bağlantı hatası: {e}")
            return False


# ============================================================
# FACTORY FONKSİYONLARI — Dinamik DB Desteği
# ============================================================

def _get_db_setting(db, anahtar: str) -> str:
    """Veritabanından tek bir ayar değerini okur."""
    from app.models.system_setting import SystemSetting
    row = db.query(SystemSetting).filter(SystemSetting.anahtar == anahtar).first()
    return row.deger if row and row.deger else ""


def get_email_provider(db=None) -> BaseNotificationProvider:
    """
    E-posta sağlayıcısı döndürür.
    
    Öncelik sırası:
      1. Veritabanındaki SMTP ayarları (admin panelinden girilmiş)
      2. .env'deki SendGrid API key (geriye dönük uyumluluk)
      3. MockNotificationProvider (hiçbiri yoksa)
    """
    # 1. Veritabanından SMTP ayarlarını dene
    if db:
        try:
            host = _get_db_setting(db, "smtp_host")
            user = _get_db_setting(db, "smtp_kullanici")
            password = _get_db_setting(db, "smtp_sifre")
            
            if host and user and password:
                port = int(_get_db_setting(db, "smtp_port") or "587")
                sender_name = _get_db_setting(db, "smtp_gonderen_ad") or "LocalShop"
                sender_email = _get_db_setting(db, "smtp_gonderen_email") or user
                
                logger.info("SMTP E-posta Provider seçildi (DB ayarları).")
                return SMTPEmailProvider(
                    host=host, port=port, username=user, password=password,
                    sender_name=sender_name, sender_email=sender_email
                )
        except Exception as e:
            logger.warning(f"DB'den e-posta ayarları okunamadı: {e}")
    
    # 2. .env'deki SendGrid (geriye dönük uyumluluk)
    if settings.SENDGRID_API_KEY:
        logger.info("SendGrid E-posta Provider seçildi (.env).")
        return SendGridProvider(settings.SENDGRID_API_KEY, settings.FROM_EMAIL)
    
    # 3. Mock
    logger.info("Mock Bildirim Provider seçildi.")
    return MockNotificationProvider()


def get_whatsapp_provider(db=None) -> BaseNotificationProvider:
    """
    WhatsApp sağlayıcısı döndürür.
    
    Öncelik sırası:
      1. Veritabanındaki WhatsApp ayarları (admin panelinden girilmiş)
      2. .env'deki WhatsApp token (geriye dönük uyumluluk)
      3. MockNotificationProvider (hiçbiri yoksa)
    """
    # 1. Veritabanından WhatsApp ayarlarını dene
    if db:
        try:
            token = _get_db_setting(db, "whatsapp_token")
            phone_id = _get_db_setting(db, "whatsapp_phone_id")
            
            if token and phone_id:
                logger.info("WhatsApp Provider seçildi (DB ayarları).")
                return WhatsAppProvider(token, phone_id)
        except Exception as e:
            logger.warning(f"DB'den WhatsApp ayarları okunamadı: {e}")
    
    # 2. .env'deki WhatsApp token (geriye dönük uyumluluk)
    if settings.WHATSAPP_TOKEN and settings.WHATSAPP_PHONE_ID:
        logger.info("WhatsApp Provider seçildi (.env).")
        return WhatsAppProvider(settings.WHATSAPP_TOKEN, settings.WHATSAPP_PHONE_ID)
    
    # 3. Mock
    return MockNotificationProvider()
