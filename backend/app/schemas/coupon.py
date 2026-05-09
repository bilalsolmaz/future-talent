from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class KuponCreate(BaseModel):
    kod: str = Field(..., min_length=3, max_length=50)
    indirim_tipi: str = Field(..., pattern="^(yuzde|sabit)$")
    deger: Decimal = Field(..., gt=0)
    min_tutar: Decimal = Field(default=0, ge=0)
    max_kullanim: int = Field(default=100, ge=1)
    bitis_tarihi: datetime | None = None


class KuponApply(BaseModel):
    kod: str


class KuponResponse(BaseModel):
    id: int
    kod: str
    indirim_tipi: str
    deger: Decimal
    min_tutar: Decimal
    max_kullanim: int
    kullanim_sayisi: int
    aktif: bool
    bitis_tarihi: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class KuponApplyResponse(BaseModel):
    gecerli: bool
    mesaj: str
    indirim_tutari: Decimal | None = None
    indirim_tipi: str | None = None
    kupon_kodu: str | None = None
