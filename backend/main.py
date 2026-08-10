import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base, SessionLocal
from sqlalchemy import text, inspect
from models.book import BookDB
from models.user import UserDB
from models.order import OrderDB, OrderItemDB
from models.payment import PaymentTransactionDB, PaymentStatusHistoryDB
from models.audit_log import AdminAuditLogDB
from models.settings import BankSettingDB
from models.stock_log import StockLogDB
from models.commerce import WishlistItemDB, ReviewDB, CouponDB, CouponRedemptionDB
from routers import books, auth, orders, admin_stats, settings, payments, commerce

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
def ensure_schema_columns():
    """Additive migration for pre-existing local SQLite and Render PostgreSQL DBs."""
    with engine.begin() as connection:
        # SQLite accepts DATETIME; PostgreSQL requires TIMESTAMP instead.
        timestamp_type = "DATETIME" if connection.dialect.name == "sqlite" else "TIMESTAMP WITH TIME ZONE"
        tables = {
            "users": {"phone": "VARCHAR(20)", "address": "VARCHAR(500)"},
            "orders": {"receiver_name": "VARCHAR(100)", "receiver_phone": "VARCHAR(20)", "shipping_address": "VARCHAR(500)", "payment_method": "VARCHAR(30) DEFAULT 'BANK_TRANSFER'", "payment_status": "VARCHAR(30) DEFAULT 'PENDING'", "transaction_code": "VARCHAR(80)", "discount_amount": "FLOAT DEFAULT 0", "shipping_fee": "FLOAT DEFAULT 0", "coupon_code": "VARCHAR(50)", "momo_order_id": "VARCHAR(100)", "momo_trans_id": "VARCHAR(100)", "updated_at": timestamp_type},
            "payment_transactions": {"note": "TEXT", "payment_proof_url": "VARCHAR(500)", "payer_name": "VARCHAR(100)", "payer_account_hint": "VARCHAR(10)", "verified_by_admin_id": "INTEGER", "verified_at": timestamp_type},
        }
        inspector = inspect(connection)
        for table, columns in tables.items():
            if table not in inspector.get_table_names():
                continue
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, type_sql in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {type_sql}"))

ensure_schema_columns()

os.makedirs("static/book_images", exist_ok=True)

app = FastAPI(title="Vietbook API", version="1.0.0")

origins = [item.strip() for item in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if item.strip()]
# Vite can fall back to another local port or be opened through 127.0.0.1.
# Production remains restricted by FRONTEND_ORIGINS; the regex is local-only.
local_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=local_origin_regex,
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
app.include_router(commerce.router)


@app.get("/")
def root():
    return {"message": "Welcome to Vietbook API"}


@app.get("/about")
def about():
    return {"project": "Vietbook", "version": "1.0"}
