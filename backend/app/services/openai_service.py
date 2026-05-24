import logging
import asyncio
from openai import AsyncOpenAI

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Modül içe aktarılırken istemciyi yapılandır (varsa)
client = None
if settings.OPENAI_API_KEY:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class OpenAIChatSession:
    """
    OpenAI'ın durumsuz (stateless) API'si üzerinde 
    sohbet geçmişini saklayan ve yöneten oturum nesnesi.
    """
    def __init__(self, history: list = None):
        self.history = []
        if history:
            for msg in history:
                role = msg.get("role")
                # Gemini 'model' rolünü OpenAI 'assistant' rolüne eşleştiriyoruz
                if role == "model":
                    role = "assistant"
                self.history.append({
                    "role": role,
                    "content": msg.get("content", "")
                })


class OpenAIService:
    """
    OpenAI API Wrapper.
    Rate limiting hataları ve ağ kopmalarına karşı otomatik retry içerir.
    Agent'lar tarafından metin üretimi, sınıflandırma ve extraction için kullanılır.
    """

    def __init__(self, system_instruction: str = None):
        self.system_instruction = system_instruction
        self.model_name = settings.OPENAI_MODEL
        self.max_retries = settings.OPENAI_MAX_RETRIES

    async def generate_content(self, prompt: str, temperature: float = 0.7) -> str | None:
        """
        Verilen prompt'a yanıt üretir.
        Hata durumunda exponential backoff ile max_retries kadar tekrar dener.
        """
        if not settings.OPENAI_API_KEY or not client:
            logger.warning("OPENAI_API_KEY bulunamadı. Mock yanıt dönülüyor.")
            return "[MOCK YANIT]: OpenAI API yapılandırılmadı."

        messages = []
        if self.system_instruction:
            messages.append({"role": "system", "content": self.system_instruction})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(1, self.max_retries + 1):
            try:
                response = await client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    temperature=temperature,
                    timeout=settings.OPENAI_TIMEOUT_SECONDS
                )
                return response.choices[0].message.content
            except Exception as e:
                wait_time = 2 ** attempt  # 2s, 4s, 8s...
                logger.error(f"OpenAI API Hatası (Deneme {attempt}/{self.max_retries}): {e}")
                if attempt == self.max_retries:
                    logger.error("Maksimum deneme sayısına ulaşıldı.")
                    return None
                await asyncio.sleep(wait_time)

    def start_chat(self, history: list = None):
        """
        Kullanıcı veya agent için sürekli bir chat oturumu başlatır.
        `history` formatı: [{"role": "user", "content": "hello"}, {"role": "model", "content": "hi"}]
        """
        if not settings.OPENAI_API_KEY or not client:
            logger.warning("OPENAI_API_KEY bulunamadı. Chat mock modda çalışacak.")
            return None
        return OpenAIChatSession(history=history)

    async def send_chat_message(self, chat_session: OpenAIChatSession, message: str) -> str | None:
        """
        Başlatılan bir chat oturumuna asenkron mesaj gönderir ve geçmişi günceller.
        """
        if chat_session is None:
            return "[MOCK CHAT YANITI]: AI asistanı şu an çevrimdışı."

        # Kullanıcı mesajını geçmişe ekle
        chat_session.history.append({"role": "user", "content": message})

        # OpenAI mesaj listesini hazırla
        messages = []
        if self.system_instruction:
            messages.append({"role": "system", "content": self.system_instruction})
        messages.extend(chat_session.history)

        for attempt in range(1, self.max_retries + 1):
            try:
                response = await client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    timeout=settings.OPENAI_TIMEOUT_SECONDS
                )
                response_text = response.choices[0].message.content
                
                # Asistan yanıtını geçmişe ekle
                chat_session.history.append({"role": "assistant", "content": response_text})
                return response_text
            except Exception as e:
                wait_time = 2 ** attempt
                logger.error(f"OpenAI Chat Hatası (Deneme {attempt}/{self.max_retries}): {e}")
                if attempt == self.max_retries:
                    return None
                await asyncio.sleep(wait_time)
