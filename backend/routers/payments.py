from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from auth.deps import get_current_user, require_admin
from database import get_db
from models.order import OrderDB
from models.payment import PaymentTransactionDB
from schemas.order import PaymentRead, PaymentStatusUpdate

router = APIRouter(prefix="/payments", tags=["payments"])
PAYMENT_STATUSES = {"PENDING", "PENDING_CONFIRMATION", "PAID", "FAILED", "EXPIRED", "REFUNDED"}

def payment_read(payment):
    return PaymentRead(id=payment.id, method=payment.method, status=payment.status,
        amount=payment.amount, transaction_code=payment.transaction_code,
        provider_reference=payment.provider_reference, note=payment.note,
        paid_at=str(payment.paid_at) if payment.paid_at else None, created_at=str(payment.created_at))

def get_owned_payment(payment_id, db, user):
    payment = db.query(PaymentTransactionDB).filter(PaymentTransactionDB.id == payment_id).first()
    if not payment or (payment.order.user_id != user.id and user.role != "ADMIN"):
        raise HTTPException(404, "Payment not found")
    return payment

@router.get("/my", response_model=list[PaymentRead])
def my_payments(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(PaymentTransactionDB).join(OrderDB).filter(OrderDB.user_id == user.id).order_by(desc(PaymentTransactionDB.created_at)).all()
    return [payment_read(row) for row in rows]

@router.post("/{payment_id}/submit", response_model=PaymentRead)
def submit_transfer(payment_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    payment = get_owned_payment(payment_id, db, user)
    if payment.method == "COD":
        raise HTTPException(400, "COD does not need transfer confirmation")
    if payment.status != "PENDING":
        raise HTTPException(400, "Payment cannot be submitted in its current state")
    payment.status = "PENDING_CONFIRMATION"; payment.order.payment_status = payment.status
    db.commit(); db.refresh(payment)
    return payment_read(payment)

@router.get("/admin", response_model=list[PaymentRead], dependencies=[Depends(require_admin)])
def admin_payments(db: Session = Depends(get_db)):
    return [payment_read(row) for row in db.query(PaymentTransactionDB).order_by(desc(PaymentTransactionDB.created_at)).all()]

@router.patch("/{payment_id}/admin-status", response_model=PaymentRead, dependencies=[Depends(require_admin)])
def update_payment(payment_id: int, payload: PaymentStatusUpdate, db: Session = Depends(get_db)):
    payment = db.query(PaymentTransactionDB).filter(PaymentTransactionDB.id == payment_id).first()
    if not payment: raise HTTPException(404, "Payment not found")
    payment.status = payload.status; payment.provider_reference = payload.provider_reference
    payment.note = payload.note
    order = payment.order; order.payment_status = payload.status
    if payload.status == "PAID":
        payment.paid_at = datetime.now(timezone.utc)
        if order.status in {"PENDING_PAYMENT", "COD_PENDING"}: order.status = "PAID"
    elif payload.status in {"FAILED", "EXPIRED"} and order.status == "PENDING_PAYMENT":
        order.status = "CANCELED"
    db.commit(); db.refresh(payment)
    return payment_read(payment)
