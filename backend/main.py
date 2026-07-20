import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from sqlalchemy import text
from models.book import BookDB
from models.user import UserDB
from models.order import OrderDB, OrderItemDB
from models.settings import BankSettingDB
from models.stock_log import StockLogDB
from routers import books, auth, orders, admin_stats, settings, payments

Base.metadata.create_all(bind=engine)

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

origins = ["http://localhost:5173"]

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
