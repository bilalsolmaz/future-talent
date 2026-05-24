import logging
from sqlalchemy.orm import Session
from app.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


class BaseAgent:
    """
    Sistemdeki tüm AI Agent'ların türediği temel sınıf.
    Veritabanı bağlantısı, OpenAI LLM erişimi ve loglama standartlarını sağlar.
    """

    # Bu alan alt sınıflarda ezilmeli (override)
    AGENT_NAME = "BaseAgent"
    SYSTEM_INSTRUCTION = "Sen yardımsever bir asistansın."

    def __init__(self, db: Session, session_id: str | None = None):
        """
        db: Veritabanı Session nesnesi (SQLAlchemy)
        session_id: Belirli bir kullanıcının veya sürecin konuşma geçmişini takip etmek için
        """
        self.db = db
        self.session_id = session_id
        
        # Her agent'ın kendine has sistem promptu ile OpenAI'yı başlat
        self.llm = OpenAIService(system_instruction=self.SYSTEM_INSTRUCTION)
        self.logger = logging.getLogger(f"agent.{self.AGENT_NAME.lower()}")

    async def execute(self, task_input: str, **kwargs):
        """
        Her agent'ın ana giriş noktası. Alt sınıflar bunu implement etmelidir.
        """
        raise NotImplementedError("Bu metot alt sınıf tarafından implement edilmelidir.")

    def log_action(self, action: str, details: str = ""):
        """Agent'ın yaptığı eylemleri standart bir formatta loglar."""
        self.logger.info(f"[{self.AGENT_NAME}] ACTION: {action} | {details}")

    def log_error(self, error: str):
        """Agent hatalarını standart bir formatta loglar."""
        self.logger.error(f"[{self.AGENT_NAME}] ERROR: {error}")
