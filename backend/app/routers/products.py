"""
Ürün API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import require_admin
from app.models.product import Urun
from app.models.category import Kategori
from app.schemas.product import UrunCreate, UrunUpdate, UrunResponse

router = APIRouter(prefix="/api/urunler", tags=["Ürünler"])

@router.get("/", response_model=List[UrunResponse])
def get_urunler(
    kategori_id: Optional[int] = None,
    q: Optional[str] = None,
    sayfa: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Ürünleri listele (herkese açık).
    Sadece aktif=True olanları getirir.
    Filtreler: kategori_id, arama (q), sayfalama.
    """
    query = db.query(Urun).filter(Urun.aktif == True)
    
    if kategori_id:
        query = query.filter(Urun.kategori_id == kategori_id)
        
    if q:
        # ILIKE (case-insensitive) benzeri bir arama (PostgreSQL'e özgü)
        # SQLAlchemy func.lower() ile evrensel yapılabilir
        search_term = f"%{q.lower()}%"
        query = query.filter(Urun.isim.ilike(search_term) | Urun.aciklama.ilike(search_term))
        
    offset = (sayfa - 1) * limit
    return query.order_by(Urun.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/{urun_id}", response_model=UrunResponse)
def get_urun(urun_id: int, db: Session = Depends(get_db)):
    """Ürün detayını getir."""
    urun = db.query(Urun).filter(Urun.id == urun_id, Urun.aktif == True).first()
    if not urun:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı veya pasif")
    return urun

@router.post("/", response_model=UrunResponse, status_code=status.HTTP_201_CREATED)
def create_urun(
    urun_in: UrunCreate, 
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Yeni ürün ekle (Sadece Admin)."""
    # Kategori kontrolü
    if urun_in.kategori_id:
        kategori = db.query(Kategori).filter(Kategori.id == urun_in.kategori_id).first()
        if not kategori:
            raise HTTPException(status_code=400, detail="Belirtilen kategori bulunamadı")
            
    yeni_urun = Urun(**urun_in.model_dump())
    db.add(yeni_urun)
    db.commit()
    db.refresh(yeni_urun)
    return yeni_urun

@router.put("/{urun_id}", response_model=UrunResponse)
def update_urun(
    urun_id: int, 
    urun_in: UrunUpdate, 
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Ürünü güncelle (Sadece Admin). Sadece gönderilen alanlar güncellenir."""
    urun = db.query(Urun).filter(Urun.id == urun_id).first()
    if not urun:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
        
    if urun_in.kategori_id:
        kategori = db.query(Kategori).filter(Kategori.id == urun_in.kategori_id).first()
        if not kategori:
            raise HTTPException(status_code=400, detail="Belirtilen kategori bulunamadı")

    update_data = urun_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(urun, key, value)
        
    db.commit()
    db.refresh(urun)
    return urun

@router.delete("/{urun_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_urun(
    urun_id: int, 
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Ürünü sil (Sadece Admin).
    Veritabanından fiziksel olarak silmez, aktif=False yapar (Soft Delete).
    Sipariş geçmişi bozulmaması için bu önemlidir.
    """
    urun = db.query(Urun).filter(Urun.id == urun_id).first()
    if not urun:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
        
    urun.aktif = False
    db.commit()
    return None
