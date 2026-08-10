from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth.deps import get_current_user, require_admin
from models.book import BookDB
from models.order import OrderDB, OrderItemDB
from models.commerce import WishlistItemDB, ReviewDB, CouponDB
from models.user import UserDB
from schemas.commerce import WishlistRead, ReviewCreate, ReviewRead, CouponCreate, CouponRead

router = APIRouter(tags=["commerce"])

@router.get("/wishlist", response_model=list[WishlistRead])
def wishlist(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return [WishlistRead(book_id=x.book_id) for x in db.query(WishlistItemDB).filter_by(user_id=user.id).all()]

@router.post("/wishlist/{book_id}", status_code=status.HTTP_201_CREATED)
def add_wishlist(book_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not db.get(BookDB, book_id): raise HTTPException(404, "Book not found")
    if not db.query(WishlistItemDB).filter_by(user_id=user.id, book_id=book_id).first():
        db.add(WishlistItemDB(user_id=user.id, book_id=book_id)); db.commit()
    return {"book_id": book_id}

@router.delete("/wishlist/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist(book_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.query(WishlistItemDB).filter_by(user_id=user.id, book_id=book_id).delete(); db.commit()

@router.get("/books/{book_id}/reviews", response_model=list[ReviewRead])
def reviews(book_id: int, db: Session = Depends(get_db)):
    rows = db.query(ReviewDB, UserDB).join(UserDB, UserDB.id == ReviewDB.user_id).filter(ReviewDB.book_id == book_id, ReviewDB.is_visible == True).order_by(ReviewDB.created_at.desc()).all()
    return [ReviewRead(id=r.id, rating=r.rating, content=r.content, author_name=u.full_name, created_at=str(r.created_at)) for r, u in rows]

@router.put("/books/{book_id}/review", response_model=ReviewRead)
def upsert_review(book_id: int, payload: ReviewCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    bought = db.query(OrderItemDB).join(OrderDB).filter(OrderDB.user_id == user.id, OrderItemDB.book_id == book_id, OrderDB.status.in_(["PAID", "PROCESSING", "SHIPPED", "COMPLETED"])).first()
    if not bought: raise HTTPException(403, "Only customers who purchased this book can review it")
    review = db.query(ReviewDB).filter_by(user_id=user.id, book_id=book_id).first()
    if review: review.rating, review.content, review.is_visible = payload.rating, payload.content, True
    else: review = ReviewDB(user_id=user.id, book_id=book_id, rating=payload.rating, content=payload.content); db.add(review)
    db.commit(); db.refresh(review)
    return ReviewRead(id=review.id, rating=review.rating, content=review.content, author_name=user.full_name, created_at=str(review.created_at))

@router.get("/admin/coupons", response_model=list[CouponRead], dependencies=[Depends(require_admin)])
def coupons(db: Session = Depends(get_db)):
    return db.query(CouponDB).order_by(CouponDB.created_at.desc()).all()

@router.post("/admin/coupons", response_model=CouponRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_coupon(payload: CouponCreate, db: Session = Depends(get_db)):
    code = payload.code.strip().upper()
    if db.query(CouponDB).filter_by(code=code).first(): raise HTTPException(409, "Coupon code already exists")
    coupon = CouponDB(**payload.model_dump(exclude={"code"}), code=code); db.add(coupon); db.commit(); db.refresh(coupon); return coupon

@router.patch("/admin/coupons/{coupon_id}/active", dependencies=[Depends(require_admin)])
def toggle_coupon(coupon_id: int, active: bool, db: Session = Depends(get_db)):
    coupon = db.get(CouponDB, coupon_id)
    if not coupon: raise HTTPException(404, "Coupon not found")
    coupon.is_active = active; db.commit(); return {"id": coupon.id, "is_active": coupon.is_active}
