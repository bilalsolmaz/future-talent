"""
Stok Uyarıları Pydantic şemaları.
"""

from datetime import datetime
from pydantic import BaseModel
from app.schemas.product import UrunResponse

class StokUyarisiBase(BaseModel):
    urun_id: int
    esik: int
    mevcut_stok: int
    oneri: str | None = None
    durum: str = "acik"

class StokUyarisiResolve(BaseModel):
    durum: str = "kapatildi"

class StokUyarisiResponse(StokUyarisiBase):
    id: int
    tetiklenme: datetime
    kapatilma: datetime | None = None
    urun: UrunResponse | None = None

    model_config = {"from_attributes": True}
