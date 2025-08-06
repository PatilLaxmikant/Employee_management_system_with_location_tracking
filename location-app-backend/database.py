# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Pass%40123@localhost:5432/LocationAppDB")

# --- DATABASE ENGINE & SESSION ---
try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Error connecting to database: {e}")
    engine = None
    SessionLocal = None

# --- BASE CLASS FOR MODELS ---
# All database models will inherit from this class
Base = declarative_base()

# --- DEPENDENCY TO GET DB SESSION ---
def get_db():
    """
    A dependency for FastAPI routes to get a database session.
    It ensures the session is always closed after the request.
    """
    if SessionLocal is None:
        raise Exception("Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
