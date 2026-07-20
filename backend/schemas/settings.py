from pydantic import BaseModel

class BankSettingRead(BaseModel):
    bank_name: str
    bank_bin: str
    account_number: str
    account_name: str

    class Config:
        from_attributes = True

class BankSettingUpdate(BaseModel):
    bank_name: str
    bank_bin: str
    account_number: str
    account_name: str
