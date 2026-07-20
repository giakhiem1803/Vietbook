import hashlib
import hmac
import json
import os
import time
import urllib.request
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from database import get_db
from models.order import OrderDB

router = APIRouter(prefix="/payments", tags=["payments"])

def load_local_env():
    """Load backend/.env without adding a runtime dependency."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

load_local_env()
MOMO_ENDPOINT = os.getenv("MOMO_ENDPOINT", "https://test-payment.momo.vn/v2/gateway/api/create")

def config():
    values = {key: os.getenv(key, "") for key in ("MOMO_PARTNER_CODE", "MOMO_ACCESS_KEY", "MOMO_SECRET_KEY", "MOMO_IPN_URL", "MOMO_REDIRECT_BASE_URL")}
    if not all(values.values()):
        raise HTTPException(503, "MoMo Sandbox chưa được cấu hình. Hãy điền MOMO_* trong file .env.")
    return values

@router.post("/momo/{order_id}")
def create_momo_payment(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order or (order.user_id != user.id and user.role != "ADMIN"):
        raise HTTPException(404, "Không tìm thấy đơn hàng")
    cfg = config()
    request_id = uuid4().hex
    momo_order_id = f"VB-{order.id}-{int(time.time())}"
    amount = str(int(round(order.total_amount)))
    redirect_url = f"{cfg['MOMO_REDIRECT_BASE_URL'].rstrip('/')}/orders/{order.id}"
    payload = {"partnerCode": cfg["MOMO_PARTNER_CODE"], "accessKey": cfg["MOMO_ACCESS_KEY"], "requestId": request_id, "amount": amount, "orderId": momo_order_id, "orderInfo": f"Thanh toan don hang Vietbook #{order.id}", "redirectUrl": redirect_url, "ipnUrl": cfg["MOMO_IPN_URL"], "extraData": "", "requestType": "captureWallet", "lang": "vi", "autoCapture": True}
    raw = "&".join(f"{key}={payload[key]}" for key in ("accessKey", "amount", "extraData", "ipnUrl", "orderId", "orderInfo", "partnerCode", "redirectUrl", "requestId", "requestType"))
    payload["signature"] = hmac.new(cfg["MOMO_SECRET_KEY"].encode(), raw.encode(), hashlib.sha256).hexdigest()
    request = urllib.request.Request(MOMO_ENDPOINT, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode())
    except Exception as exc:
        raise HTTPException(502, f"Không thể kết nối MoMo: {exc}")
    if result.get("resultCode") != 0 or not result.get("payUrl"):
        raise HTTPException(400, result.get("message", "MoMo không tạo được giao dịch"))
    order.momo_order_id, order.payment_method, order.payment_status = momo_order_id, "MOMO", "PENDING"
    db.commit()
    return {"payUrl": result["payUrl"], "orderId": momo_order_id}

@router.post("/momo/ipn")
async def momo_ipn(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    cfg = config()
    keys = ("accessKey", "amount", "extraData", "message", "orderId", "orderInfo", "orderType", "partnerCode", "payType", "requestId", "responseTime", "resultCode", "transId")
    raw = "&".join(f"{key}={data.get(key, '')}" for key in keys)
    expected = hmac.new(cfg["MOMO_SECRET_KEY"].encode(), raw.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, data.get("signature", "")):
        raise HTTPException(400, "Chữ ký IPN không hợp lệ")
    order = db.query(OrderDB).filter(OrderDB.momo_order_id == data.get("orderId")).first()
    if not order:
        raise HTTPException(404, "Không tìm thấy giao dịch")
    if int(data.get("resultCode", -1)) == 0:
        order.payment_status, order.momo_trans_id = "PAID", str(data.get("transId", ""))
        order.status = "PROCESSING"
    else:
        order.payment_status = "FAILED"
    db.commit()
    return {"resultCode": 0, "message": "Đã nhận IPN"}
