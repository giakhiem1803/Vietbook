from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class PaymentTransactionDB(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    method = Column(String(30), nullable=False)
    status = Column(String(30), nullable=False, default="PENDING")
    amount = Column(Float, nullable=False)
    transaction_code = Column(String(80), nullable=False, unique=True, index=True)
    provider_reference = Column(String(120), nullable=True)
    note = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    order = relationship("OrderDB", back_populates="payments")
