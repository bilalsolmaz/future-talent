"""
Ürün API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import cast
from sqlalchemy.dialects.postgresql import JSONB
from typing import List, Optional

from app.core.database import get_db
from app.core.security import require_admin
from app.models.product import Urun
from app.models.category import Kategori
from app.schemas.product import UrunCreate, UrunUpdate, UrunResponse

router = APIRouter(prefix="/api/urunler", tags=["Ürünler"])

@router.get("/filtreler")
def get_urun_filtreleri(
    kategori_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Belirli bir kategorideki (veya tüm ürünlerdeki) kullanılabilir dinamik özellikleri (filtreleri) getir.
    Örnek: {"Marka": ["Apple", "Samsung"], "RAM": ["8GB", "16GB"]}
    """
    query = db.query(Urun.ozellikler).filter(Urun.aktif == True, Urun.ozellikler.isnot(None))
    
    if kategori_id:
        query = query.filter(Urun.kategori_id == kategori_id)
        
    urunler = query.all()
    
    filtreler = {}
    for (ozellikler,) in urunler:
        if isinstance(ozellikler, dict):
            for key, value in ozellikler.items():
                if key not in filtreler:
                    filtreler[key] = set()
                filtreler[key].add(value)
                
    # Set'leri listeye çevirip sıralayalım
    sonuc = {}
    for key, values in filtreler.items():
        sonuc[key] = sorted(list(values))
        
    return sonuc

@router.get("/", response_model=List[UrunResponse])
def get_urunler(
    kategori_id: Optional[int] = None,
    q: Optional[str] = None,
    min_fiyat: Optional[float] = None,
    max_fiyat: Optional[float] = None,
    siralama: Optional[str] = None,  # en_yeni, en_ucuz, en_pahali
    sayfa: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Ürünleri listele (herkese açık).
    Filtreler: kategori_id, arama (q), fiyat aralığı, sıralama, sayfalama.
    """
    query = db.query(Urun).filter(Urun.aktif == True)
    
    if kategori_id:
        query = query.filter(Urun.kategori_id == kategori_id)
        
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(Urun.isim.ilike(search_term) | Urun.aciklama.ilike(search_term))

    if min_fiyat is not None:
        query = query.filter(Urun.fiyat >= min_fiyat)
    if max_fiyat is not None:
        query = query.filter(Urun.fiyat <= max_fiyat)

    # Dinamik Filtreleme (ozellikler JSON sütunundan)
    standart_parametreler = {'kategori_id', 'q', 'min_fiyat', 'max_fiyat', 'siralama', 'sayfa', 'limit'}
    if request:
        for key, value in request.query_params.items():
            if key not in standart_parametreler:
                # JSON içerisinde key'in value'ya eşit olup olmadığını kontrol et (örnek: ?Marka=Apple)
                query = query.filter(
                    Urun.ozellikler[key].astext == str(value)
                )

    # Sıralama
    if siralama == "en_ucuz":
        query = query.order_by(Urun.fiyat.asc())
    elif siralama == "en_pahali":
        query = query.order_by(Urun.fiyat.desc())
    else:  # en_yeni (default)
        query = query.order_by(Urun.created_at.desc())
        
    offset = (sayfa - 1) * limit
    return query.offset(offset).limit(limit).all()

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
