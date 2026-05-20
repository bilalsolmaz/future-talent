from sqlalchemy.orm import Session
from sqlalchemy import select

from app.agents.base import BaseAgent
from app.models.product import Urun
from app.models.stock_alert import StokUyarisi


class StockAgent(BaseAgent):
    """
    Arka planda çalışıp stok verisini analiz eden Agent.
    Kritik seviyedeki stokları bulur ve LLM yardımıyla 
    'Kaç tane sipariş edilmeli, neden?' gibi tedarik önerileri üretir.
    """

    AGENT_NAME = "StockAgent"
    SYSTEM_INSTRUCTION = """
    Sen LocalShop'un lojistik ve stok yönetim uzmanısın.
    Sana sunulan bitmek üzere olan ürünlerin verisine bakarak, mağaza yöneticisine 
    pratik ve kısa bir tedarik önerisi sunacaksın. (Örn: 'X ürünü çok satılıyor, hemen 50 adet sipariş geçilmeli.')
    Kesinlikle uzun laf kalabalığı yapma, sadece aksiyon odaklı öneri ver.
    """

    def __init__(self, db: Session):
        super().__init__(db)

    async def execute(self, **kwargs) -> list[StokUyarisi]:
        """
        1. Stok eşiğinin altına düşen ürünleri bul.
        2. LLM'e sorup bir sipariş önerisi al.
        3. DB'ye uyarıyı kaydet.
        """
        self.log_action("CHECKING_STOCKS", "Stok kontrolü başlatıldı.")
        
        # stok < stok_esigi: Eşiğin ALTINA düşenleri bul (eşikte olanlar değil).
        # Neden < değil <=? stok_esigi=0 olan ürünlerde stok=0 her zaman match ederdi → spam uyarı.
        kritik_urunler = self.db.execute(
            select(Urun).where(
                Urun.aktif == True,
                Urun.stok < Urun.stok_esigi
            )
        ).scalars().all()
        
        if not kritik_urunler:
            self.log_action("STOCKS_OK", "Kritik stok seviyesinde ürün bulunamadı.")
            return []

        olusturulan_uyarilar = []
        
        for urun in kritik_urunler:
            # Bu ürün için zaten "acik" durumda bir uyarı var mı?
            mevcut_uyari = self.db.execute(
                select(StokUyarisi).where(
                    StokUyarisi.urun_id == urun.id,
                    StokUyarisi.durum == "acik"
                )
            ).scalar_one_or_none()
            
            if mevcut_uyari:
                continue # Zaten uyarılmış, atla.
                
            # Gemini'den öneri al
            prompt = (
                f"Ürün Adı: {urun.isim}\n"
                f"Mevcut Stok: {urun.stok}\n"
                f"Kritik Eşik: {urun.stok_esigi}\n"
                f"Fiyat: {urun.fiyat} TL\n"
                f"Lütfen bu ürün için yöneticiye kısa bir yeniden tedarik (re-stock) tavsiyesi yaz."
            )
            
            oneri = await self.llm.generate_content(prompt, temperature=0.4)
            if not oneri:
                oneri = "Sistem önerisi oluşturulamadı, ancak stok kritik seviyede."
                
            # Yeni uyarı oluştur
            yeni_uyari = StokUyarisi(
                urun_id=urun.id,
                esik=urun.stok_esigi,
                mevcut_stok=urun.stok,
                oneri=oneri,
                durum="acik"
            )
            self.db.add(yeni_uyari)
            olusturulan_uyarilar.append(yeni_uyari)
            self.log_action("ALERT_CREATED", f"{urun.isim} için stok uyarısı oluşturuldu.")

        if olusturulan_uyarilar:
            self.db.commit()
            
        return olusturulan_uyarilar
