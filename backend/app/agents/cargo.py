from sqlalchemy.orm import Session
from sqlalchemy import select

from app.agents.base import BaseAgent
from app.models.order import Siparis
from app.models.kargo import KargoTakip
from app.services.cargo_provider import get_cargo_provider
from app.services.notification_provider import get_whatsapp_provider, get_email_provider


class CargoAgent(BaseAgent):
    """
    Kargo süreçlerini arka planda yöneten Agent.
    Kargoya verilmiş siparişlerin son durumunu provider üzerinden çeker.
    Eğer gecikme/sorun tespit ederse, LLM ile nazik bir özür/bilgilendirme
    mesajı hazırlayıp Müşteriye WhatsApp/Email üzerinden gönderir.
    """

    AGENT_NAME = "CargoAgent"
    SYSTEM_INSTRUCTION = """
    Sen müşteri memnuniyetinden sorumlu bir kargo operasyon uzmanısın.
    Eğer bir kargoda gecikme yaşanmışsa, müşteriye atılacak çok kibar, güven verici 
    ve empati kuran kısa bir SMS/WhatsApp bilgilendirme mesajı yazacaksın.
    Mesajda kargo takip numarasını da geçirmeyi unutma.
    """

    def __init__(self, db: Session):
        super().__init__(db)
        self.cargo_provider = get_cargo_provider()
        self.whatsapp = get_whatsapp_provider()
        self.email = get_email_provider()

    async def execute(self, **kwargs):
        """
        1. 'kargolandi' durumundaki siparişleri bul.
        2. Kargo provider üzerinden güncel durumu sorgula.
        3. Gecikme varsa LLM'den mesaj üret ve bildirim at.
        4. Veritabanını güncelle.
        """
        self.log_action("CHECKING_CARGOS", "Kargo durum kontrolleri başladı.")
        
        # Henüz teslim edilmemiş ama kargolanmış siparişleri bul
        aktif_kargolar = self.db.execute(
            select(Siparis).where(Siparis.durum == "kargolandi")
        ).scalars().all()
        
        for siparis in aktif_kargolar:
            if not siparis.kargo_no:
                self.log_error(f"Siparis {siparis.id} kargolanmış ama kargo_no yok!")
                continue
                
            # Kargo Takip kaydını bul veya oluştur
            takip_kaydi = self.db.execute(
                select(KargoTakip).where(KargoTakip.siparis_id == siparis.id)
            ).scalar_one_or_none()
            
            if not takip_kaydi:
                takip_kaydi = KargoTakip(
                    siparis_id=siparis.id,
                    takip_no=siparis.kargo_no,
                    firma="Belirsiz" # Normalde siparişten çekilir
                )
                self.db.add(takip_kaydi)
                
            # Provider'dan güncel durumu çek
            durum_data = await self.cargo_provider.get_status(siparis.kargo_no)
            
            takip_kaydi.durum = durum_data.get("durum")
            takip_kaydi.son_konum = durum_data.get("konum")
            gecikme_durumu = durum_data.get("gecikme_var", False)
            
            # Eğer yeni bir gecikme tespit edildiyse ve daha önce bildirilmemişse
            if gecikme_durumu and not takip_kaydi.gecikme_var:
                takip_kaydi.gecikme_var = True
                
                # Gemini'ye mesaj hazırlat
                prompt = (
                    f"Müşteri: {siparis.user.isim}\n"
                    f"Sipariş No: {siparis.siparis_no}\n"
                    f"Kargo Takip No: {siparis.kargo_no}\n"
                    f"Son Konum: {takip_kaydi.son_konum}\n"
                    "Lütfen yaşanan gecikme için özür dileyen bir mesaj oluştur."
                )
                
                mesaj = await self.llm.generate_content(prompt, temperature=0.6)
                if mesaj:
                    # Bildirim gönder
                    if siparis.user.telefon:
                        await self.whatsapp.send_message(siparis.user.telefon, "Kargo Gecikmesi", mesaj)
                    else:
                        await self.email.send_message(siparis.user.email, "Siparişiniz Hakkında Bilgilendirme", mesaj)
                        
                    self.log_action("DELAY_NOTIFIED", f"{siparis.id} için gecikme bildirildi.")
            
            # Eğer teslim edildiyse sipariş durumunu da güncelle
            if takip_kaydi.durum and "teslim" in takip_kaydi.durum.lower():
                siparis.durum = "teslim_edildi"
                self.log_action("DELIVERED", f"Sipariş {siparis.id} teslim edildi.")
                
        self.db.commit()
