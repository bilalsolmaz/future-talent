"""
Analitik Insights REST API Yönlendiricisi.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import require_admin
from app.models.analytics_summary import AnalitikOzet
from app.schemas.analytics import AnalitikOzetResponse
from app.agents.analytics import AnalyticsAgent

router = APIRouter(prefix="/analytics/insights", tags=["Analitik Insights"])

@router.get("/", response_model=List[AnalitikOzetResponse])
def get_analitik_ozetler(
    periyot: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Tüm analitik özet raporlarını listele (Sadece Admin).
    - `periyot` parametresi ('gunluk', 'haftalik', 'aylik') ile filtrelenebilir.
    - `hesaplanma` zamanına göre azalan (en yeniden en eskiye) sıralanır.
    """
    query = select(AnalitikOzet).order_by(AnalitikOzet.hesaplanma.desc())
    
    if periyot:
        query = query.where(AnalitikOzet.periyot == periyot)
        
    query = query.limit(limit).offset(offset)
    results = db.execute(query).scalars().all()
    return results

@router.get("/latest", response_model=AnalitikOzetResponse)
def get_son_analitik_ozet(
    periyot: str = "gunluk",
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Belirli bir periyot için hesaplanmış en son analitik raporu getirir (Sadece Admin).
    - Varsayılan periyot 'gunluk' değeridir.
    """
    ozet = db.execute(
        select(AnalitikOzet)
        .where(AnalitikOzet.periyot == periyot)
        .order_by(AnalitikOzet.hesaplanma.desc())
        .limit(1)
    ).scalar_one_or_none()
    
    if not ozet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{periyot}' periyodunda henüz hiçbir analitik özet raporu hesaplanmamış."
        )
        
    return ozet

@router.post("/trigger", response_model=AnalitikOzetResponse)
async def trigger_analitik_hesaplama(
    periyot: str = "gunluk",
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    AnalyticsAgent'ı manuel tetikler ve anlık metrikleri hesaplayıp DB'ye kaydeder (Sadece Admin).
    - `periyot` parametresi: 'gunluk' | 'haftalik' | 'aylik' (Varsayılan: 'gunluk')
    """
    if periyot not in ["gunluk", "haftalik", "aylik"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz periyot. Sadece 'gunluk', 'haftalik' veya 'aylik' desteklenmektedir."
        )
        
    try:
        agent = AnalyticsAgent(db)
        yeni_ozet = await agent.execute(periyot=periyot)
        return yeni_ozet
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analitik özet hesaplanırken hata oluştu: {str(e)}"
        )
