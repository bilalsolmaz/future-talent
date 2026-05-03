"""
Güvenlik araçları: şifre hash'leme ve JWT token yönetimi.

Ne işe yarıyor?
  1. Şifreleri bcrypt ile hash'ler (geri dönüşümsüz, tek yönlü)
  2. JWT token oluşturur ve doğrular (access + refresh)
  3. FastAPI dependency olarak mevcut kullanıcıyı çıkarır

Alternatifi ne olurdu?
  - Session-based auth: Her request'te DB sorgusu gerekir, stateless değil
  - OAuth2 sadece (Google/GitHub login): Dış sağlayıcıya bağımlılık

Neden JWT seçtik?
  Stateless — DB'ye sormadan token içinden kullanıcıyı çıkarabiliyoruz.
  Microservice mimarilere geçiş kolay. Mobil uygulamalarla da uyumlu.
"""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db

settings = get_settings()

# ============================================================
# ŞİFRE HASH'LEME (bcrypt)
# ============================================================
# bcrypt: yavaş hash algoritması — brute-force saldırıyı zorlaştırır
# rounds=12: her hash işlemi ~250ms sürer (bilerek yavaş, güvenlik için)
# Alternatif: argon2 (daha yeni) ama bcrypt endüstri standardı
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    """Düz metin şifreyi bcrypt ile hash'le. Geri dönüşüm MÜMKÜN DEĞİL."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kullanıcının girdiği şifreyi veritabanındaki hash ile karşılaştır."""
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================
# JWT TOKEN YÖNETİMİ
# ============================================================
# OAuth2PasswordBearer: HTTP header'dan "Authorization: Bearer <token>" çıkarır
# tokenUrl: Swagger UI'daki "Authorize" butonu bu URL'i kullanır
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_access_token(data: dict) -> str:
    """
    Access token oluştur — kısa ömürlü (varsayılan 30 dk).
    Her API isteğinde gönderilir. Süresi dolunca refresh token ile yenilenir.

    data parametresi tipik olarak: {"sub": str(user.id)} içerir.
    "sub" (subject) JWT standardında kullanıcı kimliğini temsil eder.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """
    Refresh token oluştur — uzun ömürlü (varsayılan 7 gün).
    Sadece access token yenilemek için kullanılır.
    Her giriş yapıldığında yeni bir çift (access + refresh) oluşturulur.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> dict:
    """
    Token'ı doğrula ve payload'ı (içerik) döndür.
    Geçersizse veya süresi dolmuşsa 401 Unauthorized fırlatır.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        # Token türü kontrolü — access token ile refresh işlemi yapılmasın
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz token türü",
            )
        return payload
    except JWTError:
        raise credentials_exception


# ============================================================
# FASTAPI DEPENDENCY'LERİ — Korumalı Endpoint'ler İçin
# ============================================================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    JWT'den mevcut kullanıcıyı çıkarır.

    Bu bir FastAPI `Depends()` fonksiyonudur. Korumalı bir endpoint'e
    eklediğinde, o endpoint'e sadece geçerli token'ı olan kullanıcılar erişebilir.

    Kullanımı:
        @router.get("/profil")
        def profil(user = Depends(get_current_user)):
            return {"email": user.email}
    """
    # Lazy import — circular import'u önler
    # (security.py → User model → database.py → security.py döngüsü olmaması için)
    from app.models.user import User

    payload = verify_token(token, token_type="access")
    user_id: str | None = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz — kullanıcı kimliği bulunamadı",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı — hesap silinmiş olabilir",
        )

    return user


async def require_admin(
    current_user=Depends(get_current_user),
):
    """
    Sadece admin rolüne izin verir. Admin olmayan kullanıcı 403 Forbidden alır.

    Kullanımı:
        @router.post("/urunler")
        def urun_ekle(admin = Depends(require_admin), ...):
            ...  # Sadece admin erişebilir
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli",
        )
    return current_user
