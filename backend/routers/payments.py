from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from auth.deps import get_current_user, require_admin
from database import get_db
from models.order import OrderDB
from models.payment import PaymentTransactionDB, PaymentStatusHistoryDB
from schemas.order import PaymentRead, PaymentStatusUpdate, PaymentHistoryRead

router = APIRouter(prefix="/payments", tags=["payments"])
TRANSITIONS = {"PENDING": {"PENDING_CONFIRMATION", "EXPIRED"}, "PENDING_CONFIRMATION": {"PAID", "FAILED", "EXPIRED"}, "PAID": {"REFUNDED"}, "FAILED": set(), "EXPIRED": set(), "REFUNDED": set()}

def mask_account(value):
    if not value: return None
    return f"••••{value[-4:]}" if len(value) > 4 else "••••"

def payment_read(payment):
    return PaymentRead(id=payment.id, method=payment.method, status=payment.status, amount=payment.amount,
        transaction_code=payment.transaction_code, provider_reference=payment.provider_reference,
        payment_proof_url=payment.payment_proof_url, payer_name=payment.payer_name,
        payer_account_hint=mask_account(payment.payer_account_hint), note=payment.note,
        verified_by_admin_id=payment.verified_by_admin_id,
        verified_at=str(payment.verified_at) if payment.verified_at else None,
        paid_at=str(payment.paid_at) if payment.paid_at else None, created_at=str(payment.created_at))

def add_history(db, payment, previous, new, user_id, note=None):
    db.add(PaymentStatusHistoryDB(payment_id=payment.id, previous_status=previous, new_status=new, changed_by_user_id=user_id, note=note))

def owned(payment_id, db, user):
    payment = db.query(PaymentTransactionDB).filter(PaymentTransactionDB.id == payment_id).first()
    if not payment or (payment.order.user_id != user.id and user.role != "ADMIN"): raise HTTPException(404, "Payment not found")
    return payment

@router.get("/my", response_model=list[PaymentRead])
def my_payments(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return [payment_read(p) for p in db.query(PaymentTransactionDB).join(OrderDB).filter(OrderDB.user_id == user.id).order_by(desc(PaymentTransactionDB.created_at)).all()]

@router.get("/{payment_id}/history", response_model=list[PaymentHistoryRead])
def history(payment_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    owned(payment_id, db, user)
    rows = db.query(PaymentStatusHistoryDB).filter(PaymentStatusHistoryDB.payment_id == payment_id).order_by(PaymentStatusHistoryDB.created_at).all()
    return [PaymentHistoryRead(id=r.id, previous_status=r.previous_status, new_status=r.new_status, changed_by_user_id=r.changed_by_user_id, note=r.note, created_at=str(r.created_at)) for r in rows]

@router.post("/{payment_id}/submit", response_model=PaymentRead)
def submit_transfer(payment_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    payment = owned(payment_id, db, user)
    if payment.method == "COD": raise HTTPException(400, "COD does not need transfer confirmation")
    if payment.status != "PENDING": raise HTTPException(409, "Payment was already submitted or finalized")
    previous = payment.status; payment.status = "PENDING_CONFIRMATION"; payment.order.payment_status = payment.status
    add_history(db, payment, previous, payment.status, user.id, "Customer submitted transfer for review")
    db.commit(); db.refresh(payment); return payment_read(payment)

@router.get("/admin", response_model=list[PaymentRead], dependencies=[Depends(require_admin)])
def admin_payments(db: Session = Depends(get_db)):
    return [payment_read(p) for p in db.query(PaymentTransactionDB).order_by(desc(PaymentTransactionDB.created_at)).all()]

@router.patch("/{payment_id}/admin-status", response_model=PaymentRead)
def update_payment(payment_id: int, payload: PaymentStatusUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    payment = db.query(PaymentTransactionDB).filter(PaymentTransactionDB.id == payment_id).first()
    if not payment: raise HTTPException(404, "Payment not found")
    if payload.status not in TRANSITIONS.get(payment.status, set()): raise HTTPException(409, "Invalid or repeated payment status transition")
    previous = payment.status; payment.status = payload.status; payment.provider_reference = payload.provider_reference or payment.provider_reference; payment.note = payload.note
    payment.verified_by_admin_id = admin.id; payment.verified_at = datetime.now(timezone.utc)
    order = payment.order; order.payment_status = payment.status
    if payment.status == "PAID":
        payment.paid_at = datetime.now(timezone.utc)
        if order.status in {"PENDING_PAYMENT", "COD_PENDING"}: order.status = "PAID"
    elif payment.status in {"FAILED", "EXPIRED"} and order.status == "PENDING_PAYMENT": order.status = "CANCELED"
    add_history(db, payment, previous, payment.status, admin.id, payload.note)
    db.commit(); db.refresh(payment); return payment_read(payment)
