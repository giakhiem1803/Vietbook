from pydantic import BaseModel, Field
from typing import List, Optional

class OrderItemCreate(BaseModel):
    book_id: int
    title: str
    price: float
    quantity: int = Field(..., gt=0)

class CheckoutRequest(BaseModel):
    items: List[OrderItemCreate]

class OrderItemRead(BaseModel):
    id: int
    book_id: int
    book_title: str
    book_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: str
    items: List[OrderItemRead]
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    shipping_address: Optional[str] = None

class OrderSummary(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: str

class OrderStatusUpdate(BaseModel):
    status: str
