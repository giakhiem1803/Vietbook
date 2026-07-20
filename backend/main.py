import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base, SessionLocal
from sqlalchemy import text
from models.book import BookDB
from models.user import UserDB
from models.order import OrderDB, OrderItemDB
from models.settings import BankSettingDB
from models.stock_log import StockLogDB
from routers import books, auth, orders, admin_stats, settings, payments

Base.metadata.create_all(bind=engine)

# Corrected cover URLs for the initial catalogue.  This also fixes existing SQLite data.
def apply_cover_corrections():
    covers = {
        "Doraemon Tap 1": "https://covers.openlibrary.org/b/isbn/9784091400017-L.jpg",
        "Nha Gia Kim": "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
        "Dac Nhan Tam": "https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg",
        "Sherlock Holmes: Toan Tap": "https://covers.openlibrary.org/b/isbn/9780140439074-L.jpg",
        "Tuoi Tho Du Doi": "https://covers.openlibrary.org/b/isbn/9786047751389-L.jpg",
        "One Piece Tap 1": "https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg",
        "Nhung Tam Long Cao Ca": "https://covers.openlibrary.org/b/isbn/9780192834938-L.jpg",
        "Tu Duy Nhanh Va Cham": "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
        "Conan Tap 1": "https://covers.openlibrary.org/b/isbn/9781591163278-L.jpg",
        "Nha Lanh Dao Khong Chuc Danh": "https://covers.openlibrary.org/b/isbn/9781439109137-L.jpg",
    }
    with SessionLocal() as db:
        for title, image_url in covers.items():
            book = db.query(BookDB).filter(BookDB.title == title).first()
            if book:
                book.image_url = image_url
        db.commit()

apply_cover_corrections()

# Lightweight migration for existing SQLite databases created before customer details.
def ensure_sqlite_columns():
    if not str(engine.url).startswith("sqlite"):
        return
    with engine.begin() as connection:
        tables = {
            "users": {"phone": "VARCHAR(20)", "address": "VARCHAR(500)"},
            "orders": {"receiver_name": "VARCHAR(100)", "receiver_phone": "VARCHAR(20)", "shipping_address": "VARCHAR(500)", "payment_method": "VARCHAR(30) DEFAULT 'BANK_TRANSFER'", "payment_status": "VARCHAR(30) DEFAULT 'PENDING'", "momo_order_id": "VARCHAR(100)", "momo_trans_id": "VARCHAR(100)"},
        }
        for table, columns in tables.items():
            existing = {row[1] for row in connection.execute(text(f"PRAGMA table_info({table})"))}
            for name, type_sql in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {type_sql}"))

ensure_sqlite_columns()

os.makedirs("static/book_images", exist_ok=True)

app = FastAPI(title="Vietbook API", version="1.0.0")

origins = [item.strip() for item in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if item.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(orders.router)
app.include_router(admin_stats.router)
app.include_router(settings.router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {"message": "Welcome to Vietbook API"}


@app.get("/about")
def about():
    return {"project": "Vietbook", "version": "1.0"}
