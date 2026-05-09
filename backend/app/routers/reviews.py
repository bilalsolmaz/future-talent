"""Yorum (Review) API Endpoint'leri"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func as sa_func
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.review import Yorum
from app.models.order import Siparis, SiparisKalemi
from app.schemas.review import YorumCreate, YorumResponse

router = APIRouter(prefix="/api/yorumlar", tags=["Yorumlar"])


def _enrich(y: Yorum) -> Yorum:
    y.kullanici_adi = y.user.isim if y.user else "Anonim"
    return y


@router.post("/", response_model=YorumResponse, status_code=201)
def create_yorum(
    data: YorumCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ürüne yorum yaz (sadece satın alan müşteriler)."""
    # Ürünü satın almış mı?
    bought = (
        db.query(SiparisKalemi)
        .join(Siparis)
        .filter(
            Siparis.user_id == current_user.id,
            SiparisKalemi.urun_id == data.urun_id,
            Siparis.durum.in_(["teslim_edildi", "kargolandi", "onaylandi"])
        )
        .first()
    )
    if not bought:
        raise HTTPException(400, "Bu ürüne yorum yapabilmek için önce satın almış olmanız gerekir.")

    existing = db.query(Yorum).filter(
        Yorum.user_id == current_user.id, Yorum.urun_id == data.urun_id
    ).first()
    if existing:
        raise HTTPException(400, "Bu ürüne zaten yorum yapmışsınız.")

    yorum = Yorum(
        user_id=current_user.id,
        urun_id=data.urun_id,
        puan=data.puan,
        yorum=data.yorum,
    )
    db.add(yorum)
    db.commit()
    db.refresh(yorum)
    db.refresh(yorum, ["user"])
    return _enrich(yorum)


@router.get("/urun/{urun_id}", response_model=List[YorumResponse])
def get_urun_yorumlari(urun_id: int, db: Session = Depends(get_db)):
    """Ürüne ait yorumları listele."""
    yorumlar = (
        db.query(Yorum)
        .options(joinedload(Yorum.user))
        .filter(Yorum.urun_id == urun_id)
        .order_by(Yorum.created_at.desc())
        .all()
    )
    return [_enrich(y) for y in yorumlar]


@router.get("/urun/{urun_id}/ozet")
def get_urun_yorum_ozeti(urun_id: int, db: Session = Depends(get_db)):
    """Ürünün puan özeti (ortalama, toplam yorum sayısı, dağılım)."""
    result = db.query(
        sa_func.count(Yorum.id).label("toplam"),
        sa_func.avg(Yorum.puan).label("ortalama"),
    ).filter(Yorum.urun_id == urun_id).first()

    # Puan dağılımı (1-5)
    dagilim = {}
    for p in range(1, 6):
        cnt = db.query(sa_func.count(Yorum.id)).filter(
            Yorum.urun_id == urun_id, Yorum.puan == p
        ).scalar()
        dagilim[str(p)] = cnt

    return {
        "toplam": result.toplam or 0,
        "ortalama": round(float(result.ortalama or 0), 1),
        "dagilim": dagilim,
    }


@router.delete("/{yorum_id}", status_code=204)
def delete_yorum(
    yorum_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Yorumu sil (sahibi veya admin)."""
    yorum = db.query(Yorum).filter(Yorum.id == yorum_id).first()
    if not yorum:
        raise HTTPException(404, "Yorum bulunamadı.")
    if yorum.user_id != current_user.id and current_user.rol != "admin":
        raise HTTPException(403, "Bu yorumu silme yetkiniz yok.")
    db.delete(yorum)
    db.commit()
