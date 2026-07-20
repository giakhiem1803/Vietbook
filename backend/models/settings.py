from sqlalchemy import Column, Integer, String
from database import Base

class BankSettingDB(Base):
    __tablename__ = "bank_settings"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String(100), nullable=False, default="")
    bank_bin = Column(String(20), nullable=False, default="")   # ma BIN ngan hang, dung cho VietQR
    account_number = Column(String(50), nullable=False, default="")
    account_name = Column(String(100), nullable=False, default="")
