from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WishlistRead(BaseModel):
    book_id: int

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=3, max_length=1000)

class ReviewRead(BaseModel):
    id: int
    rating: int
    content: str
    author_name: str
    created_at: str

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=50)
    percent_off: float = Field(..., gt=0, le=100)
    min_order_amount: float = Field(0, ge=0)
    max_uses: Optional[int] = Field(None, gt=0)
    expires_at: Optional[datetime] = None

class CouponRead(CouponCreate):
    id: int
    used_count: int
    is_active: bool
