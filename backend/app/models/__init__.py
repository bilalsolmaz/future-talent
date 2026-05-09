"""
Model kayıtları — Alembic'in tüm modelleri keşfetmesi için
bu dosyada import edilmeleri GEREKLİDİR.

Alembic migration oluşturduğunda bu dosyayı okur ve
hangi tabloların var olduğunu buradan öğrenir.
Yeni model eklersen buraya import etmeyi UNUTMA!
"""

from app.core.database import Base
from app.models.user import User
from app.models.category import Kategori
from app.models.product import Urun
from app.models.order import Siparis, SiparisKalemi
from app.models.returns import Iade
from app.models.review import Yorum
from app.models.favorite import Favori
from app.models.coupon import Kupon

# __all__: "from app.models import *" yapıldığında
# sadece buradaki isimler dışarı aktarılır
__all__ = [
    "Base", "User", "Kategori", "Urun",
    "Siparis", "SiparisKalemi", "Iade",
    "Yorum", "Favori", "Kupon",
]
