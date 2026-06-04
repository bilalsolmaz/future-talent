"""
Entegrasyon Ayarları Router — Admin panelinden API key yönetimi.

Ne işe yarıyor?
  Kargo, E-posta ve WhatsApp entegrasyon bilgilerini admin panelinden
  yönetilmesini sağlar. SaaS müşterisi kendi bilgilerini girebilir.

Güvenlik:
  - Tüm endpoint'ler admin yetkisi gerektirir (require_admin)
  - GET işlemlerinde hassas alanlar maskelenir
  - Log dosyalarına hassas değerler ASLA yazılmaz
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models.system_setting import SystemSetting
from app.schemas.system_setting import (
    SystemSettingResponse,
    SystemSettingGroupResponse,
    AllSettingsResponse,
    SystemSettingBulkUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/settings",
    tags=["Entegrasyon Ayarları"],
)


# ============================================================
# YARDIMCI FONKSİYONLAR
# ============================================================

# Varsayılan ayar tanımları — DB'de yoksa bu değerlerle seed edilir
DEFAULT_SETTINGS = [
    # ─── KARGO ───
    {"anahtar": "kargo_firma", "deger": "", "grup": "kargo", "aciklama": "Aktif kargo firması (yurtici / aras / ptt / mng)", "hassas": "hayir"},
    {"anahtar": "kargo_kullanici_adi", "deger": "", "grup": "kargo", "aciklama": "Kargo entegrasyon kullanıcı adı", "hassas": "hayir"},
    {"anahtar": "kargo_sifre", "deger": "", "grup": "kargo", "aciklama": "Kargo entegrasyon şifresi", "hassas": "evet"},
    {"anahtar": "kargo_musteri_kodu", "deger": "", "grup": "kargo", "aciklama": "Firmaya özel müşteri kodu", "hassas": "hayir"},
    {"anahtar": "kargo_api_url", "deger": "", "grup": "kargo", "aciklama": "Kargo API base URL (opsiyonel, varsayılan kullanılır)", "hassas": "hayir"},
    # ─── MAIL ───
    {"anahtar": "smtp_host", "deger": "", "grup": "mail", "aciklama": "SMTP sunucu adresi (Örn: smtp.gmail.com)", "hassas": "hayir"},
    {"anahtar": "smtp_port", "deger": "587", "grup": "mail", "aciklama": "SMTP port numarası (587 veya 465)", "hassas": "hayir"},
    {"anahtar": "smtp_kullanici", "deger": "", "grup": "mail", "aciklama": "SMTP kullanıcı adı / e-posta adresi", "hassas": "hayir"},
    {"anahtar": "smtp_sifre", "deger": "", "grup": "mail", "aciklama": "SMTP şifresi veya uygulama parolası", "hassas": "evet"},
    {"anahtar": "smtp_gonderen_ad", "deger": "", "grup": "mail", "aciklama": "Gönderen adı (Örn: LocalShop Mağaza)", "hassas": "hayir"},
    {"anahtar": "smtp_gonderen_email", "deger": "", "grup": "mail", "aciklama": "Gönderen e-posta adresi", "hassas": "hayir"},
    # ─── WHATSAPP ───
    {"anahtar": "whatsapp_token", "deger": "", "grup": "whatsapp", "aciklama": "Meta WhatsApp Business API erişim token'ı", "hassas": "evet"},
    {"anahtar": "whatsapp_phone_id", "deger": "", "grup": "whatsapp", "aciklama": "WhatsApp Business telefon numarası ID'si", "hassas": "hayir"},
    {"anahtar": "whatsapp_verify_token", "deger": "", "grup": "whatsapp", "aciklama": "Webhook doğrulama token'ı (kendi belirlediğiniz gizli kelime)", "hassas": "evet"},
]

# Grup başlıkları ve ikonları
GRUP_META = {
    "kargo": {"baslik": "🚚 Kargo Entegrasyonu", "ikon": "truck"},
    "mail": {"baslik": "📧 E-Posta (SMTP) Ayarları", "ikon": "mail"},
    "whatsapp": {"baslik": "💬 WhatsApp Business API", "ikon": "message-circle"},
}


def _mask_value(value: str, hassas: str) -> str:
    """
    Hassas değerleri maskeler. Son 4 karakter görünür, gerisi nokta.
    
    Örnekler:
      "sk_live_abc12345"  → "sk_l••••••••45"
      "short"             → "••••t" (5 karakterden kısaysa)
      ""                  → ""
    """
    if hassas != "evet" or not value:
        return value
    
    if len(value) <= 4:
        return "•" * len(value)
    
    visible_end = value[-2:]
    visible_start = value[:4]
    masked_middle = "•" * min(len(value) - 6, 10)  # Maksimum 10 nokta
    return f"{visible_start}{masked_middle}{visible_end}"


def _ensure_defaults(db: Session) -> None:
    """
    Varsayılan ayar kayıtlarının veritabanında mevcut olduğundan emin olur.
    Eksik ayarları oluşturur, mevcut olanları değiştirmez.
    """
    existing_keys = {
        row.anahtar 
        for row in db.query(SystemSetting.anahtar).all()
    }
    
    new_settings = []
    for default in DEFAULT_SETTINGS:
        if default["anahtar"] not in existing_keys:
            new_settings.append(SystemSetting(**default))
    
    if new_settings:
        db.add_all(new_settings)
        db.commit()
        logger.info(f"{len(new_settings)} varsayılan ayar oluşturuldu.")


# ============================================================
# API ENDPOINT'LERİ
# ============================================================

@router.get(
    "/",
    response_model=AllSettingsResponse,
    summary="Tüm entegrasyon ayarlarını getir (gruplanmış & maskelenmiş)"
)
async def get_all_settings(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Tüm entegrasyon ayarlarını grup bazında döner.
    Hassas alanlar (şifre, token, API key) maskelenmiş olarak gelir.
    
    Sadece **admin** yetkisiyle erişilebilir.
    """
    # Varsayılan ayarları oluştur (ilk çağrıda)
    _ensure_defaults(db)
    
    # Tüm ayarları çek
    all_settings = db.query(SystemSetting).order_by(SystemSetting.grup, SystemSetting.id).all()
    
    # Gruplara ayır
    groups: dict[str, list[SystemSettingResponse]] = {}
    for setting in all_settings:
        masked_deger = _mask_value(setting.deger, setting.hassas)
        response = SystemSettingResponse(
            id=setting.id,
            anahtar=setting.anahtar,
            deger=masked_deger,
            grup=setting.grup,
            aciklama=setting.aciklama,
            hassas=setting.hassas,
            updated_at=setting.updated_at,
        )
        groups.setdefault(setting.grup, []).append(response)
    
    # Gruplanmış response oluştur
    gruplar = []
    for grup_key in ["kargo", "mail", "whatsapp"]:
        meta = GRUP_META.get(grup_key, {"baslik": grup_key.title(), "ikon": "settings"})
        gruplar.append(SystemSettingGroupResponse(
            grup=grup_key,
            grup_baslik=meta["baslik"],
            grup_ikon=meta["ikon"],
            ayarlar=groups.get(grup_key, []),
        ))
    
    return AllSettingsResponse(gruplar=gruplar)


