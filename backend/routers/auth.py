from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models.user import UserDB
from models.audit_log import AdminAuditLogDB
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AuthUser, ProfileUpdate, CustomerAdminRead, AdminCustomerUpdate
import json
from auth.security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from auth.deps import get_current_user, require_admin

router = APIRouter(tags=["auth"])

def customer_read(user: UserDB) -> CustomerAdminRead:
    return CustomerAdminRead(id=user.id, email=user.email, full_name=user.full_name, phone=user.phone, address=user.address, role=user.role, created_at=str(user.created_at))

@router.post("/register", response_model=AuthUser, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
    new_user = UserDB(email=payload.email, full_name=payload.full_name, phone=payload.phone, address=payload.address, password_hash=hash_password(payload.password), role="CUSTOMER")
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(data={"sub": str(user.id), "role": user.role}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=AuthUser)
def get_my_profile(user: UserDB = Depends(get_current_user)):
    return user

@router.put("/me", response_model=AuthUser)
def update_my_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: UserDB = Depends(get_current_user)):
    user.full_name, user.phone, user.address = payload.full_name, payload.phone, payload.address
    db.commit(); db.refresh(user)
    return user

@router.get("/admin/customers", response_model=list[CustomerAdminRead], dependencies=[Depends(require_admin)])
def list_customers(db: Session = Depends(get_db)):
    return [customer_read(user) for user in db.query(UserDB).filter(UserDB.role == "CUSTOMER").order_by(UserDB.created_at.desc()).all()]

@router.patch("/admin/customers/{user_id}", response_model=CustomerAdminRead)
def update_customer_by_admin(user_id: int, payload: AdminCustomerUpdate, db: Session = Depends(get_db), admin: UserDB = Depends(require_admin)):
    target = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not target: raise HTTPException(status_code=404, detail="Customer not found")
    duplicate = db.query(UserDB).filter(UserDB.email == payload.email, UserDB.id != user_id).first()
    if duplicate: raise HTTPException(status_code=400, detail="Email is already registered")
    if target.role == "ADMIN" and payload.role != "ADMIN" and db.query(UserDB).filter(UserDB.role == "ADMIN").count() <= 1:
        raise HTTPException(status_code=400, detail="Cannot remove the last Admin account")
    fields = {"full_name": payload.full_name, "email": str(payload.email), "phone": payload.phone, "address": payload.address, "role": payload.role}
    changed = {key: {"from": getattr(target, key), "to": value} for key, value in fields.items() if getattr(target, key) != value}
    for key, value in fields.items(): setattr(target, key, value)
    if changed: db.add(AdminAuditLogDB(target_user_id=target.id, admin_user_id=admin.id, action="UPDATE_CUSTOMER", changed_fields=json.dumps(changed)))
    db.commit(); db.refresh(target)
    return customer_read(target)
