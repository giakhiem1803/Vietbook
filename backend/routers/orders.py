from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB, OrderItemDB
from schemas.order import CheckoutRequest, OrderRead, OrderItemRead, OrderSummary, OrderStatusUpdate
from auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/orders", tags=["orders"])

ALLOWED_STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED"]


def to_read(order: OrderDB) -> OrderRead:
    return OrderRead(
        id=order.id, status=order.status, total_amount=order.total_amount,
        created_at=str(order.created_at),
        receiver_name=order.receiver_name, receiver_phone=order.receiver_phone,
        shipping_address=order.shipping_address,
        items=[OrderItemRead.model_validate(i) for i in order.items],
    )


@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout(payload: CheckoutRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total = sum(i.price * i.quantity for i in payload.items)

    if not user.phone or not user.address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer profile is incomplete")

    order = OrderDB(
        user_id=user.id, status="PLACED", total_amount=total,
        receiver_name=user.full_name, receiver_phone=user.phone,
        shipping_address=user.address,
    )
    db.add(order)
    db.flush()

    for i in payload.items:
        db.add(OrderItemDB(
            order_id=order.id, book_id=i.book_id, book_title=i.title,
            book_price=i.price, quantity=i.quantity, line_total=i.price * i.quantity,
        ))

    db.commit()
    db.refresh(order)
    return to_read(order)


@router.get("/my", response_model=List[OrderSummary])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = db.query(OrderDB).filter(OrderDB.user_id == user.id).order_by(desc(OrderDB.created_at)).all()
    return [OrderSummary(id=o.id, status=o.status, total_amount=o.total_amount, created_at=str(o.created_at)) for o in orders]


@router.get("/admin/all", response_model=List[OrderSummary], dependencies=[Depends(require_admin)])
def all_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).order_by(desc(OrderDB.created_at)).all()
    return [OrderSummary(id=o.id, status=o.status, total_amount=o.total_amount, created_at=str(o.created_at)) for o in orders]


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return to_read(order)


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
