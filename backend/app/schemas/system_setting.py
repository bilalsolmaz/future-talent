"""
Sistem Ayarları Pydantic şemaları — API request/response modelleri.

Güvenlik kuralı:
  - API response'larda hassas alanlar (şifre, token, API key) ASLA düz metin dönmez.
  - Backend tarafında maskelenir: "sk_live_abc123" → "sk_l••••••23" (son 4 karakter)
  - Frontend'de ek maskeleme YAPILMAZ, güvenlik backend'in sorumluluğundadır.
"""

from datetime import datetime
from pydantic import BaseModel, Field


# ============================================================
# RESPONSE ŞEMAlARI
# ============================================================

class SystemSettingResponse(BaseModel):
    """
    Tekil ayar bilgisi — API'den dönerken hassas alanlar maskelenir.
    """
    id: int
    anahtar: str
    deger: str  # Backend'de maskelenmiş olarak gelir
    grup: str
    aciklama: str | None = ""
    hassas: str = "hayir"
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class SystemSettingGroupResponse(BaseModel):
    """
    Gruplanmış ayarlar — UI'da sekme/kart gösterimi için.
    Örn: { grup: "kargo", ayarlar: [...] }
    """
    grup: str
    grup_baslik: str  # UI'da gösterilecek başlık, Örn: "Kargo Entegrasyonu"
    grup_ikon: str    # Lucide ikon adı, Örn: "truck"
    ayarlar: list[SystemSettingResponse]


class AllSettingsResponse(BaseModel):
    """
    Tüm ayarların gruplanmış hali — GET /settings/ endpoint'inin dönüşü.
    """
    gruplar: list[SystemSettingGroupResponse]


# ============================================================
# REQUEST ŞEMALARı
# ============================================================

class SystemSettingUpdate(BaseModel):
    """
    Tekil ayar güncelleme isteği.
    """
    anahtar: str = Field(..., description="Güncellenecek ayarın anahtarı, Örn: smtp_host")
    deger: str = Field(..., description="Yeni değer")


class SystemSettingBulkUpdate(BaseModel):
    """
    Toplu ayar güncelleme isteği — PUT /settings/ endpoint'i için.
    Birden fazla ayar tek istekte güncellenir.
    """
    ayarlar: list[SystemSettingUpdate] = Field(
        ..., 
        description="Güncellenecek ayar listesi",
        min_length=1
    )
