from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class OrderItemCreate(BaseModel):
    book_id: int
    quantity: int = Field(..., gt=0)

class CheckoutRequest(BaseModel):
    payment_method: Literal["MOMO_QR", "VIETQR", "COD"] = "VIETQR"
    items: List[OrderItemCreate] = Field(..., min_length=1, max_length=50)

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
    payment_method: str
    payment_status: str
    transaction_code: Optional[str] = None
    discount_amount: float = 0
    shipping_fee: float = 0
    payments: List["PaymentRead"] = Field(default_factory=list)

class OrderSummary(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: str
    payment_method: str = "VIETQR"
    payment_status: str = "PENDING"

    class Config:
        from_attributes = True

class PaymentRead(BaseModel):
    id: int
    method: str
    status: str
    amount: float
    transaction_code: str
    provider_reference: Optional[str] = None
    note: Optional[str] = None
    paid_at: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class PaymentStatusUpdate(BaseModel):
    status: Literal["PENDING", "PENDING_CONFIRMATION", "PAID", "FAILED", "EXPIRED", "REFUNDED"]
    provider_reference: Optional[str] = Field(default=None, max_length=120)
    note: Optional[str] = Field(default=None, max_length=1000)

class OrderStatusUpdate(BaseModel):
    status: str