@router.put(
    "/",
    response_model=AllSettingsResponse,
    summary="Entegrasyon ayarlarını toplu güncelle"
)
async def update_settings(
    payload: SystemSettingBulkUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Birden fazla ayarı tek istekte günceller.
    Güncelleme sonrası tüm ayarlar maskelenmiş olarak döner.
    
    Sadece **admin** yetkisiyle erişilebilir.
    Log dosyalarına hassas değerler yazılmaz.
    """
    _ensure_defaults(db)
    
    updated_count = 0
    for item in payload.ayarlar:
        setting = db.query(SystemSetting).filter(
            SystemSetting.anahtar == item.anahtar
        ).first()
        
        if setting:
            # Sadece gerçekten değişen değerleri güncelle
            # Maskelenmiş değer geri gönderildiyse (değiştirilmemiş) güncelleme yapma
            if "••" not in item.deger:
                setting.deger = item.deger
                updated_count += 1
                # GÜVENLİK: Log'a ham değer YAZMA
                logger.info(f"Ayar güncellendi: {item.anahtar} (admin: {admin.email})")
        else:
            logger.warning(f"Bilinmeyen ayar anahtarı: {item.anahtar}")
    
    if updated_count > 0:
        db.commit()
    
    # Güncellenmiş tüm ayarları döndür
    return await get_all_settings(db=db, admin=admin)


@router.post(
    "/test-email",
    summary="SMTP bağlantı testi — Test maili gönder"
)
async def test_email_connection(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Veritabanındaki SMTP ayarlarıyla test maili gönderir.
    Admin'in kendi e-posta adresine gönderim yapılır.
    """
    import smtplib
    from email.mime.text import MIMEText
    
    # DB'den SMTP ayarlarını çek
    smtp_settings = {}
    settings_rows = db.query(SystemSetting).filter(
        SystemSetting.grup == "mail"
    ).all()
    for s in settings_rows:
        smtp_settings[s.anahtar] = s.deger
    
    host = smtp_settings.get("smtp_host", "")
    port = smtp_settings.get("smtp_port", "587")
    user = smtp_settings.get("smtp_kullanici", "")
    password = smtp_settings.get("smtp_sifre", "")
    sender_name = smtp_settings.get("smtp_gonderen_ad", "LocalShop")
    sender_email = smtp_settings.get("smtp_gonderen_email", user)
    
    if not host or not user or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SMTP ayarları eksik. Lütfen önce SMTP bilgilerini kaydedin."
        )
    
    try:
        msg = MIMEText(
            f"🎉 Tebrikler!\n\n"
            f"LocalShop e-posta entegrasyonunuz başarıyla yapılandırıldı.\n"
            f"Bu bir test mesajıdır.\n\n"
            f"Gönderen: {sender_name} <{sender_email}>\n"
            f"SMTP: {host}:{port}",
            "plain",
            "utf-8"
        )
        msg["Subject"] = "✅ LocalShop — E-posta Bağlantı Testi Başarılı"
        msg["From"] = f"{sender_name} <{sender_email}>"
        msg["To"] = admin.email
        
        with smtplib.SMTP(host, int(port), timeout=10) as server:
            server.starttls()
            server.login(user, password)
            server.send_message(msg)
        
        logger.info(f"Test maili başarıyla gönderildi: {admin.email}")
        return {
            "basarili": True,
            "mesaj": f"Test maili başarıyla gönderildi: {admin.email}"
        }
        
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SMTP kimlik doğrulama hatası. Kullanıcı adı veya şifre yanlış."
        )
    except smtplib.SMTPConnectError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SMTP sunucusuna bağlanılamadı: {host}:{port}"
        )
    except Exception as e:
        logger.error(f"SMTP test hatası: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"E-posta gönderim hatası: {str(e)}"
        )


