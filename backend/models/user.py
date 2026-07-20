from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="CUSTOMER")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
