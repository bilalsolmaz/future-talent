from datetime import datetime
from pydantic import BaseModel


class FavoriToggle(BaseModel):
    urun_id: int


class FavoriResponse(BaseModel):
    id: int
    user_id: int
    urun_id: int
    created_at: datetime
    urun_adi: str | None = None
    urun_fiyat: float | None = None
    urun_resim: str | None = None

    model_config = {"from_attributes": True}
