"""
Kimlik dogrulama (Authentication) endpoint'leri.

Bu dosya 4 endpoint icerir:
  POST /api/auth/register — Yeni kullanici kaydi
  POST /api/auth/login    — Giris yap, JWT token al
  POST /api/auth/refresh  — Refresh token ile yeni token al
  GET  /api/auth/me       — Mevcut kullanicinin bilgilerini getir

OAuth2PasswordRequestForm nedir?
  OAuth2 standardi — login icin `username` ve `password` form field'lari bekler.
  Biz `username` alanina email yaziyoruz. Bu Swagger UI'daki "Authorize"
  butonunun da otomatik calismasi icin gerekli.

  Frontend'ten login istegi gondermek icin:
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    await axios.post('/api/auth/login', formData);
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    verify_password,
    verify_token,
)
from app.models.user import User
from app.schemas.auth import RefreshRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Kimlik Dogrulama"])


# ============================================================
# KAYIT (REGISTER)
# ============================================================
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yeni kullanici kaydi",
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Yeni kullanici olusturur.

    - Email unique olmali (ayni email ile iki kez kayit olunamaz)
    - Sifre bcrypt ile hash'lenir, duz metin SAKLANMAZ
    - Varsayilan rol: 'musteri'
    - Admin olusturmak icin veritabanindan rol degistirilir (guvenlik)
    """
    # 1. Email daha once kullanilmis mi kontrol et
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email adresi zaten kayitli",
        )

    # 2. Yeni kullanici olustur (sifre hash'lenerek kaydedilir)
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        isim=user_data.isim,
        telefon=user_data.telefon,
    )

    # 3. Veritabanina kaydet
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # ID ve created_at degerlerini DB'den al

    return new_user


# ============================================================
# GIRIS (LOGIN)
# ============================================================
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Kullanici girisi",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Email + sifre ile giris yap, JWT token cifti al.

    **Swagger UI'da:** "username" alanina EMAIL adresinizi girin.

    Basarili giris sonrasi donen tokenler:
    - `access_token`: API isteklerinde kullanilir (30dk omur)
    - `refresh_token`: Access token yenilemek icin (7 gun omur)

    Guvenlik notu:
    - Yanlis email VEYA yanlis sifrede ayni hata mesaji doner
    - Bu, saldirgana "email kayitli mi?" bilgisini vermemek icindir
    """
    # 1. Kullaniciyi email ile bul
    user = db.query(User).filter(User.email == form_data.username).first()

    # 2. Kullanici yoksa VEYA sifre yanlis ise — ayni hata mesaji!
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya sifre hatali",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. JWT token cifti olustur
    # "sub" (subject) = kullanici ID'si, JWT standardinda kullanici kimligini temsil eder
    token_data = {"sub": str(user.id)}

    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "user": user,  # Pydantic UserResponse'a otomatik donusur
    }


# ============================================================
# TOKEN YENILEME (REFRESH)
# ============================================================
@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Token yenile",
)
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    """
    Refresh token ile yeni access + refresh token al.

    Access token suresi dolunca (30dk) bu endpoint cagrilir.
    Frontend bunu otomatik yapar (axios interceptor ile).

    Neden yeni refresh token da donuyoruz?
    - "Token rotation" — her kullanimda refresh token da yenilenir
    - Calinti token'in omrunu sinirlar (guvenlik)
    """
    # 1. Refresh token'i dogrula
    payload = verify_token(request.refresh_token, token_type="refresh")
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecersiz refresh token",
        )

    # 2. Kullanicinin hala var oldugundan emin ol
    # (Hesap silinmis olabilir, token hala gecerli kalmasin)
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanici bulunamadi",
        )

    # 3. Yeni token cifti olustur
    token_data = {"sub": str(user.id)}

    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "user": user,
    }


# ============================================================
# MEVCUT KULLANICI (ME)
# ============================================================
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Mevcut kullanici bilgisi",
)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Oturum acmis kullanicinin bilgilerini dondurur.

    Bu endpoint:
    - Frontend sayfa yuklendiginde "kullanici hala giris yapmis mi?" kontrolu icin
    - Profil sayfasinda kullanici bilgilerini gostermek icin kullanilir

    Authorization header'da gecerli bir Bearer token gerektirir.
    """
    return current_user


# ============================================================
# PROFİL GÜNCELLEME
# ============================================================
from pydantic import BaseModel, Field
from typing import Optional as Opt

class ProfilGuncelle(BaseModel):
    isim: Opt[str] = Field(None, min_length=2, max_length=100)
    telefon: Opt[str] = Field(None, max_length=20)

class SifreDegistir(BaseModel):
    mevcut_sifre: str
    yeni_sifre: str = Field(..., min_length=6)


@router.patch("/profil", response_model=UserResponse, summary="Profil güncelle")
def update_profile(
    data: ProfilGuncelle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcı profil bilgilerini güncelle."""
    if data.isim is not None:
        current_user.isim = data.isim
    if data.telefon is not None:
        current_user.telefon = data.telefon
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/sifre-degistir", summary="Şifre değiştir")
def change_password(
    data: SifreDegistir,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mevcut şifreyi doğrulayarak yeni şifre belirle."""
    if not verify_password(data.mevcut_sifre, current_user.password_hash):
        raise HTTPException(400, "Mevcut şifreniz hatalı.")
    current_user.password_hash = hash_password(data.yeni_sifre)
    db.commit()
    return {"mesaj": "Şifreniz başarıyla değiştirildi."}
