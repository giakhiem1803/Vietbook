import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from database import get_db
from models.book import BookDB
from models.stock_log import StockLogDB
from schemas.book import BookCreate, BookUpdate, BookRead
from schemas.stock import StockInRequest, StockLogRead
from auth.deps import require_admin

router = APIRouter(prefix="/books", tags=["books"])

UPLOAD_DIR = "static/book_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def to_read(b: BookDB) -> BookRead:
    return BookRead(
        id=b.id, title=b.title, author=b.author, price=b.price,
        genre=b.genre, description=b.description, imageUrl=b.image_url, stock=b.stock,
    )


@router.get("", response_model=List[BookRead])
def list_books(
    genre: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    q = db.query(BookDB)
    if genre and genre != "All":
        q = q.filter(BookDB.genre == genre)
    if search:
        like = f"%{search}%"
        q = q.filter((BookDB.title.ilike(like)) | (BookDB.author.ilike(like)))
    if min_price is not None:
        q = q.filter(BookDB.price >= min_price)
    if max_price is not None:
        q = q.filter(BookDB.price <= max_price)
    return [to_read(b) for b in q.all()]


@router.get("/{book_id}", response_model=BookRead)
def get_book(book_id: int, db: Session = Depends(get_db)):
    b = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return to_read(b)


@router.post("", response_model=BookRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_book(payload: BookCreate, db: Session = Depends(get_db)):
    b = BookDB(
        title=payload.title, author=payload.author, price=payload.price,
        genre=payload.genre, description=payload.description,
        image_url=payload.imageUrl, stock=payload.stock,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return to_read(b)


@router.put("/{book_id}", response_model=BookRead, dependencies=[Depends(require_admin)])
def update_book(book_id: int, payload: BookUpdate, db: Session = Depends(get_db)):
    b = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    data = payload.model_dump(exclude_unset=True)
    if "imageUrl" in data:
        b.image_url = data.pop("imageUrl")
    for k, v in data.items():
        setattr(b, k, v)
    db.commit()
    db.refresh(b)
    return to_read(b)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_book(book_id: int, db: Session = Depends(get_db)):
    b = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    db.delete(b)
    db.commit()
    return


@router.post("/{book_id}/image", response_model=BookRead, dependencies=[Depends(require_admin)])
def upload_book_image(book_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    b = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())

    b.image_url = f"/static/book_images/{filename}"
    db.commit()
    db.refresh(b)
    return to_read(b)


@router.post("/{book_id}/restock", response_model=BookRead, dependencies=[Depends(require_admin)])
def restock_book(book_id: int, payload: StockInRequest, db: Session = Depends(get_db)):
    b = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    b.stock += payload.quantity
    db.add(StockLogDB(book_id=book_id, quantity=payload.quantity, note=payload.note))
    db.commit()
    db.refresh(b)
    return to_read(b)


@router.get("/{book_id}/stock-logs", response_model=List[StockLogRead], dependencies=[Depends(require_admin)])
def get_stock_logs(book_id: int, db: Session = Depends(get_db)):
    logs = db.query(StockLogDB).filter(StockLogDB.book_id == book_id).order_by(desc(StockLogDB.created_at)).all()
    return [StockLogRead(id=l.id, quantity=l.quantity, note=l.note, created_at=str(l.created_at)) for l in logs]
