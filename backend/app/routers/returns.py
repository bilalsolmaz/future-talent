"""
İade API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.product import Urun
from app.models.order import Siparis
from app.models.returns import Iade
from app.schemas.returns import IadeCreate, IadeResponse, IadeDurumUpdate

router = APIRouter(prefix="/iadeler", tags=["İadeler"])


def _enrich_return(iade: Iade) -> Iade:
    """İade yanıtına sipariş numarasını ekle."""
    if iade.siparis:
        iade.siparis_no = iade.siparis.siparis_no
    return iade


@router.post("/", response_model=IadeResponse, status_code=status.HTTP_201_CREATED)
def create_iade(
    iade_in: IadeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Yeni iade talebi oluştur (Müşteri).
    - Sipariş mevcut kullanıcıya ait olmalı.
    - Sipariş teslim edilmiş veya kargolanmış durumda olmalı.
    - Aynı sipariş için birden fazla aktif iade talebi oluşturulamaz.
    """
    # Siparişi kontrol et
    siparis = db.query(Siparis).filter(Siparis.id == iade_in.siparis_id).first()
    if not siparis:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    
    if siparis.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu sipariş size ait değil.")
    
    # Sipariş durumunu kontrol et
    if siparis.durum not in ("teslim_edildi", "kargolandi", "onaylandi"):
        raise HTTPException(
            status_code=400,
            detail="Sadece onaylanmış, kargoda veya teslim edilmiş siparişler için iade talebi oluşturabilirsiniz."
        )
    
    # Aynı sipariş için aktif (bekleyen) iade var mı?
    existing = db.query(Iade).filter(
        Iade.siparis_id == iade_in.siparis_id,
        Iade.durum == "bekliyor"
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Bu sipariş için zaten bekleyen bir iade talebi var. (İade No: {existing.iade_no})"
        )
    
    # İade oluştur
    yeni_iade = Iade(
        siparis_id=siparis.id,
        user_id=current_user.id,
        sebep_kategori=iade_in.sebep_kategori,
        sebep_aciklama=iade_in.sebep_aciklama,
        iade_tutari=siparis.toplam_tutar,
    )
    
    db.add(yeni_iade)
    db.commit()
    db.refresh(yeni_iade)
    
    # İlişkileri yükle
    db.refresh(yeni_iade, ["user", "siparis"])
    return _enrich_return(yeni_iade)


@router.get("/benim", response_model=List[IadeResponse])
def get_kendi_iadelerim(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mevcut müşterinin kendi iade taleplerini listele."""
    iadeler = (
        db.query(Iade)
        .options(joinedload(Iade.user), joinedload(Iade.siparis))
        .filter(Iade.user_id == current_user.id)
        .order_by(Iade.created_at.desc())
        .all()
    )
    return [_enrich_return(i) for i in iadeler]


@router.get("/", response_model=List[IadeResponse])
def get_tum_iadeler(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Tüm iade taleplerini listele (Sadece Admin)."""
    iadeler = (
        db.query(Iade)
        .options(joinedload(Iade.user), joinedload(Iade.siparis))
        .order_by(Iade.created_at.desc())
        .all()
    )
    return [_enrich_return(i) for i in iadeler]


@router.get("/{iade_id}", response_model=IadeResponse)
def get_iade_detay(
    iade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """İade detayını getir."""
    iade = (
        db.query(Iade)
        .options(joinedload(Iade.user), joinedload(Iade.siparis))
        .filter(Iade.id == iade_id)
        .first()
    )
    
    if not iade:
        raise HTTPException(status_code=404, detail="İade talebi bulunamadı.")
    
    if current_user.rol != "admin" and iade.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu iadeyi görüntüleme yetkiniz yok.")
    
    return _enrich_return(iade)


@router.patch("/{iade_id}/durum", response_model=IadeResponse)
def update_iade_durumu(
    iade_id: int,
    durum_in: IadeDurumUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    İade durumunu güncelle (Sadece Admin).
    - Onaylanırsa: Siparişteki ürünlerin stokları geri yüklenir.
    - Reddedilirse: Admin notu eklenir.
    """
    iade = (
        db.query(Iade)
        .options(joinedload(Iade.siparis))
        .filter(Iade.id == iade_id)
        .first()
    )
    
    if not iade:
        raise HTTPException(status_code=404, detail="İade talebi bulunamadı.")
    
    if iade.durum != "bekliyor":
        raise HTTPException(status_code=400, detail="Bu iade talebi zaten işlenmiş.")
    
    # Onay: Stokları geri yükle
    if durum_in.durum == "onaylandi":
        siparis = iade.siparis
        for kalem in siparis.kalemler:
            urun = db.query(Urun).filter(Urun.id == kalem.urun_id).first()
            if urun:
                urun.stok += kalem.adet
    
    iade.durum = durum_in.durum
    iade.admin_notu = durum_in.admin_notu
    
    db.commit()
    db.refresh(iade)
    db.refresh(iade, ["user", "siparis"])
    return _enrich_return(iade)
