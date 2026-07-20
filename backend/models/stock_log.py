from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class StockLogDB(Base):
    __tablename__ = "stock_logs"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)  # so luong nhap them (co the am neu dieu chinh giam)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
