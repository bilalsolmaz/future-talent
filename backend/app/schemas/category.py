"""
Kategori Pydantic şemaları.
"""

from datetime import datetime
from pydantic import BaseModel, Field

class KategoriBase(BaseModel):
    """Kategori ortak alanları."""
    isim: str = Field(..., min_length=2, max_length=100)

class KategoriCreate(KategoriBase):
    """Kategori oluşturma isteği."""
    pass

class KategoriUpdate(KategoriBase):
    """Kategori güncelleme isteği."""
    pass

class KategoriResponse(KategoriBase):
    """Kategori yanıtı."""
    id: int
    slug: str
    created_at: datetime

    model_config = {"from_attributes": True}
