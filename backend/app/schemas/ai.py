"""
Yapay Zeka (Gemini) Pydantic şemaları.
"""

from pydantic import BaseModel, Field

class AIAciklamaRequest(BaseModel):
    """AI'dan ürün açıklaması istemek için gönderilen veri."""
    urun_adi: str = Field(..., min_length=2, max_length=255)
    fiyat: float = Field(..., gt=0)
    ekstra_not: str | None = None

class AIAciklamaResponse(BaseModel):
    """AI'dan dönen ürün açıklaması."""
    aciklama: str

class ChatRequest(BaseModel):
    """Müşteri Agent'ına gönderilen mesaj isteği."""
    mesaj: str = Field(..., min_length=1)
    session_id: str = Field(..., min_length=5)

class ChatResponse(BaseModel):
    """Müşteri Agent'ından dönen yanıt."""
    yanit: str
