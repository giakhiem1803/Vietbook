from pydantic import BaseModel, Field
from typing import Optional

class StockInRequest(BaseModel):
    quantity: int = Field(..., gt=0)
    note: Optional[str] = None

class StockLogRead(BaseModel):
    id: int
    quantity: int
    note: Optional[str] = None
    created_at: str
