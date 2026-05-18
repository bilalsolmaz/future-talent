import logging
from abc import ABC, abstractmethod

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class BaseCargoProvider(ABC):
    """
    Kargo entegrasyonu için temel soyut sınıf.
    Yeni bir kargo firması ekleneceği zaman bu sınıftan türetilir.
    (Open/Closed Principle)
    """

    @abstractmethod
    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        """Kargo firmasında gönderi oluşturur ve Takip No döner."""
        pass

    @abstractmethod
    async def get_status(self, takip_no: str) -> dict:
        """
        Kargonun güncel durumunu çeker.
        Dönüş formatı: {"durum": "Teslim Edildi", "konum": "Ankara Şube", "gecikme_var": False}
        """
        pass


class MockCargoProvider(BaseCargoProvider):
    """Geliştirme ortamı için veya API anahtarı yokken çalışan sahte kargo servisi."""

    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        logger.info(f"[MOCK KARGO] Sipariş {siparis_no} için kargo oluşturuldu. Alıcı: {isim}")
        # Sahte bir takip numarası üret (Örn: MCK-123456)
        return f"MCK-{siparis_no.replace('LS-', '')}"

    async def get_status(self, takip_no: str) -> dict:
        logger.info(f"[MOCK KARGO] {takip_no} durumu sorgulanıyor.")
        return {
            "durum": "Taşıma Durumunda",
            "konum": "Transfer Merkezinde",
            "gecikme_var": False
        }


class YurticiKargoProvider(BaseCargoProvider):
    """Yurtiçi Kargo API Entegrasyonu."""

    def __init__(self, api_key: str, api_url: str):
        self.api_key = api_key
        self.api_url = api_url

    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        # Gerçek bir projede httpx ile API isteği atılır
        logger.info(f"[YURTICI KARGO] API isteği atılıyor: {self.api_url}")
        return f"YK-{siparis_no}"

    async def get_status(self, takip_no: str) -> dict:
        # Httpx ile gerçek sorgulama yapılır
        return {
            "durum": "Teslim Edildi",
            "konum": "Teslim Şubesi",
            "gecikme_var": False
        }


def get_cargo_provider() -> BaseCargoProvider:
    """
    Factory metod: Ortam değişkenlerine göre doğru provider'ı döner.
    """
    if settings.YURTICI_API_KEY:
        logger.info("Yurtiçi Kargo Provider seçildi.")
        return YurticiKargoProvider(settings.YURTICI_API_KEY, settings.YURTICI_API_URL)
    
    # Başka kargo firmaları da elif ile buraya eklenebilir.
    
    logger.info("Mock Kargo Provider seçildi.")
    return MockCargoProvider()
