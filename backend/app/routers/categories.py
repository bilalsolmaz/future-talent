"""
Kategori API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify  # slug üretmek için

from app.core.database import get_db
from app.core.security import require_admin
from app.models.category import Kategori
from app.schemas.category import KategoriCreate, KategoriUpdate, KategoriResponse

router = APIRouter(prefix="/api/kategoriler", tags=["Kategoriler"])

@router.get("/", response_model=list[KategoriResponse])
def get_kategoriler(db: Session = Depends(get_db)):
    """Tüm kategorileri listele (herkese açık)."""
    return db.query(Kategori).all()

@router.post("/", response_model=KategoriResponse, status_code=status.HTTP_201_CREATED)
def create_kategori(
    kategori_in: KategoriCreate, 
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Yeni kategori oluştur (Sadece Admin). Otomatik slug üretir."""
    # Slug oluştur (örn: "Sıcak İçecekler" -> "sicak-icecekler")
    slug = slugify(kategori_in.isim)
    
    # Slug çakışması var mı?
    if db.query(Kategori).filter(Kategori.slug == slug).first():
        # Eşsiz yapmak için zaman damgası eklenebilir, şimdilik basit hata dönüyoruz
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu isimde bir kategori zaten mevcut (slug çakışması)."
        )
    
    yeni_kategori = Kategori(isim=kategori_in.isim, slug=slug)
    db.add(yeni_kategori)
    db.commit()
    db.refresh(yeni_kategori)
    return yeni_kategori

@router.put("/{kategori_id}", response_model=KategoriResponse)
def update_kategori(
    kategori_id: int, 
    kategori_in: KategoriUpdate, 
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Kategori güncelle (Sadece Admin)."""
    kategori = db.query(Kategori).filter(Kategori.id == kategori_id).first()
    if not kategori:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
        
    kategori.isim = kategori_in.isim
    kategori.slug = slugify(kategori_in.isim)
    
    # Kendi ID'si hariç slug çakışması kontrolü
    if db.query(Kategori).filter(Kategori.slug == kategori.slug, Kategori.id != kategori_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu isimde başka bir kategori zaten mevcut."
        )
        
    db.commit()
    db.refresh(kategori)
    return kategori

@router.delete("/{kategori_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kategori(
    kategori_id: int, 
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Kategori sil (Sadece Admin). 
    NOT: Eğer kategoriye bağlı ürünler varsa silinemez (Foreign Key Constraint)."""
    kategori = db.query(Kategori).filter(Kategori.id == kategori_id).first()
    if not kategori:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
        
    db.delete(kategori)
    db.commit()
    return None
