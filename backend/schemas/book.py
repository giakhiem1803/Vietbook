from pydantic import BaseModel, Field
from typing import Optional

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=150)
    price: float = Field(..., gt=0)
    genre: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1)
    imageUrl: str
    stock: int = 10

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    genre: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    stock: Optional[int] = None

class BookRead(BaseModel):
    id: int
    title: str
    author: str
    price: float
    genre: str
    description: str
    imageUrl: str
    stock: int

    class Config:
        from_attributes = True
