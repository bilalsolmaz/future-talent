from datetime import datetime
from pydantic import BaseModel, Field


class YorumCreate(BaseModel):
    urun_id: int
    puan: int = Field(..., ge=1, le=5)
    yorum: str = Field(..., min_length=5, max_length=1000)


class YorumResponse(BaseModel):
    id: int
    user_id: int
    urun_id: int
    puan: int
    yorum: str
    created_at: datetime
    kullanici_adi: str | None = None

    model_config = {"from_attributes": True}
