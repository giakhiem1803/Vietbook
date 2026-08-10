from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB, OrderItemDB
from models.book import BookDB
from models.user import UserDB
from models.payment import PaymentTransactionDB, PaymentStatusHistoryDB
from models.commerce import CouponDB, CouponRedemptionDB
from schemas.order import CheckoutRequest, OrderRead, OrderItemRead, OrderSummary, OrderStatusUpdate, OrderCustomerRead
from auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/orders", tags=["orders"])

ALLOWED_STATUSES = ["PENDING_PAYMENT", "COD_PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED"]


def customer_read(user):
    return OrderCustomerRead(id=user.id, full_name=user.full_name, email=user.email, phone=user.phone, address=user.address)

def to_read(order: OrderDB, customer=None) -> OrderRead:
    return OrderRead(
        id=order.id, status=order.status, total_amount=order.total_amount,
        created_at=str(order.created_at),
        receiver_name=order.receiver_name, receiver_phone=order.receiver_phone,
        shipping_address=order.shipping_address,
        payment_method=order.payment_method, payment_status=order.payment_status,
        transaction_code=order.transaction_code, discount_amount=order.discount_amount or 0,
        shipping_fee=order.shipping_fee or 0, coupon_code=order.coupon_code,
        items=[OrderItemRead.model_validate(i) for i in order.items],
        payments=[{
            "id": p.id, "method": p.method, "status": p.status, "amount": p.amount,
            "transaction_code": p.transaction_code, "provider_reference": p.provider_reference,
            "note": p.note, "paid_at": str(p.paid_at) if p.paid_at else None,
            "created_at": str(p.created_at),
        } for p in order.payments],
        customer=customer_read(customer) if customer else None,
    )


@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout(payload: CheckoutRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    if not user.phone or not user.address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer profile is incomplete")
    quantities = {}
    for item in payload.items:
        quantities[item.book_id] = quantities.get(item.book_id, 0) + item.quantity
    try:
        # Lock the real product rows on PostgreSQL. SQLite safely serializes writes locally.
        books = db.query(BookDB).filter(BookDB.id.in_(quantities)).with_for_update().all()
        by_id = {book.id: book for book in books}
        missing = set(quantities) - set(by_id)
        if missing:
            raise HTTPException(status_code=404, detail="One or more books no longer exist")
        for book_id, quantity in quantities.items():
            if by_id[book_id].stock < quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {by_id[book_id].title}")

        subtotal = sum(by_id[book_id].price * quantity for book_id, quantity in quantities.items())
        coupon = None
        discount = 0
        if payload.coupon_code:
            coupon = db.query(CouponDB).filter(CouponDB.code == payload.coupon_code.strip().upper()).with_for_update().first()
            now = datetime.now(timezone.utc)
            if not coupon or not coupon.is_active or (coupon.expires_at and coupon.expires_at < now) or (coupon.max_uses is not None and coupon.used_count >= coupon.max_uses):
                raise HTTPException(status_code=400, detail="Coupon is invalid or unavailable")
            if subtotal < coupon.min_order_amount:
                raise HTTPException(status_code=400, detail="Order does not meet coupon minimum")
            discount = round(subtotal * coupon.percent_off / 100, 2)
        total = max(0, subtotal - discount)
        order = OrderDB(
            user_id=user.id, status="COD_PENDING" if payload.payment_method == "COD" else "PENDING_PAYMENT",
            total_amount=total, receiver_name=user.full_name, receiver_phone=user.phone,
            shipping_address=user.address, payment_method=payload.payment_method,
            payment_status="PENDING", shipping_fee=0, discount_amount=discount,
            coupon_code=coupon.code if coupon else None,
        )
        db.add(order); db.flush()
        transaction_code = f"VB-{order.id}-{__import__('uuid').uuid4().hex[:8].upper()}"
        order.transaction_code = transaction_code
        for book_id, quantity in quantities.items():
            book = by_id[book_id]
            book.stock -= quantity
            db.add(OrderItemDB(order_id=order.id, book_id=book.id, book_title=book.title,
                               book_price=book.price, quantity=quantity, line_total=book.price * quantity))
        payment = PaymentTransactionDB(order_id=order.id, method=payload.payment_method,
                                       status="PENDING", amount=total, transaction_code=transaction_code)
        db.add(payment); db.flush()
        if coupon:
            coupon.used_count += 1
            db.add(CouponRedemptionDB(coupon_id=coupon.id, user_id=user.id, order_id=order.id, discount_amount=discount))
        db.add(PaymentStatusHistoryDB(payment_id=payment.id, previous_status=None, new_status="PENDING", changed_by_user_id=user.id, note="Payment created"))
        db.commit(); db.refresh(order)
        return to_read(order)
    except HTTPException:
        db.rollback(); raise
    except Exception:
        db.rollback(); raise HTTPException(status_code=500, detail="Could not create order")


@router.get("/my", response_model=List[OrderSummary])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = db.query(OrderDB).filter(OrderDB.user_id == user.id).order_by(desc(OrderDB.created_at)).all()
    return [OrderSummary(id=o.id, status=o.status, total_amount=o.total_amount, created_at=str(o.created_at)) for o in orders]


@router.get("/admin/all", response_model=List[OrderSummary], dependencies=[Depends(require_admin)])
def all_orders(db: Session = Depends(get_db)):
    rows = db.query(OrderDB, UserDB).join(UserDB, UserDB.id == OrderDB.user_id).order_by(desc(OrderDB.created_at)).all()
    return [OrderSummary(id=o.id, status=o.status, total_amount=o.total_amount, created_at=str(o.created_at), customer=customer_read(u)) for o, u in rows]


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return to_read(order, db.get(UserDB, order.user_id) if user.role == "ADMIN" else None)


@router.patch("/{order_id}/status", response_model=OrderRead, dependencies=[Depends(require_admin)])
def update_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return to_read(order)
