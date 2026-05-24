"""
Yapay Zeka API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.core.security import require_admin
from app.core.database import get_db
from app.schemas.ai import AIAciklamaRequest, AIAciklamaResponse, ChatRequest, ChatResponse
from app.services.openai_service import OpenAIService

settings = get_settings()
router = APIRouter(prefix="/ai", tags=["Yapay Zeka"])

@router.post("/aciklama-olustur", response_model=AIAciklamaResponse)
async def aciklama_olustur(
    istek: AIAciklamaRequest,
    admin = Depends(require_admin)
):
    """
    OpenAI (gpt-4o-mini) kullanarak profesyonel ürün açıklaması oluşturur (Sadece Admin).
    """
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI API anahtarı (.env dosyasında) yapılandırılmamış."
        )

    system_instruction = (
        "Sen profesyonel bir e-ticaret metin yazarısın. Yerel bir işletme için ürün açıklaması yazacaksın.\n"
        "Aşağıdaki ürün bilgilerini kullanarak çekici, müşteriyi satın almaya teşvik eden ve SEO uyumlu Türkçe bir ürün açıklaması yaz.\n\n"
        "Kurallar:\n"
        "- Sadece açıklamayı döndür, başka bir şey yazma.\n"
        "- Profesyonel ama samimi bir dil kullan.\n"
        "- Kısa ve öz olsun (maksimum 3-4 cümle).\n"
        "- Asla sahte özellik uydurma (örn: organiktir, el yapımıdır deme, süslü kelimeler kullan ama spesifik iddialarda bulunma)."
    )

    prompt = (
        f"Ürün Adı: {istek.urun_adi}\n"
        f"Fiyatı: {istek.fiyat} TL\n"
        f"{f'Ekstra Not: {istek.ekstra_not}' if istek.ekstra_not else ''}"
    )

    try:
        service = OpenAIService(system_instruction=system_instruction)
        response_text = await service.generate_content(prompt)
        
        if not response_text:
            raise ValueError("OpenAI boş yanıt döndürdü.")
            
        return {"aciklama": response_text.strip()}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Yapay zeka ile iletişim kurulamadı: {str(e)}"
        )


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    istek: ChatRequest,
    db = Depends(get_db)
):
    """
    Kullanıcının LocalShop asistanı (CustomerAgent) ile sohbet etmesini sağlar.
    """
    from app.agents.customer import CustomerAgent
    
    agent = CustomerAgent(db=db, session_id=istek.session_id)
    
    # Kullanıcı ID'sini alma (İleride kimlik doğrulaması yapıldığında eklenecek)
    # Şimdilik None geçiyoruz
    yanit = await agent.execute(user_message=istek.mesaj, user_id=None)
    
    return {"yanit": yanit}
