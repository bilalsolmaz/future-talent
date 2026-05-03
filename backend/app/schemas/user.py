"""
Kullanici Pydantic semalari — request/response validasyonu.

Ne ise yariyor?
  FastAPI'ye gelen isteklerin dogru formatta oldugundan emin olur.
  Ornegin: email gecerli mi? Sifre yeterince uzun mu?
  Ayrica response'lari sekillendirir (password_hash disari cikmaz!)

Alternatifi ne olurdu?
  Elle validation (if len(password) < 6: raise...) — her yerde tekrar
  Marshmallow — populer ama FastAPI native Pydantic kullanir

Neden Pydantic?
  FastAPI ile entegre, otomatik Swagger dokumantasyonu,
  tip guvenligi, hata mesajlari otomatik JSON formatinda.
"""

import re
from datetime import datetime

from pydantic import BaseModel, field_validator


class UserCreate(BaseModel):
    """
    Kullanici kayit istegi.

    field_validator ile email ve sifre kurallari kontrol edilir.
    Validation basarisiz olursa FastAPI otomatik 422 hatasi dondurur
    ve hangi alanin neden hatali oldugunu JSON olarak aciklar.
    """

    email: str
    password: str
    isim: str
    telefon: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Email formatini kontrol et ve kucuk harfe cevir."""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Gecerli bir email adresi girin")
        return v.lower().strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Sifre en az 6 karakter olmali."""
        if len(v) < 6:
            raise ValueError("Sifre en az 6 karakter olmali")
        return v

    @field_validator("isim")
    @classmethod
    def validate_isim(cls, v: str) -> str:
        """Isim bos olamaz."""
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Isim en az 2 karakter olmali")
        return v


class UserResponse(BaseModel):
    """
    Kullanici yanit semasi — disariya donen veri.

    model_config = {"from_attributes": True}:
      SQLAlchemy model objesini direkt Pydantic modele cevirir.
      Eski Pydantic v1'de bu 'orm_mode = True' idi.

    NOT: password_hash BURADA YOK — disariya asla cikmaz!
    Bu guvenlik icin kritik. Kullanici bilgisi dondururken
    sadece guvenli alanlari gosteriyoruz.
    """

    id: int
    email: str
    rol: str
    isim: str
    telefon: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
