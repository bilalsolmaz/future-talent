"""
İade Pydantic şemaları.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.order import SiparisKullaniciBilgisi


class IadeCreate(BaseModel):
    """Yeni iade talebi oluşturma isteği (müşteri)."""
    siparis_id: int
    sebep_kategori: str = Field(
        ..., pattern="^(hasarli|yanlis_urun|beden_uyumsuz|kalite|vazgecme|diger)$"
    )
    sebep_aciklama: str = Field(..., min_length=10, max_length=1000)


class IadeDurumUpdate(BaseModel):
    """İade durumu güncelleme (admin)."""
    durum: str = Field(..., pattern="^(onaylandi|reddedildi)$")
    admin_notu: str | None = Field(None, max_length=500)


class IadeResponse(BaseModel):
    """İade yanıtı."""
    id: int
    iade_no: str
    siparis_id: int
    user_id: int
    user: SiparisKullaniciBilgisi | None = None
    sebep_kategori: str
    sebep_aciklama: str
    iade_tutari: Decimal
    durum: str
    admin_notu: str | None
    created_at: datetime
    updated_at: datetime
    # Sipariş bilgileri (iç içe gösterim için)
    siparis_no: str | None = None

    model_config = {"from_attributes": True}
