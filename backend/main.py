# import os
# from datetime import datetime, timedelta, timezone
# from typing import Annotated

# import sqlalchemy
# from fastapi import Depends, FastAPI, HTTPException, status, Form
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from jose import JWTError, jwt
# from passlib.context import CryptContext
# from pydantic import BaseModel, Field
# from sqlalchemy.orm import sessionmaker, Session, declarative_base

# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Pass%40123@localhost:5432/Location App")
# SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_that_should_be_long_and_aaaaaa")
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# # --- DATABASE SETUP (SQLAlchemy) ---
# try:
#     engine = sqlalchemy.create_engine(DATABASE_URL)
#     SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#     Base = declarative_base()
# except Exception as e:
#     print(f"Error connecting to database: {e}")
#     engine = None
#     SessionLocal = None
#     Base = object

# # --- DATABASE MODEL ---
# if Base is not object:
#     class User(Base):
#         __tablename__ = "users"
#         id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, index=True)
#         name = sqlalchemy.Column(sqlalchemy.String, nullable=False)
#         phone_number = sqlalchemy.Column(sqlalchemy.String, unique=True, index=True, nullable=False)
#         hashed_password = sqlalchemy.Column(sqlalchemy.String, nullable=False)

# # --- PYDANTIC SCHEMAS (for data validation) ---
# class UserCreate(BaseModel):
#     name: str
#     phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")
#     password: str = Field(..., min_length=8)

# class PasswordReset(BaseModel):
#     phone_number: str
#     new_password: str = Field(..., min_length=8)

# class UserInDB(BaseModel):
#     id: int
#     name: str
#     phone_number: str

#     class Config:
#         from_attributes = True

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class TokenData(BaseModel):
#     phone_number: str | None = None

# # --- SECURITY (Password Hashing & JWT) ---
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# def verify_password(plain_password, hashed_password):
#     return pwd_context.verify(plain_password, hashed_password)

# def get_password_hash(password):
#     return pwd_context.hash(password)

# def create_access_token(data: dict, expires_delta: timedelta | None = None):
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.now(timezone.utc) + expires_delta
#     else:
#         expire = datetime.now(timezone.utc) + timedelta(minutes=15)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt

# # --- DEPENDENCIES ---
# def get_db():
#     if SessionLocal is None:
#         raise HTTPException(status_code=500, detail="Database not configured")
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         phone_number: str = payload.get("sub")
#         if phone_number is None:
#             raise credentials_exception
#         token_data = TokenData(phone_number=phone_number)
#     except JWTError:
#         raise credentials_exception
    
#     user = db.query(User).filter(User.phone_number == token_data.phone_number).first()
#     if user is None:
#         raise credentials_exception
#     return user

# # --- FASTAPI APP INITIALIZATION ---
# app = FastAPI(title="Phone & Password Auth API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- API ENDPOINTS ---
# @app.get("/health")
# def health_check(db: Session = Depends(get_db)):
#     """
#     Checks if the API can connect to the database.
#     """
#     try:
#         # Try to execute a simple query.
#         db.execute(sqlalchemy.text("SELECT 1"))
#         return {"status": "ok", "database": "connected"}
#     except Exception as e:
#         print(f"Health check failed: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
#             detail=f"Database connection error: {e}",
#         )

# @app.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
# def register_user(user: UserCreate, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.phone_number == user.phone_number).first()
#     if db_user:
#         raise HTTPException(status_code=400, detail="Phone number already registered")
    
#     hashed_password = get_password_hash(user.password)
#     new_user = User(
#         name=user.name, 
#         phone_number=user.phone_number, 
#         hashed_password=hashed_password
#     )
    
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
    
#     return new_user

# @app.post("/token", response_model=Token)
# async def login_for_access_token(
#     form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.phone_number == form_data.username).first()
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect phone number or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": user.phone_number}, expires_delta=access_token_expires
#     )
    
#     return {"access_token": access_token, "token_type": "bearer"}

# @app.post("/reset-password")
# def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.phone_number == data.phone_number).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User with this phone number not found")

#     user.hashed_password = get_password_hash(data.new_password)
#     db.commit()
    
#     return {"message": "Password updated successfully"}

# @app.get("/users/me", response_model=UserInDB)
# async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
#     return current_user

# # @app.on_event("startup")
# # def on_startup():
# #     if engine:
# #         try:
# #             Base.metadata.create_all(bind=engine)
# #             print("Database tables created successfully.")
# #         except Exception as e:
# #             print(f"Error creating database tables: {e}")


# main.py
# --- IMPORTS ---
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import sqlalchemy
from fastapi import Depends, FastAPI, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy import ForeignKey

# --- CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Pass%40123@localhost:5432/Location App")
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_that_should_be_long_and_aaaaaa")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- DATABASE SETUP (SQLAlchemy) ---
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

    class Attendance(Base):
        __tablename__ = "attendance"
        id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, index=True)
        user_id = sqlalchemy.Column(sqlalchemy.Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
        action_type = sqlalchemy.Column(sqlalchemy.String, nullable=False)
        timestamp = sqlalchemy.Column(sqlalchemy.DateTime(timezone=True), nullable=False)
        latitude = sqlalchemy.Column(sqlalchemy.Float)
        longitude = sqlalchemy.Column(sqlalchemy.Float)


# --- PYDANTIC SCHEMAS (for data validation) ---
class UserCreate(BaseModel):
    name: str
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")
    password: str = Field(..., min_length=8)

class PasswordReset(BaseModel):
    phone_number: str
    new_password: str = Field(..., min_length=8)
    
class AttendanceCreate(BaseModel):
    action_type: str
    timestamp: datetime
    latitude: float | None = None
    longitude: float | None = None

class UserInDB(BaseModel):
    id: int
    name: str
    phone_number: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: str | None = None

# --- SECURITY (Password Hashing & JWT) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- DEPENDENCIES ---
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

# --- FASTAPI APP INITIALIZATION ---
app = FastAPI(title="Location App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API ENDPOINTS ---
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(sqlalchemy.text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        print(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {e}",
        )

@app.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone_number == user.phone_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name, 
        phone_number=user.phone_number, 
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.phone_number == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone_number}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this phone number not found")
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@app.get("/users/me", response_model=UserInDB)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@app.post("/attendance", status_code=status.HTTP_201_CREATED)
async def record_attendance(
    attendance_data: AttendanceCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Records an attendance event for the currently authenticated user.
    """
    new_attendance_record = Attendance(
        user_id=current_user.id,
        action_type=attendance_data.action_type,
        timestamp=attendance_data.timestamp,
        latitude=attendance_data.latitude,
        longitude=attendance_data.longitude
    )
    db.add(new_attendance_record)
    db.commit()
    db.refresh(new_attendance_record)
    return new_attendance_record

# --- STARTUP EVENT ---
@app.on_event("startup")
def on_startup():
    if engine:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully.")
        except Exception as e:
            print(f"Error creating database tables: {e}")
