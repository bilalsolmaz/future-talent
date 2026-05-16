"""
Yapay Zeka API Endpoint'leri
"""

from fastapi import APIRouter, Depends, HTTPException, status
import google.generativeai as genai

from app.core.config import get_settings
from app.core.security import require_admin
from app.schemas.ai import AIAciklamaRequest, AIAciklamaResponse

settings = get_settings()
router = APIRouter(prefix="/ai", tags=["Yapay Zeka"])

# Eğer API anahtarı ayarlanmışsa Gemini'ı yapılandır
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

@router.post("/aciklama-olustur", response_model=AIAciklamaResponse)
async def aciklama_olustur(
    istek: AIAciklamaRequest,
    admin = Depends(require_admin)
):
    """
    Google Gemini kullanarak profesyonel ürün açıklaması oluşturur (Sadece Admin).
    Model: gemini-2.0-flash (hızlı ve metin üretimi için uygun)
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API anahtarı (.env dosyasında) yapılandırılmamış."
        )

    prompt = f"""
    Sen profesyonel bir e-ticaret metin yazarısın. Yerel bir işletme için ürün açıklaması yazacaksın.
    Aşağıdaki ürün bilgilerini kullanarak çekici, müşteriyi satın almaya teşvik eden ve SEO uyumlu Türkçe bir ürün açıklaması yaz.
    
    Ürün Adı: {istek.urun_adi}
    Fiyatı: {istek.fiyat} TL
    {f'Ekstra Not: {istek.ekstra_not}' if istek.ekstra_not else ''}
    
    Kurallar:
    - Sadece açıklamayı döndür, başka bir şey yazma.
    - Profesyonel ama samimi bir dil kullan.
    - Kısa ve öz olsun (maksimum 3-4 cümle).
    - Asla sahte özellik uydurma (örn: organiktir, el yapımıdır deme, süslü kelimeler kullan ama spesifik iddialarda bulunma).
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        if not response.text:
            raise ValueError("Gemini boş yanıt döndürdü.")
            
        return {"aciklama": response.text.strip()}
        
    except Exception as e:
        # Gerçek üretimde e.args falan loglanır, şimdilik kullanıcıya genelleştirilmiş hata dönüyoruz
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Yapay zeka ile iletişim kurulamadı: {str(e)}"
        )
