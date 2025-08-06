# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, auth
from .database import engine, SessionLocal, Base
from .routers import auth as auth_router, attendance as attendance_router

# Create all database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Error creating database tables: {e}")

app = FastAPI(title="Location App API")

# --- MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUDE ROUTERS ---
app.include_router(auth_router.router)
app.include_router(attendance_router.router)

# --- STARTUP EVENT ---
@app.on_event("startup")
def on_startup():
    """
    Populates the events table with default values if it's empty.
    """
    try:
        db = SessionLocal()
        if db.query(models.Event).count() == 0:
            print("Populating events table...")
            event_list = [
                "Start Work location", "End Work location",
                "Start Lunch break", "End Lunch break",
                "Start Other Break", "End Other Break",
                "Start Work visit", "End Work visit"
            ]
            for event_text in event_list:
                db.add(models.Event(event_txt=event_text))
            db.commit()
            print("Events table populated.")
        db.close()
    except Exception as e:
        print(f"Error during startup event: {e}")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Location App API"}
