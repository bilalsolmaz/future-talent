from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.agents.base import BaseAgent
from app.models.order import Siparis
from app.models.returns import Iade
from app.models.user import User
from app.models.analytics_summary import AnalitikOzet


class AnalyticsAgent(BaseAgent):
    """
    Sistemin tüm satış, iade ve müşteri metriklerini periyodik olarak hesaplayan ajan.
    Heavy-query'leri önlemek için hesaplamaları arkaplanda yapıp
    sonuçları analitik_ozet tablosuna yazar (Pre-aggregation).
    """

    AGENT_NAME = "AnalyticsAgent"
    SYSTEM_INSTRUCTION = """
    Sen LocalShop'un veri analisti ve finans uzmanısın.
    Şu anda doğrudan müşteri ile iletişim kurmuyorsun, sadece sayıları topluyorsun.
    Bu nedenle sana gelen taleplerde sadece veriyi yorumla, genel sistem sağlığı hakkında bilgi ver.
    """

    def __init__(self, db: Session):
        super().__init__(db)

    async def execute(self, periyot: str = "gunluk", **kwargs) -> AnalitikOzet:
        """
        Belirtilen periyot için ('gunluk', 'haftalik', 'aylik') metrikleri hesaplar ve kaydeder.
        """
        self.log_action("CALCULATING_METRICS", f"{periyot} analitik raporu hazırlanıyor.")
        
        # timezone-aware datetime kullanıyoruz — DB'deki DateTime(timezone=True) alanlarıyla uyumlu
        simdi = datetime.now(timezone.utc)
        if periyot == "gunluk":
            baslangic = simdi - timedelta(days=1)
        elif periyot == "haftalik":
            baslangic = simdi - timedelta(days=7)
        elif periyot == "aylik":
            baslangic = simdi - timedelta(days=30)
        else:
            baslangic = simdi - timedelta(days=1)
            
        # 1. Toplam Ciro ve Sipariş Sayısı
        satis_istatistikleri = self.db.execute(
            select(
                func.sum(Siparis.toplam_tutar),
                func.count(Siparis.id)
            ).where(
                Siparis.created_at >= baslangic,
                Siparis.durum != "iptal"
            )
        ).first()
        
        toplam_satis = float(satis_istatistikleri[0] or 0.0)
        siparis_sayisi = int(satis_istatistikleri[1] or 0)
        
        # 2. Yeni Müşteri Sayısı
        yeni_musteri = self.db.execute(
            select(func.count(User.id)).where(User.created_at >= baslangic)
        ).scalar() or 0
        
        # 3. İade Oranı Hesabı
        iade_sayisi = self.db.execute(
            select(func.count(Iade.id)).where(Iade.created_at >= baslangic)
        ).scalar() or 0
        
        iade_orani = 0.0
        if siparis_sayisi > 0:
            iade_orani = (iade_sayisi / siparis_sayisi) * 100
            
        # Yeni bir özet kaydı oluştur
        ozet = AnalitikOzet(
            periyot=periyot,
            donem_baslangic=baslangic,
            donem_bitis=simdi,
            toplam_satis=toplam_satis,
            siparis_sayisi=siparis_sayisi,
            yeni_musteri=yeni_musteri,
            iade_orani=iade_orani
            # top_kategoriler ve top_urunler için karmaşık GROUP BY query'leri Faz 7'de eklenebilir.
        )
        
        self.db.add(ozet)
        self.db.commit()
        
        self.log_action("METRICS_CALCULATED", f"Ciro: {toplam_satis} TL | Sipariş: {siparis_sayisi} | İade Oranı: %{iade_orani:.2f}")
        return ozet
