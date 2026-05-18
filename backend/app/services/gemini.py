import logging
import asyncio
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Modülü içe aktarırken API anahtarını yapılandır (varsa)
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """
    Google Gemini 2.0 API Wrapper.
    Rate limiting hataları ve ağ kopmalarına karşı otomatik retry içerir.
    Agent'lar tarafından metin üretimi, sınıflandırma ve extraction için kullanılır.
    """

    def __init__(self, system_instruction: str = None):
        self.model_name = settings.GEMINI_MODEL
        self.max_retries = settings.GEMINI_MAX_RETRIES
        
        # Güvenlik ayarları - e-ticaret botu olduğu için filtreler katı tutulabilir
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }

        # Model instance oluşturma
        kwargs = {"model_name": self.model_name, "safety_settings": self.safety_settings}
        if system_instruction:
            kwargs["system_instruction"] = system_instruction
            
        self.model = genai.GenerativeModel(**kwargs)

    async def generate_content(self, prompt: str, temperature: float = 0.7) -> str | None:
        """
        Verilen prompt'a yanıt üretir. 
        Hata durumunda exponential backoff ile max_retries kadar tekrar dener.
        """
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY bulunamadı. Mock yanıt dönülüyor.")
            return "[MOCK YANIT]: Gemini API yapılandırılmadı."

        generation_config = genai.types.GenerationConfig(temperature=temperature)

        for attempt in range(1, self.max_retries + 1):
            try:
                # generate_content_async asenkron bir methoddur
                response = await self.model.generate_content_async(
                    prompt, 
                    generation_config=generation_config
                )
                return response.text
            except Exception as e:
                wait_time = 2 ** attempt  # 2s, 4s, 8s...
                logger.error(f"Gemini API Hatası (Deneme {attempt}/{self.max_retries}): {e}")
                if attempt == self.max_retries:
                    logger.error("Maksimum deneme sayısına ulaşıldı.")
                    return None
                await asyncio.sleep(wait_time)

    def start_chat(self, history: list = None):
        """
        Kullanıcı veya agent için sürekli bir chat oturumu başlatır.
        `history` formatı: [{"role": "user", "parts": ["hello"]}, {"role": "model", "parts": ["hi"]}]
        """
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY bulunamadı. Chat mock modda çalışacak.")
            # Gerçekte bir object döndürmek yerine None döndürülür ve üst katman mock olduğunu anlar
            return None

        # Gemini API beklediği history formatına dönüştürme (eğer agent_konusmalar'dan geliyorsa)
        formatted_history = []
        if history:
            for msg in history:
                role = "user" if msg.get("role") == "user" else "model"
                formatted_history.append({
                    "role": role,
                    "parts": [msg.get("content", "")]
                })
                
        return self.model.start_chat(history=formatted_history)

    async def send_chat_message(self, chat_session, message: str) -> str | None:
        """
        Başlatılan bir chat oturumuna asenkron mesaj gönderir.
        """
        if chat_session is None:
            return "[MOCK CHAT YANITI]: AI asistanı şu an çevrimdışı."

        for attempt in range(1, self.max_retries + 1):
            try:
                response = await chat_session.send_message_async(message)
                return response.text
            except Exception as e:
                wait_time = 2 ** attempt
                logger.error(f"Gemini Chat Hatası (Deneme {attempt}/{self.max_retries}): {e}")
                if attempt == self.max_retries:
                    return None
                await asyncio.sleep(wait_time)
