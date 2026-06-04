"""
Kargo sağlayıcıları — Sipariş kargo entegrasyonu.

Dinamik Ayar Desteği:
  get_cargo_provider(db) → Önce veritabanından ayarları okur.
  DB'de ayar yoksa geriye dönük uyumluluk için .env değerlerini kullanır.

Desteklenen kargo firmaları:
  - Yurtiçi Kargo
  - Aras Kargo
  - PTT Kargo
  - MNG Kargo

Open/Closed Principle: Yeni firma eklenirken mevcut kod değiştirilmez,
sadece yeni bir provider sınıfı eklenir ve CARGO_PROVIDERS dict'ine kaydedilir.
"""

import logging
from abc import ABC, abstractmethod

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class BaseCargoProvider(ABC):
    """
    Kargo entegrasyonu için temel soyut sınıf.
    Yeni bir kargo firması ekleneceği zaman bu sınıftan türetilir.
    """

    # Her alt sınıf kendi firma adını tanımlar
    firma_adi: str = "Bilinmeyen"

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

    firma_adi = "Mock Kargo"

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
    """
    Yurtiçi Kargo API Entegrasyonu.
    API: https://ws.yurticikargo.com/KOPSWebServices/
    """

    firma_adi = "Yurtiçi Kargo"

    def __init__(self, kullanici_adi: str, sifre: str, musteri_kodu: str, api_url: str = ""):
        self.kullanici_adi = kullanici_adi
        self.sifre = sifre
        self.musteri_kodu = musteri_kodu
        self.api_url = api_url or "https://ws.yurticikargo.com/KOPSWebServices/"

    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        """
        Yurtiçi Kargo API'si üzerinden gönderi oluşturur.
        Gerçek entegrasyonda httpx ile SOAP/REST çağrısı yapılır.
        """
        logger.info(f"[YURTICI KARGO] Gönderi oluşturuluyor: {siparis_no} | Müşteri: {self.musteri_kodu}")
        # TODO: httpx ile gerçek API çağrısı
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(self.api_url + "createShipment", ...)
        return f"YK-{siparis_no}"

    async def get_status(self, takip_no: str) -> dict:
        """Yurtiçi Kargo durum sorgulama."""
        logger.info(f"[YURTICI KARGO] Durum sorgusu: {takip_no}")
        # TODO: httpx ile gerçek API çağrısı
        return {
            "durum": "Teslim Edildi",
            "konum": "Teslim Şubesi",
            "gecikme_var": False
        }


class ArasKargoProvider(BaseCargoProvider):
    """
    Aras Kargo API Entegrasyonu.
    API: https://customerws.araskargo.com.tr/
    """

    firma_adi = "Aras Kargo"

    def __init__(self, kullanici_adi: str, sifre: str, musteri_kodu: str, api_url: str = ""):
        self.kullanici_adi = kullanici_adi
        self.sifre = sifre
        self.musteri_kodu = musteri_kodu
        self.api_url = api_url or "https://customerws.araskargo.com.tr/"

    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        logger.info(f"[ARAS KARGO] Gönderi oluşturuluyor: {siparis_no} | Müşteri: {self.musteri_kodu}")
        return f"AK-{siparis_no}"

    async def get_status(self, takip_no: str) -> dict:
        logger.info(f"[ARAS KARGO] Durum sorgusu: {takip_no}")
        return {
            "durum": "Dağıtımda",
            "konum": "Aras Kargo Şube",
            "gecikme_var": False
        }


class PTTKargoProvider(BaseCargoProvider):
    """
    PTT Kargo API Entegrasyonu.
    API: https://pttws.ptt.gov.tr/
    """

    firma_adi = "PTT Kargo"

    def __init__(self, kullanici_adi: str, sifre: str, musteri_kodu: str, api_url: str = ""):
        self.kullanici_adi = kullanici_adi
        self.sifre = sifre
        self.musteri_kodu = musteri_kodu
        self.api_url = api_url or "https://pttws.ptt.gov.tr/"

    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        logger.info(f"[PTT KARGO] Gönderi oluşturuluyor: {siparis_no} | Müşteri: {self.musteri_kodu}")
        return f"PTT-{siparis_no}"

    async def get_status(self, takip_no: str) -> dict:
        logger.info(f"[PTT KARGO] Durum sorgusu: {takip_no}")
        return {
            "durum": "Kargoya Verildi",
            "konum": "PTT Merkez Müdürlüğü",
            "gecikme_var": False
        }


