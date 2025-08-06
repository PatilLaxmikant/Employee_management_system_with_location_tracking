# models.py
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    event_txt = Column(String, unique=True, nullable=False)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    remarks_txt = Column(Text)
    create_dttm = Column(DateTime(timezone=True), server_default=func.now())
    create_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
