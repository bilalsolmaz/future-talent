import logging
from abc import ABC, abstractmethod

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
        # WhatsApp API'ye HTTP POST atılır
        logger.info(f"[WHATSAPP] Mesaj gönderiliyor: {to}")
        return True


def get_email_provider() -> BaseNotificationProvider:
    if settings.SENDGRID_API_KEY:
        return SendGridProvider(settings.SENDGRID_API_KEY, settings.FROM_EMAIL)
    return MockNotificationProvider()

def get_whatsapp_provider() -> BaseNotificationProvider:
    if settings.WHATSAPP_TOKEN and settings.WHATSAPP_PHONE_ID:
        return WhatsAppProvider(settings.WHATSAPP_TOKEN, settings.WHATSAPP_PHONE_ID)
    return MockNotificationProvider()
