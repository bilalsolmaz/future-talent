import json
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.agents.base import BaseAgent
from app.models.conversation import AgentKonusma
from app.models.product import Urun


class CustomerAgent(BaseAgent):
    """
    Müşterilerle (veya misafirlerle) doğrudan iletişim kuran Agent.
    Amacı: Soruları yanıtlamak, ürün önermek ve sepet/sipariş konusunda yönlendirmek.
    """

    AGENT_NAME = "CustomerAgent"
    SYSTEM_INSTRUCTION = """
    Sen LocalShop'un dijital satış danışmanı ve müşteri temsilcisisin.
    Amacın müşterilere nazik, profesyonel ve sıcak bir şekilde yardımcı olmak.
    Kısa ve öz cevaplar ver. 
    Eğer müşteri ürün arıyorsa, sana sağlanan bağlamdaki (context) ürünleri kullanarak öneri yap.
    Sana sunulan ürün bağlamında bir ürün yoksa, dürüstçe "Şu an stoklarımızda bulunmuyor" de.
    Hayal ürünü ürün veya fiyat uydurma.
    """

    def __init__(self, db: Session, session_id: str):
        super().__init__(db, session_id)
        
    def _get_or_create_conversation(self) -> AgentKonusma:
        """Veritabanından oturum geçmişini getirir veya yenisini oluşturur."""
        konusma = self.db.execute(
            select(AgentKonusma).where(AgentKonusma.session_id == self.session_id)
        ).scalar_one_or_none()
        
        if not konusma:
            konusma = AgentKonusma(session_id=self.session_id, mesajlar=[])
            self.db.add(konusma)
            self.db.commit()
            self.db.refresh(konusma)
            self.log_action("SESSION_CREATED", f"Yeni chat session başladı: {self.session_id}")
            
        return konusma
        
    def _get_products_context(self) -> str:
        """
        Gelişmiş RAG (Faz 4) öncesi, basitçe aktif ürünleri çekip string olarak döner.
        Performans için sadece isim, fiyat ve stok bilgisini alıyoruz.
        """
        urunler = self.db.execute(
            select(Urun.isim, Urun.fiyat, Urun.stok).where(Urun.aktif == True)
        ).all()
        
        if not urunler:
            return "Şu an satıştaki hiçbir ürün bulunmuyor."
            
        context_lines = []
        for u in urunler:
            durum = "Stokta Var" if u.stok > 0 else "Tükendi"
            context_lines.append(f"- {u.isim}: {u.fiyat} TL ({durum})")
            
        return "\n".join(context_lines)

    async def execute(self, user_message: str, user_id: int | None = None) -> str:
        """
        Kullanıcıdan gelen mesajı alır, geçmişi DB'den çeker,
        LLM'e sorar, cevabı DB'ye kaydeder ve döner.
        """
        self.log_action("MESSAGE_RECEIVED", f"Kullanıcı: {user_message[:50]}...")
        
        # 1. Konuşma geçmişini DB'den al
        konusma = self._get_or_create_conversation()
        
        # Kullanıcı login olmuşsa bağla (sonradan login olmuş olabilir)
        if user_id and not konusma.user_id:
            konusma.user_id = user_id
            self.db.commit()
            
        # 2. Ürün bağlamını çek (Veritabanındaki güncel katalog)
        katalog = self._get_products_context()
        
        # 3. Gemini chat oturumunu geçmişle başlat
        chat_session = self.llm.start_chat(history=konusma.mesajlar)
        if not chat_session:
            return "Üzgünüm, şu an bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin."
            
        # 4. LLM'e Prompt'u gönder (Ürün bağlamını gizlice arkaplanda veriyoruz)
        # Sistem promptuna ek olarak anlık bağlam vermek için mesajı zenginleştiriyoruz.
        enriched_message = (
            f"KULLANICI MESAJI: {user_message}\n\n"
            f"[GİZLİ SİSTEM BİLGİSİ - MÜŞTERİ GÖRMESİN: Mevcut ürün kataloğu:\n{katalog}]"
        )
        
        response_text = await self.llm.send_chat_message(chat_session, enriched_message)
        
        if response_text is None:
            response_text = "Bir hata oluştu, lütfen tekrar deneyin."
            
        # 5. Konuşma geçmişini güncelle
        # ÖNEMLİ: DB'ye yalnızca gerçek kullanıcı mesajını kaydediyoruz.
        # Zenginleştirilmiş (katalog bilgisi dahil) prompt kaydedilmez — token israfını ve
        # gizli veri sızıntısını önler. Bir sonraki oturumda geçmiş temiz kalır.
        yeni_mesajlar = list(konusma.mesajlar) # SQLAlchemy mutable list tespiti için kopyala
        yeni_mesajlar.append({"role": "user", "content": user_message})
        yeni_mesajlar.append({"role": "model", "content": response_text})
        
        konusma.mesajlar = yeni_mesajlar
        self.db.commit()
        
        self.log_action("RESPONSE_SENT", f"Agent: {response_text[:50]}...")
        return response_text
