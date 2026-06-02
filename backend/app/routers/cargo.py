"""
Kargo Takip REST API Yönlendiricisi.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.kargo import KargoTakip
from app.models.order import Siparis
from app.schemas.kargo import KargoTakipResponse
from app.agents.cargo import CargoAgent

router = APIRouter(prefix="/cargo/track", tags=["Kargo Takip"])

@router.get("/", response_model=List[KargoTakipResponse])
def get_kargo_takipleri(
    gecikme_var: bool | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Tüm kargo takip kayıtlarını listele (Sadece Admin).
    - `gecikme_var` parametresi ile gecikme durumuna göre filtreleme yapılabilir.
    """
    query = (
        select(KargoTakip)
        .options(joinedload(KargoTakip.siparis).joinedload(Siparis.user))
        .order_by(KargoTakip.guncelleme.desc())
    )
    
    if gecikme_var is not None:
        query = query.where(KargoTakip.gecikme_var == gecikme_var)
        
    query = query.limit(limit).offset(offset)
    results = db.execute(query).scalars().all()
    return results

@router.get("/{siparis_id}", response_model=KargoTakipResponse)
def get_siparis_kargo_detayi(
    siparis_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Belirli bir siparişin kargo detayını getirir.
    - Müşteriler sadece kendi siparişlerini görebilir, Admin tüm siparişleri görebilir.
    """
    # Siparişi sorgula ve yetki kontrolü yap
    siparis = db.execute(
        select(Siparis).where(Siparis.id == siparis_id)
    ).scalar_one_or_none()
    
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı."
        )
        
    if current_user.rol != "admin" and siparis.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu siparişin kargo durumunu sorgulama yetkiniz yok."
        )
        
    # Kargo takip kaydını sorgula
    kargo_takip = db.execute(
        select(KargoTakip)
        .options(joinedload(KargoTakip.siparis).joinedload(Siparis.user))
        .where(KargoTakip.siparis_id == siparis_id)
    ).scalar_one_or_none()
    
    if not kargo_takip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu sipariş için henüz bir kargo takip kaydı oluşturulmamış."
        )
        
    return kargo_takip

@router.post("/trigger")
async def trigger_kargo_kontrol(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    CargoAgent'ı manuel tetikler ve kargo durumlarını günceller (Sadece Admin).
    """
    try:
        agent = CargoAgent(db)
        await agent.execute()
        return {"mesaj": "Kargo durum sorgulamaları ve gecikme tespitleri tamamlandı."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Kargo takibi tetiklenirken hata oluştu: {str(e)}"
        )
