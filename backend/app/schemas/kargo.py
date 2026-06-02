"""
Kargo Takip Pydantic şemaları.
"""

from datetime import datetime
from pydantic import BaseModel
from app.schemas.order import SiparisResponse

class KargoTakipBase(BaseModel):
    siparis_id: int
    firma: str | None = None
    takip_no: str | None = None
    durum: str | None = None
    son_konum: str | None = None
    gecikme_var: bool = False

class KargoTakipResponse(KargoTakipBase):
    id: int
    guncelleme: datetime
    siparis: SiparisResponse | None = None

    model_config = {"from_attributes": True}
