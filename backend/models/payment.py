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
    payment_proof_url = Column(String(500), nullable=True)
    payer_name = Column(String(100), nullable=True)
    payer_account_hint = Column(String(10), nullable=True)
    note = Column(Text, nullable=True)
    verified_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    order = relationship("OrderDB", back_populates="payments")


class PaymentStatusHistoryDB(Base):
    __tablename__ = "payment_status_history"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payment_transactions.id"), nullable=False, index=True)
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
