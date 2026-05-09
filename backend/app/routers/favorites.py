"""Favori (Wishlist) API Endpoint'leri"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.favorite import Favori
from app.models.product import Urun
from app.schemas.favorite import FavoriToggle, FavoriResponse

router = APIRouter(prefix="/api/favoriler", tags=["Favoriler"])


@router.post("/toggle")
def toggle_favori(
    data: FavoriToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Favori ekle/çıkar (toggle)."""
    existing = db.query(Favori).filter(
        Favori.user_id == current_user.id, Favori.urun_id == data.urun_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "urun_id": data.urun_id}
    else:
        # Ürün var mı kontrolü
        urun = db.query(Urun).filter(Urun.id == data.urun_id, Urun.aktif == True).first()
        if not urun:
            raise HTTPException(404, "Ürün bulunamadı.")
        fav = Favori(user_id=current_user.id, urun_id=data.urun_id)
        db.add(fav)
        db.commit()
        return {"status": "added", "urun_id": data.urun_id}


@router.get("/benim", response_model=List[FavoriResponse])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Giriş yapan kullanıcının favorilerini listele."""
    favs = (
        db.query(Favori)
        .options(joinedload(Favori.urun))
        .filter(Favori.user_id == current_user.id)
        .order_by(Favori.created_at.desc())
        .all()
    )
    results = []
    for f in favs:
        f.urun_adi = f.urun.isim if f.urun else None
        f.urun_fiyat = float(f.urun.fiyat) if f.urun else None
        f.urun_resim = f.urun.resim_url if f.urun else None
        results.append(f)
    return results


@router.get("/kontrol/{urun_id}")
def check_favori(
    urun_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ürün favorilerde mi kontrol et."""
    exists = db.query(Favori).filter(
        Favori.user_id == current_user.id, Favori.urun_id == urun_id
    ).first()
    return {"favoride": exists is not None}


@router.get("/ids")
def get_favori_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Favori ürün ID'lerini döndür (toplu kontrol için)."""
    ids = db.query(Favori.urun_id).filter(Favori.user_id == current_user.id).all()
    return [row[0] for row in ids]