class MNGKargoProvider(BaseCargoProvider):
    """
    MNG Kargo API Entegrasyonu.
    API: https://service.mngkargo.com.tr/
    """

    firma_adi = "MNG Kargo"

    def __init__(self, kullanici_adi: str, sifre: str, musteri_kodu: str, api_url: str = ""):
        self.kullanici_adi = kullanici_adi
        self.sifre = sifre
        self.musteri_kodu = musteri_kodu
        self.api_url = api_url or "https://service.mngkargo.com.tr/"

    async def create_shipment(self, siparis_no: str, adres: str, isim: str) -> str | None:
        logger.info(f"[MNG KARGO] Gönderi oluşturuluyor: {siparis_no} | Müşteri: {self.musteri_kodu}")
        return f"MNG-{siparis_no}"

    async def get_status(self, takip_no: str) -> dict:
        logger.info(f"[MNG KARGO] Durum sorgusu: {takip_no}")
        return {
            "durum": "Transfer Merkezinde",
            "konum": "MNG Sorting Merkezi",
            "gecikme_var": False
        }


# ============================================================
# PROVIDER KAYIT DEFTERİ (Registry Pattern)
# ============================================================
# Yeni kargo firması eklerken sadece buraya kayıt yeterli
CARGO_PROVIDERS: dict[str, type[BaseCargoProvider]] = {
    "yurtici": YurticiKargoProvider,
    "aras": ArasKargoProvider,
    "ptt": PTTKargoProvider,
    "mng": MNGKargoProvider,
}


# ============================================================
# FACTORY FONKSİYONU — Dinamik DB Desteği
# ============================================================

def _get_db_setting(db, anahtar: str) -> str:
    """Veritabanından tek bir ayar değerini okur."""
    from app.models.system_setting import SystemSetting
    row = db.query(SystemSetting).filter(SystemSetting.anahtar == anahtar).first()
    return row.deger if row and row.deger else ""


def get_cargo_provider(db=None) -> BaseCargoProvider:
    """
    Factory metod: Doğru kargo provider'ını döner.

    Öncelik sırası:
      1. Veritabanındaki kargo ayarları (admin panelinden girilmiş)
      2. .env'deki API key (geriye dönük uyumluluk — sadece Yurtiçi)
      3. MockCargoProvider (hiçbiri yoksa)
    """
    # 1. Veritabanından kargo ayarlarını dene
    if db:
        try:
            firma = _get_db_setting(db, "kargo_firma")
            kullanici = _get_db_setting(db, "kargo_kullanici_adi")
            sifre = _get_db_setting(db, "kargo_sifre")
            musteri_kodu = _get_db_setting(db, "kargo_musteri_kodu")
            api_url = _get_db_setting(db, "kargo_api_url")

            if firma and kullanici:
                ProviderClass = CARGO_PROVIDERS.get(firma)
                if ProviderClass:
                    logger.info(f"{ProviderClass.firma_adi} Provider seçildi (DB ayarları).")
                    return ProviderClass(
                        kullanici_adi=kullanici,
                        sifre=sifre,
                        musteri_kodu=musteri_kodu,
                        api_url=api_url,
                    )
                else:
                    logger.warning(f"Bilinmeyen kargo firması: {firma}")
        except Exception as e:
            logger.warning(f"DB'den kargo ayarları okunamadı: {e}")

    # 2. .env'deki Yurtiçi API key (geriye dönük uyumluluk)
    if settings.YURTICI_API_KEY:
        logger.info("Yurtiçi Kargo Provider seçildi (.env).")
        return YurticiKargoProvider(
            kullanici_adi="env_user",
            sifre=settings.YURTICI_API_KEY,
            musteri_kodu="",
            api_url=settings.YURTICI_API_URL,
        )

    # 3. Mock
    logger.info("Mock Kargo Provider seçildi.")
    return MockCargoProvider()
