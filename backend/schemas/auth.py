from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=8, max_length=20)
    address: str = Field(..., min_length=8, max_length=500)
    password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=8, max_length=20)
    address: str = Field(..., min_length=8, max_length=500)

class AuthUser(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    class Config:
        from_attributes = True

class CustomerAdminRead(AuthUser):
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
