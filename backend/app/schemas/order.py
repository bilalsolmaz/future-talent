"""
Sipariş ve Kalem Pydantic şemaları.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

# ============================================================
# KULLANICI BİLGİSİ (Sipariş yanıtına gömülü)
# ============================================================
class SiparisKullaniciBilgisi(BaseModel):
    """Sipariş yanıtında gösterilecek müşteri bilgileri."""
    id: int
    isim: str
    email: str
    telefon: str | None = None

    model_config = {"from_attributes": True}

# ============================================================
# SİPARİŞ KALEMLERİ
# ============================================================
class SiparisKalemiCreate(BaseModel):
    """Siparişe eklenecek bir ürün."""
    urun_id: int
    adet: int = Field(..., gt=0)

class SiparisKalemiResponse(BaseModel):
    """Sipariş detayı yanıtındaki bir kalem."""
    id: int
    urun_id: int
    urun_adi: str | None = None
    adet: int
    birim_fiyat: Decimal

    model_config = {"from_attributes": True}

# ============================================================
# SİPARİŞLER
# ============================================================
class SiparisCreate(BaseModel):
    """Yeni sipariş oluşturma isteği."""
    adres: str = Field(..., min_length=10)
    notlar: str | None = None
    kupon_kodu: str | None = None
    kalemler: list[SiparisKalemiCreate] = Field(..., min_length=1)

class SiparisDurumUpdate(BaseModel):
    """Sipariş durumu güncelleme isteği (sadece admin)."""
    durum: str = Field(..., pattern="^(bekliyor|onaylandi|hazirlaniyor|kargolandi|teslim_edildi|iptal)$")

class SiparisResponse(BaseModel):
    """Sipariş yanıtı."""
    id: int
    siparis_no: str
    user_id: int
    user: SiparisKullaniciBilgisi | None = None
    toplam_tutar: Decimal
    durum: str
    adres: str
    notlar: str | None
    kupon_kodu: str | None
    created_at: datetime
    updated_at: datetime
    kalemler: list[SiparisKalemiResponse]

    model_config = {"from_attributes": True}
