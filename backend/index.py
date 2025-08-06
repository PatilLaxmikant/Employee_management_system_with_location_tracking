# main.py
import os
from datetime import datetime, timedelta, timezone
from typing import List, Annotated
from dotenv import load_dotenv

import sqlalchemy
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from sqlalchemy.orm import sessionmaker, Session, declarative_base, joinedload
from sqlalchemy import ForeignKey, func

load_dotenv()

# --- CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

# --- DATABASE SETUP ---
try:
    engine = sqlalchemy.create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    print(f"Error connecting to database: {e}")
    engine = None
    SessionLocal = None
    Base = object

# --- DATABASE MODELS ---
if Base is not object:
    class User(Base):
        __tablename__ = "users"
        id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, index=True)
        name = sqlalchemy.Column(sqlalchemy.String, nullable=False)
        phone_number = sqlalchemy.Column(sqlalchemy.String, unique=True, index=True, nullable=False)
        hashed_password = sqlalchemy.Column(sqlalchemy.String, nullable=False)
        is_admin = sqlalchemy.Column(sqlalchemy.Boolean, default=False)

    class Event(Base):
        __tablename__ = "events"
        id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, index=True)
        event_txt = sqlalchemy.Column(sqlalchemy.String, unique=True, nullable=False)

    class Attendance(Base):
        __tablename__ = "attendance"
        id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, index=True)
        user_id = sqlalchemy.Column(sqlalchemy.Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
        event_id = sqlalchemy.Column(sqlalchemy.Integer, ForeignKey("events.id"), nullable=False)
        latitude = sqlalchemy.Column(sqlalchemy.Float)
        longitude = sqlalchemy.Column(sqlalchemy.Float)
        remarks_txt = sqlalchemy.Column(sqlalchemy.Text)
        create_dttm = sqlalchemy.Column(sqlalchemy.DateTime(timezone=True), server_default=func.now())
        create_user_id = sqlalchemy.Column(sqlalchemy.Integer, ForeignKey("users.id"), nullable=False)
        
        # Relationships to easily access related data
        # CORRECTED: Explicitly define the foreign key for the 'user' relationship
        user = sqlalchemy.orm.relationship("User", foreign_keys=[user_id])
        event = sqlalchemy.orm.relationship("Event")


# --- PYDANTIC SCHEMAS ---
class UserCreate(BaseModel):
    name: str
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    password: str = Field(..., min_length=8)

class PasswordReset(BaseModel):
    phone_number: str
    new_password: str = Field(..., min_length=8)
    
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: str | None = None

class UserInDB(BaseModel):
    id: int
    name: str
    phone_number: str
    is_admin: bool
    class Config:
        from_attributes = True

class EventOut(BaseModel):
    id: int
    event_txt: str
    class Config:
        from_attributes = True

class AttendanceCreate(BaseModel):
    event_id: int
    latitude: float | None = None
    longitude: float | None = None
    remarks_txt: str | None = None

class AttendanceRecord(BaseModel):
    id: int
    event_txt: str
    latitude: float | None
    longitude: float | None
    remarks_txt: str | None
    create_dttm: datetime
    class Config:
        from_attributes = True

class UserActivity(UserInDB):
    attendance_records: List[AttendanceRecord] = []


# --- SECURITY & AUTH ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
        token_data = TokenData(phone_number=phone_number)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.phone_number == token_data.phone_number).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(current_user: Annotated[User, Depends(get_current_user)]):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return current_user


# --- FASTAPI APP INITIALIZATION ---
app = FastAPI(title="Location App API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# --- API ENDPOINTS ---
@app.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone_number == user.phone_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(name=user.name, phone_number=user.phone_number, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect phone number or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.phone_number}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@app.get("/users/me", response_model=UserInDB)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@app.get("/events", response_model=List[EventOut])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@app.post("/attendance", status_code=status.HTTP_201_CREATED)
def record_attendance(attendance_data: AttendanceCreate, current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    new_attendance = Attendance(
        user_id=current_user.id,
        event_id=attendance_data.event_id,
        latitude=attendance_data.latitude,
        longitude=attendance_data.longitude,
        remarks_txt=attendance_data.remarks_txt,
        create_user_id=current_user.id
    )
    db.add(new_attendance)
    db.commit()
    return {"message": "Attendance recorded successfully."}

# --- ADMIN ENDPOINTS ---
@app.get("/admin/users", response_model=List[UserInDB], dependencies=[Depends(get_current_admin_user)])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/admin/activity/{user_id}", response_model=UserActivity, dependencies=[Depends(get_current_admin_user)])
def get_user_activity(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    attendance_records = db.query(Attendance).options(joinedload(Attendance.event)).filter(Attendance.user_id == user_id).order_by(Attendance.create_dttm.desc()).all()
    
    records_out = [
        AttendanceRecord(
            id=rec.id,
            event_txt=rec.event.event_txt,
            latitude=rec.latitude,
            longitude=rec.longitude,
            remarks_txt=rec.remarks_txt,
            create_dttm=rec.create_dttm
        ) for rec in attendance_records
    ]

    return UserActivity(
        id=user.id,
        name=user.name,
        phone_number=user.phone_number,
        is_admin=user.is_admin,
        attendance_records=records_out
    )

# --- STARTUP EVENT ---
@app.on_event("startup")
def on_startup():
    if engine:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully.")
            
            db = SessionLocal()
            if db.query(Event).count() == 0:
                print("Populating events table...")
                event_list = [
                    "Start Work location", "End Work location",
                    "Start Lunch break", "End Lunch break",
                    "Start Other Break", "End Other Break",
                    "Start Work visit", "End Work visit"
                ]
                for event_text in event_list:
                    db.add(Event(event_txt=event_text))
                db.commit()
                print("Events table populated.")
            
            admin_phone = os.getenv("ADMIN_PHONE", "+919356787112")
            if db.query(User).filter(User.phone_number == admin_phone).first() is None:
                print("Creating default admin user...")
                admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123")
                hashed_password = get_password_hash(admin_password)
                admin_user = User(
                    name="Admin",
                    phone_number=admin_phone,
                    hashed_password=hashed_password,
                    is_admin=True
                )
                db.add(admin_user)
                db.commit()
                print(f"Default admin created with phone: {admin_phone}")

            db.close()
        except Exception as e:
            print(f"Error during startup: {e}")
