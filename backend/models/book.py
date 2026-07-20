from sqlalchemy import Column, Integer, String, Float, Text
from database import Base

class BookDB(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    author = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    genre = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=False)
    stock = Column(Integer, nullable=False, default=10)