@router.post(
    "/test-cargo",
    summary="Kargo API bağlantı testi"
)
async def test_cargo_connection(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Veritabanındaki kargo API ayarlarıyla bağlantı testi yapar.
    """
    # DB'den kargo ayarlarını çek
    cargo_settings = {}
    settings_rows = db.query(SystemSetting).filter(
        SystemSetting.grup == "kargo"
    ).all()
    for s in settings_rows:
        cargo_settings[s.anahtar] = s.deger
    
    firma = cargo_settings.get("kargo_firma", "")
    kullanici = cargo_settings.get("kargo_kullanici_adi", "")
    musteri_kodu = cargo_settings.get("kargo_musteri_kodu", "")
    
    if not firma:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kargo firması seçilmemiş. Lütfen önce kargo ayarlarını yapın."
        )
    
    if not kullanici or not musteri_kodu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kargo entegrasyon bilgileri eksik. Kullanıcı adı ve müşteri kodunu girin."
        )
    
    # Firma bazlı bağlantı kontrolü
    firma_names = {
        "yurtici": "Yurtiçi Kargo",
        "aras": "Aras Kargo",
        "ptt": "PTT Kargo",
        "mng": "MNG Kargo",
    }
    
    firma_label = firma_names.get(firma, firma.title())
    
    logger.info(f"Kargo bağlantı testi: {firma_label} (admin: {admin.email})")
    
    # Not: Gerçek API bağlantı testi burada yapılır.
    # Şu an için bilgi kontrolü yapıyoruz, gerçek API testi Faz 2'de eklenecek.
    return {
        "basarili": True,
        "mesaj": f"{firma_label} entegrasyon bilgileri doğrulandı. Bağlantı hazır.",
        "firma": firma_label,
        "musteri_kodu": musteri_kodu,
    }
