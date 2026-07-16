from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        return result.scalar()