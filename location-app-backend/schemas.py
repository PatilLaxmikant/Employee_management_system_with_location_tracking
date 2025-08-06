# schemas.py
from pydantic import BaseModel, Field
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserInDB(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Password Reset Schema ---
class PasswordReset(BaseModel):
    phone_number: str
    new_password: str = Field(..., min_length=8)

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: str | None = None

# --- Event Schema ---
class EventOut(BaseModel):
    id: int
    event_txt: str
    class Config:
        from_attributes = True

# --- Attendance Schema ---
class AttendanceCreate(BaseModel):
    event_id: int
    latitude: float | None = None
    longitude: float | None = None
    remarks_txt: str | None = None
