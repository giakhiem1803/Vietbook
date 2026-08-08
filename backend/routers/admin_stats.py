from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.deps import require_admin
from database import get_db
from models.book import BookDB
from models.order import OrderDB, OrderItemDB
from models.payment import PaymentTransactionDB
from models.user import UserDB

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"], dependencies=[Depends(require_admin)])

def dates(days: int, start: str | None, end: str | None):
    now = datetime.now(timezone.utc)
    try:
        since = datetime.fromisoformat(start).replace(tzinfo=timezone.utc) if start else now - timedelta(days=days)
        until = datetime.fromisoformat(end).replace(tzinfo=timezone.utc) + timedelta(days=1) if end else now + timedelta(days=1)
    except ValueError:
        return now - timedelta(days=days), now + timedelta(days=1)
    return since, until

def filtered_orders(db, days, start, end):
    since, until = dates(days, start, end)
    return db.query(OrderDB).filter(OrderDB.created_at >= since, OrderDB.created_at < until), since, until

@router.get("/overview")
def overview(days: int = Query(30, ge=1, le=365), start: str | None = None, end: str | None = None, db: Session = Depends(get_db)):
    orders, since, until = filtered_orders(db, days, start, end)
    all_orders = orders.all()
    paid_revenue = sum(p.amount for p in db.query(PaymentTransactionDB).filter(PaymentTransactionDB.status == "PAID", PaymentTransactionDB.paid_at >= since, PaymentTransactionDB.paid_at < until).all())
    return {"total_revenue": round(sum(o.total_amount for o in all_orders if o.status != "CANCELED"), 2),
            "paid_revenue": round(paid_revenue, 2), "total_orders": len(all_orders),
            "pending_confirmation": sum(o.payment_status == "PENDING_CONFIRMATION" for o in all_orders),
            "cod_orders": sum(o.payment_method == "COD" for o in all_orders),
            "new_customers": db.query(func.count(UserDB.id)).filter(UserDB.created_at >= since, UserDB.created_at < until).scalar() or 0,
            "low_stock": db.query(func.count(BookDB.id)).filter(BookDB.stock <= 5).scalar() or 0,
            "total_products": db.query(func.count(BookDB.id)).scalar() or 0}

@router.get("/revenue-series")
def revenue_series(days: int = Query(30, ge=1, le=365), start: str | None = None, end: str | None = None, db: Session = Depends(get_db)):
    orders, _, _ = filtered_orders(db, days, start, end)
    buckets = {}
    for order in orders.filter(OrderDB.status != "CANCELED").all():
        key = str(order.created_at)[:10]; buckets[key] = buckets.get(key, 0) + order.total_amount
    return {"labels": sorted(buckets), "values": [round(buckets[k], 2) for k in sorted(buckets)]}

@router.get("/order-statuses")
def order_statuses(days: int = Query(30, ge=1, le=365), start: str | None = None, end: str | None = None, db: Session = Depends(get_db)):
    orders, _, _ = filtered_orders(db, days, start, end); buckets = {}
    for order in orders.all(): buckets[order.status] = buckets.get(order.status, 0) + 1
    return {"labels": list(buckets), "values": list(buckets.values())}

@router.get("/top-books")
def top_books(days: int = Query(30, ge=1, le=365), start: str | None = None, end: str | None = None, db: Session = Depends(get_db)):
    orders, _, _ = filtered_orders(db, days, start, end)
    order_ids = [o.id for o in orders.filter(OrderDB.status != "CANCELED").all()]
    if not order_ids: return []
    rows = db.query(OrderItemDB.book_title, func.sum(OrderItemDB.quantity).label("sold"), func.sum(OrderItemDB.line_total).label("revenue")).filter(OrderItemDB.order_id.in_(order_ids)).group_by(OrderItemDB.book_title).order_by(func.sum(OrderItemDB.quantity).desc()).limit(5).all()
    return [{"title": r.book_title, "sold": r.sold, "revenue": r.revenue} for r in rows]

@router.get("/recent-orders")
def recent_orders(db: Session = Depends(get_db)):
    rows = db.query(OrderDB).order_by(OrderDB.created_at.desc()).limit(5).all()
    return [{"id": r.id, "status": r.status, "total_amount": r.total_amount, "payment_method": r.payment_method, "created_at": str(r.created_at)} for r in rows]

@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db)):
    rows = db.query(BookDB).filter(BookDB.stock <= 5).order_by(BookDB.stock.asc(), BookDB.title).limit(10).all()
    return [{"id": b.id, "title": b.title, "stock": b.stock} for b in rows]

# Backward compatible endpoint used by earlier UI versions.
@router.get("/monthly-revenue")
def monthly_revenue(db: Session = Depends(get_db)):
    data = revenue_series(365, None, None, db)
    return {"months": data["labels"], "revenues": data["values"]}
