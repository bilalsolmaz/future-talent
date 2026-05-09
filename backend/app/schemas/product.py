"""
Ürün Pydantic şemaları.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class UrunBase(BaseModel):
    """Ürün ortak alanları."""
    isim: str = Field(..., min_length=2, max_length=255)
    aciklama: str | None = None
    fiyat: Decimal = Field(..., gt=0)
    stok: int = Field(default=0, ge=0)
    kategori_id: int | None = None
    resim_url: str | None = None
    ozellikler: dict | None = None

class UrunCreate(UrunBase):
    """Ürün oluşturma isteği."""
    pass

class UrunUpdate(BaseModel):
    """Ürün güncelleme isteği (tüm alanlar opsiyonel)."""
    isim: str | None = Field(None, min_length=2, max_length=255)
    aciklama: str | None = None
    fiyat: Decimal | None = Field(None, gt=0)
    stok: int | None = Field(None, ge=0)
    kategori_id: int | None = None
    resim_url: str | None = None
    ozellikler: dict | None = None
    aktif: bool | None = None

class UrunResponse(UrunBase):
    """Ürün yanıtı."""
    id: int
    aktif: bool
    created_at: datetime

    model_config = {"from_attributes": True}
