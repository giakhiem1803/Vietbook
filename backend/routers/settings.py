from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.settings import BankSettingDB
from schemas.settings import BankSettingRead, BankSettingUpdate
from auth.deps import require_admin

router = APIRouter(prefix="/settings", tags=["settings"])


def get_or_create(db: Session) -> BankSettingDB:
    row = db.query(BankSettingDB).first()
    if not row:
        row = BankSettingDB(bank_name="", bank_bin="", account_number="", account_name="")
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/bank", response_model=BankSettingRead)
def get_bank_settings(db: Session = Depends(get_db)):
    return get_or_create(db)


@router.put("/bank", response_model=BankSettingRead, dependencies=[Depends(require_admin)])
def update_bank_settings(payload: BankSettingUpdate, db: Session = Depends(get_db)):
    row = get_or_create(db)
    row.bank_name = payload.bank_name
    row.bank_bin = payload.bank_bin
    row.account_number = payload.account_number
    row.account_name = payload.account_name
    db.commit()
    db.refresh(row)
    return row
