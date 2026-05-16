"""Kupon API Endpoint'leri"""

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.coupon import Kupon
from app.schemas.coupon import KuponCreate, KuponResponse, KuponApply, KuponApplyResponse

router = APIRouter(prefix="/kuponlar", tags=["Kuponlar"])


@router.post("/", response_model=KuponResponse, status_code=201)
def create_kupon(
    data: KuponCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Yeni kupon oluştur (Admin)."""
    existing = db.query(Kupon).filter(Kupon.kod == data.kod.upper()).first()
    if existing:
        raise HTTPException(400, "Bu kupon kodu zaten mevcut.")

    kupon = Kupon(
        kod=data.kod.upper(),
        indirim_tipi=data.indirim_tipi,
        deger=data.deger,
        min_tutar=data.min_tutar,
        max_kullanim=data.max_kullanim,
        bitis_tarihi=data.bitis_tarihi,
    )
    db.add(kupon)
    db.commit()
    db.refresh(kupon)
    return kupon


@router.get("/", response_model=List[KuponResponse])
def list_kuponlar(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Tüm kuponları listele (Admin)."""
    return db.query(Kupon).order_by(Kupon.created_at.desc()).all()


@router.post("/uygula", response_model=KuponApplyResponse)
def apply_kupon(
    data: KuponApply,
    sepet_tutari: float = 0,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user)
):
    """Kupon kodunu doğrula ve indirim hesapla."""
    kupon = db.query(Kupon).filter(Kupon.kod == data.kod.upper()).first()
    if not kupon:
        return KuponApplyResponse(gecerli=False, mesaj="Geçersiz kupon kodu.")

    if not kupon.aktif:
        return KuponApplyResponse(gecerli=False, mesaj="Bu kupon artık aktif değil.")

    if kupon.bitis_tarihi and kupon.bitis_tarihi < datetime.now(timezone.utc):
        return KuponApplyResponse(gecerli=False, mesaj="Bu kuponun süresi dolmuş.")

    if kupon.kullanim_sayisi >= kupon.max_kullanim:
        return KuponApplyResponse(gecerli=False, mesaj="Bu kuponun kullanım limiti dolmuş.")

    if sepet_tutari < float(kupon.min_tutar):
        return KuponApplyResponse(
            gecerli=False,
            mesaj=f"Minimum sepet tutarı ₺{kupon.min_tutar} olmalıdır."
        )

    # İndirim hesapla
    if kupon.indirim_tipi == "yuzde":
        indirim = Decimal(str(sepet_tutari)) * kupon.deger / 100
    else:
        indirim = kupon.deger

    # İndirim sepet tutarını aşamasın
    indirim = min(indirim, Decimal(str(sepet_tutari)))

    return KuponApplyResponse(
        gecerli=True,
        mesaj=f"Kupon uygulandı! ₺{indirim:.2f} indirim.",
        indirim_tutari=indirim,
        indirim_tipi=kupon.indirim_tipi,
        kupon_kodu=kupon.kod,
    )


@router.delete("/{kupon_id}", status_code=204)
def delete_kupon(
    kupon_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Kuponu sil (Admin)."""
    kupon = db.query(Kupon).filter(Kupon.id == kupon_id).first()
    if not kupon:
        raise HTTPException(404, "Kupon bulunamadı.")
    db.delete(kupon)
    db.commit()


@router.patch("/{kupon_id}/toggle", response_model=KuponResponse)
def toggle_kupon(
    kupon_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Kupon aktif/pasif durumunu değiştir (Admin)."""
    kupon = db.query(Kupon).filter(Kupon.id == kupon_id).first()
    if not kupon:
        raise HTTPException(404, "Kupon bulunamadı.")
    kupon.aktif = not kupon.aktif
    db.commit()
    db.refresh(kupon)
    return kupon
