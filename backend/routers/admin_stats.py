from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.book import BookDB
from models.order import OrderDB
from models.user import UserDB
from auth.deps import require_admin

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"], dependencies=[Depends(require_admin)])


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    total_products = db.query(func.count(BookDB.id)).scalar() or 0
    total_orders = db.query(func.count(OrderDB.id)).scalar() or 0
    total_revenue = db.query(func.sum(OrderDB.total_amount)).filter(OrderDB.status != "CANCELED").scalar() or 0
    total_users = db.query(func.count(UserDB.id)).scalar() or 0
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_users": total_users,
    }


@router.get("/monthly-revenue")
def monthly_revenue(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).filter(OrderDB.status != "CANCELED").all()
    buckets = {}
    for o in orders:
        key = str(o.created_at)[:7] if o.created_at else "unknown"
        buckets[key] = buckets.get(key, 0) + o.total_amount
    months = sorted(buckets.keys())
    revenues = [round(buckets[m], 2) for m in months]
    return {"months": months, "revenues": revenues}
