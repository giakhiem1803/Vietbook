from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class OrderDB(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="PLACED")
    total_amount = Column(Float, nullable=False)
    receiver_name = Column(String(100), nullable=True)
    receiver_phone = Column(String(20), nullable=True)
    shipping_address = Column(String(500), nullable=True)
    payment_method = Column(String(30), nullable=False, default="BANK_TRANSFER")
    payment_status = Column(String(30), nullable=False, default="PENDING")
    momo_order_id = Column(String(100), nullable=True, unique=True)
    momo_trans_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("OrderItemDB", back_populates="order", cascade="all, delete-orphan")


class OrderItemDB(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    book_id = Column(Integer, nullable=False)
    book_title = Column(String(200), nullable=False)
    book_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Float, nullable=False)

    order = relationship("OrderDB", back_populates="items")
