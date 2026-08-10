from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func
from database import Base

class WishlistItemDB(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_wishlist_user_book"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ReviewDB(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_review_user_book"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    is_visible = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CouponDB(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    percent_off = Column(Float, nullable=False)
    min_order_amount = Column(Float, nullable=False, default=0)
    max_uses = Column(Integer, nullable=True)
    used_count = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CouponRedemptionDB(Base):
    __tablename__ = "coupon_redemptions"
    __table_args__ = (UniqueConstraint("coupon_id", "user_id", "order_id", name="uq_coupon_order"),)
    id = Column(Integer, primary_key=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    discount_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
