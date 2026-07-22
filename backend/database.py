import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Render PostgreSQL supplies a DATABASE_URL automatically when it is linked to
# this service. SQLite remains only as a local-development fallback.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vietbook.db")

# Some hosted PostgreSQL providers still expose the legacy postgres:// scheme.
# SQLAlchemy 2 requires the explicit postgresql:// form.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
