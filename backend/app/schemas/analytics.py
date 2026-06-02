"""
Analitik Özet Pydantic şemaları.
"""

from datetime import datetime
from pydantic import BaseModel

class AnalitikOzetBase(BaseModel):
    periyot: str
    donem_baslangic: datetime
    donem_bitis: datetime
    toplam_satis: float
    siparis_sayisi: int
    yeni_musteri: int
    iade_orani: float
    top_kategoriler: dict | list | None = None
    top_urunler: dict | list | None = None

class AnalitikOzetResponse(AnalitikOzetBase):
    id: int
    hesaplanma: datetime

    model_config = {"from_attributes": True}
