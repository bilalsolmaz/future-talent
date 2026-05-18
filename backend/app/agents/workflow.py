from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.agents.base import BaseAgent
from app.models.briefing import BriefingGecmisi
from app.models.order import Siparis
from app.models.stock_alert import StokUyarisi
from app.models.kargo import KargoTakip
from app.services.notification_provider import get_email_provider


class WorkflowAgent(BaseAgent):
    """
    Sistemin Genel Müdürü.
    Her sabah tüm sistemin genel fotoğrafını (satışlar, stoklar, gecikmeler)
    çekerek admin'e günlük bir Briefing sunar.
    """

    AGENT_NAME = "WorkflowAgent"
    SYSTEM_INSTRUCTION = """
    Sen LocalShop e-ticaret platformunun sistem yöneticisi ve genel müdürüsün.
    Sana verilen sistem verilerini analiz ederek, mağaza sahibine her sabah 
    okuyacağı profesyonel, motive edici ve eyleme geçirilebilir bir "Günlük Brifing" yazacaksın.
    Format:
    1. Kısa bir günaydın ve genel durum özeti
    2. Acil ilgilenilmesi gerekenler (stok, kargo gecikmesi)
    3. İyi giden şeyler (yeni siparişler vb.)
    """

    def __init__(self, db: Session):
        super().__init__(db)
        self.email = get_email_provider()

    async def execute(self, **kwargs) -> BriefingGecmisi | None:
        """
        1. DB'den son 24 saatin veya genel durumun istatistiklerini topla.
        2. LLM'e verip güzel bir rapor yazdır.
        3. DB'ye kaydet ve email at.
        """
        bugun = date.today()
        
        # Bugün zaten briefing oluşturuldu mu?
        mevcut = self.db.execute(
            select(BriefingGecmisi).where(BriefingGecmisi.tarih == bugun)
        ).scalar_one_or_none()
        
        if mevcut:
            self.log_action("SKIPPED", "Bugün için brifing zaten var.")
            return mevcut
            
        self.log_action("GENERATING_BRIEFING", "Günlük sistem analizi başlatıldı.")
        
        # Veri Toplama
        # 1. Bekleyen Siparişler
        bekleyen_siparisler = self.db.execute(
            select(func.count(Siparis.id)).where(Siparis.durum == "bekliyor")
        ).scalar() or 0
        
        # 2. Açık Stok Uyarıları
        acik_stok_uyarilari = self.db.execute(
            select(func.count(StokUyarisi.id)).where(StokUyarisi.durum == "acik")
        ).scalar() or 0
        
        # 3. Geciken Kargolar
        geciken_kargolar = self.db.execute(
            select(func.count(KargoTakip.id)).where(KargoTakip.gecikme_var == True)
        ).scalar() or 0
        
        # Raw Data Set
        sistem_verisi = {
            "bekleyen_siparis_sayisi": bekleyen_siparisler,
            "acik_stok_uyarisi_sayisi": acik_stok_uyarilari,
            "geciken_kargo_sayisi": geciken_kargolar
        }
        
        # Gemini Prompt
        prompt = (
            "İşte bugünün sistem istatistikleri:\n"
            f"- Hazırlanmayı bekleyen yeni siparişler: {bekleyen_siparisler}\n"
            f"- Kritik seviyeye inen ürün (Stok uyarısı) sayısı: {acik_stok_uyarilari}\n"
            f"- Teslimatı geciken kargo sayısı: {geciken_kargolar}\n\n"
            "Lütfen bu verilere dayanarak mağaza sahibine günlük bir brifing hazırla."
        )
        
        brifing_metni = await self.llm.generate_content(prompt)
        if not brifing_metni:
            self.log_error("LLM brifing üretemedi.")
            return None
            
        # Kayıt Oluştur
        yeni_briefing = BriefingGecmisi(
            tarih=bugun,
            icerik={"raw_data": sistem_verisi, "rapor": brifing_metni},
            gonderildi=False
        )
        self.db.add(yeni_briefing)
        
        # Admin'e gönder
        from app.core.config import get_settings
        settings = get_settings()
        
        basarili = await self.email.send_message(
            to=settings.ADMIN_EMAIL,
            subject=f"LocalShop Günlük Brifing - {bugun.strftime('%d.%m.%Y')}",
            body=brifing_metni
        )
        
        yeni_briefing.gonderildi = basarili
        self.db.commit()
        
        self.log_action("BRIEFING_SENT", "Günlük brifing hazırlandı ve gönderildi.")
        return yeni_briefing
