from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("UPDATE alembic_version SET version_num='85c524f27a12'"))
    conn.commit()
    print("Alembic version fixed!")
