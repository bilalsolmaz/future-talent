"""
Kimlik dogrulama (Auth) Pydantic semalari.

TokenResponse: Login ve refresh sonrasi donen JWT token cifti + kullanici bilgisi.
RefreshRequest: Refresh token gondermek icin istek semasi.
"""

from pydantic import BaseModel

from app.schemas.user import UserResponse


class TokenResponse(BaseModel):
    """
    Login/refresh yanitinda donen token bilgisi.

    access_token:  Kisa omurlu (30dk), her API isteginde gonderilir
    refresh_token: Uzun omurlu (7 gun), sadece token yenilemede kullanilir
    token_type:    Her zaman "bearer" — Authorization: Bearer <token>
    user:          Kullanici bilgisi — frontend'in ekstra istek yapmasina gerek kalmaz
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    """Refresh token ile yeni token cifti istemek icin."""

    refresh_token: str
