# routers/attendance.py
from typing import List, Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .. import schemas, models, auth
from ..database import get_db

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
    dependencies=[Depends(auth.get_current_user)] # Protect all routes in this router
)

@router.get("/events", response_model=List[schemas.EventOut])
def get_events(db: Session = Depends(get_db)):
    """Retrieves all available event types from the database."""
    return db.query(models.Event).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def record_attendance(
    attendance_data: schemas.AttendanceCreate,
    current_user: Annotated[models.User, Depends(auth.get_current_user)],
    db: Session = Depends(get_db)
):
    """Records an attendance event for the currently authenticated user."""
    new_attendance = models.Attendance(
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
