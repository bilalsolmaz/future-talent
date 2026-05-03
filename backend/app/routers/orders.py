"""
Sipariş API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.product import Urun
from app.models.order import Siparis, SiparisKalemi
from app.schemas.order import SiparisCreate, SiparisResponse, SiparisDurumUpdate

router = APIRouter(prefix="/api/siparisler", tags=["Siparişler"])


def _enrich_order(order: Siparis, db: Session) -> Siparis:
    """Sipariş kalemlerine ürün adını ekle."""
    for kalem in order.kalemler:
        urun = db.query(Urun).filter(Urun.id == kalem.urun_id).first()
        kalem.urun_adi = urun.isim if urun else f"Silinmiş Ürün #{kalem.urun_id}"
    return order


@router.post("/", response_model=SiparisResponse, status_code=status.HTTP_201_CREATED)
def create_siparis(
    siparis_in: SiparisCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Yeni sipariş oluştur.
    - Stok kontrolü yapar.
    - Toplam tutarı otomatik hesaplar (sepetteki fiyatlar değil, o anki veritabanı fiyatları).
    - Ürünlerin stoklarını düşer (Transaction).
    """
    toplam_tutar = 0
    kalemler = []
    
    # Tüm ürünleri tek tek kontrol et ve topla
    for kalem in siparis_in.kalemler:
        urun = db.query(Urun).filter(Urun.id == kalem.urun_id, Urun.aktif == True).first()
        if not urun:
            raise HTTPException(status_code=400, detail=f"Ürün (ID: {kalem.urun_id}) bulunamadı veya aktif değil.")
            
        if urun.stok < kalem.adet:
            raise HTTPException(
                status_code=400, 
                detail=f"'{urun.isim}' için yeterli stok yok. Mevcut: {urun.stok}, İstenen: {kalem.adet}"
            )
            
        # Tutar hesapla ve stok düş
        toplam_tutar += urun.fiyat * kalem.adet
        urun.stok -= kalem.adet
        
        # Sipariş kalemini hazırla
        kalemler.append(SiparisKalemi(
            urun_id=urun.id,
            adet=kalem.adet,
            birim_fiyat=urun.fiyat  # O anki fiyat dondurulur (Snapshot)
        ))
        
    # Siparişi oluştur
    yeni_siparis = Siparis(
        user_id=current_user.id,
        toplam_tutar=toplam_tutar,
        adres=siparis_in.adres,
        notlar=siparis_in.notlar,
        kalemler=kalemler
    )
    
    # Transaction commit: Her şey başarılıysa DB'ye kaydet, hata çıkarsa otomatik rollback olur
    db.add(yeni_siparis)
    db.commit()
    db.refresh(yeni_siparis)
    
    return _enrich_order(yeni_siparis, db)

@router.get("/benim", response_model=List[SiparisResponse])
def get_kendi_siparislerim(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mevcut müşterinin kendi siparişlerini listele."""
    orders = (
        db.query(Siparis)
        .options(joinedload(Siparis.user), joinedload(Siparis.kalemler))
        .filter(Siparis.user_id == current_user.id)
        .order_by(Siparis.created_at.desc())
        .all()
    )
    return [_enrich_order(o, db) for o in orders]

@router.get("/", response_model=List[SiparisResponse])
def get_tum_siparisler(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Tüm siparişleri listele (Sadece Admin)."""
    orders = (
        db.query(Siparis)
        .options(joinedload(Siparis.user), joinedload(Siparis.kalemler))
        .order_by(Siparis.created_at.desc())
        .all()
    )
    return [_enrich_order(o, db) for o in orders]

@router.get("/{siparis_id}", response_model=SiparisResponse)
def get_siparis_detay(
    siparis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sipariş detayını getir. Müşteri sadece kendi siparişini görebilir, admin hepsini."""
    siparis = (
        db.query(Siparis)
        .options(joinedload(Siparis.user), joinedload(Siparis.kalemler))
        .filter(Siparis.id == siparis_id)
        .first()
    )
    
    if not siparis:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
        
    if current_user.rol != "admin" and siparis.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu siparişi görüntüleme yetkiniz yok")
        
    return _enrich_order(siparis, db)

@router.patch("/{siparis_id}/durum", response_model=SiparisResponse)
def update_siparis_durumu(
    siparis_id: int,
    durum_in: SiparisDurumUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """Sipariş durumunu güncelle (Sadece Admin)."""
    siparis = db.query(Siparis).filter(Siparis.id == siparis_id).first()
    
    if not siparis:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
        
    # Eğer iptal ediliyorsa ve eski durum iptal değilse, stokları geri yükle
    if durum_in.durum == "iptal" and siparis.durum != "iptal":
        for kalem in siparis.kalemler:
            urun = db.query(Urun).filter(Urun.id == kalem.urun_id).first()
            if urun:
                urun.stok += kalem.adet
                
    # Eğer iptalden geri alınıyorsa, stokları tekrar kontrol et ve düş
    elif siparis.durum == "iptal" and durum_in.durum != "iptal":
        for kalem in siparis.kalemler:
            urun = db.query(Urun).filter(Urun.id == kalem.urun_id).first()
            if not urun or urun.stok < kalem.adet:
                raise HTTPException(status_code=400, detail=f"Siparişi geri almak için yeterli stok yok. ({urun.isim})")
            urun.stok -= kalem.adet
            
    siparis.durum = durum_in.durum
    db.commit()
    db.refresh(siparis)
    return _enrich_order(siparis, db)
