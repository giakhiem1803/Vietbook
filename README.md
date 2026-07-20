# Vietbook

Website bán sách trực tuyến — React/Vite, FastAPI và SQLite.

## Chạy trên máy

Mở hai terminal.

```powershell
# Backend
cd backend
venv\Scripts\activate
fastapi dev
```

```powershell
# Frontend
cd frontend
npm install
npm run dev
```

Mở `http://localhost:5173`.

Tài khoản Admin mẫu: `admin@vietbook.com` / `admin123`.

## Deploy Render

1. Đẩy source lên GitHub, sau đó trong Render chọn **New > Blueprint** và chọn repository.
2. Render đọc file `render.yaml` để tạo `vietbook-api` và `vietbook-web`.
3. Khi API deploy xong, sao chép URL API (ví dụ `https://vietbook-api.onrender.com`).
4. Trong service `vietbook-web`, đặt `VITE_API_BASE_URL` bằng URL API rồi deploy lại static site.
5. Trong service `vietbook-api`, đặt `FRONTEND_ORIGINS` bằng URL của `vietbook-web` rồi deploy lại API.

Không đưa file `.env`, khóa MoMo hoặc dữ liệu thật lên GitHub.
