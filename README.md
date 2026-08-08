# Vietbook

Website bán sách React/Vite + FastAPI/SQLAlchemy. Dùng SQLite khi chạy local và PostgreSQL trên Render.

## Chạy local

Mở hai terminal:

```powershell
cd backend
venv\Scripts\activate
fastapi dev
```

```powershell
cd frontend
pnpm install
pnpm build
pnpm dev
```

Mở `http://localhost:5173`.

## Checkout và thanh toán

- Checkout chỉ nhận `book_id` và `quantity`; giá, tổng tiền và tồn kho luôn được kiểm tra tại server trong một transaction.
- Hỗ trợ COD, VietQR và QR MoMo. QR chỉ được ghi nhận `PAID` sau xác nhận của Admin.
- Sao chép `backend/.env.example` thành `.env` khi chạy local. Không commit `DATABASE_URL`, `SECRET_KEY` hay thông tin thanh toán thật.

## Deploy Render

1. Đẩy source lên GitHub, rồi tạo Blueprint từ `render.yaml`.
2. Liên kết PostgreSQL với service API để Render cung cấp `DATABASE_URL`.
3. Đặt `SECRET_KEY` dài, ngẫu nhiên và `FRONTEND_ORIGINS` bằng URL web trong Environment của API.
4. Đặt `VITE_API_BASE_URL` bằng URL API trong service web, rồi deploy lại.
5. Lần khởi động đầu tiên tạo bảng giao dịch và bổ sung an toàn các cột order còn thiếu; sao lưu database trước các thay đổi schema lớn trong production.
