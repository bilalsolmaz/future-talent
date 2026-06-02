"""
Stok Uyarıları REST API Yönlendiricisi.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.core.security import require_admin
from app.models.stock_alert import StokUyarisi
from app.schemas.stock_alert import StokUyarisiResponse, StokUyarisiResolve
from app.agents.stock import StockAgent

router = APIRouter(prefix="/stock/alerts", tags=["Stok Uyarıları"])

@router.get("/", response_model=List[StokUyarisiResponse])
def get_stok_uyarilari(
    durum: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Tüm stok uyarılarını listele (Sadece Admin).
    - `durum` parametresi ile 'acik' veya 'kapatildi' filtresi uygulanabilir.
    """
    query = select(StokUyarisi).order_by(StokUyarisi.tetiklenme.desc())
    
    if durum:
        query = query.where(StokUyarisi.durum == durum)
        
    query = query.limit(limit).offset(offset)
    results = db.execute(query).scalars().all()
    return results

@router.post("/trigger", response_model=List[StokUyarisiResponse])
async def trigger_stok_kontrol(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    StockAgent'ı manuel tetikler ve yeni stok uyarılarını hesaplar (Sadece Admin).
    """
    try:
        agent = StockAgent(db)
        yeni_uyarilar = await agent.execute()
        return yeni_uyarilar
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stok kontrolü tetiklenirken hata oluştu: {str(e)}"
        )

@router.patch("/{alert_id}/resolve", response_model=StokUyarisiResponse)
def resolve_stok_uyarisi(
    alert_id: int,
    istek: StokUyarisiResolve,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Kritik stok uyarısını kapatır/çözümler (Sadece Admin).
    """
    uyari = db.execute(
        select(StokUyarisi).where(StokUyarisi.id == alert_id)
    ).scalar_one_or_none()
    
    if not uyari:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Belirtilen stok uyarısı bulunamadı."
        )
        
    uyari.durum = istek.durum
    if istek.durum == "kapatildi":
        uyari.kapatilma = datetime.now(timezone.utc)
    else:
        uyari.kapatilma = None
        
    db.commit()
    db.refresh(uyari)
    return uyari
