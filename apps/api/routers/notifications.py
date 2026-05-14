from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db_core import get_db
from db_core.models import Notification, User
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def get_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's notifications, most recent first."""
    notifications = (
        db.query(Notification)
        .filter(
            (Notification.user_id == current_user.id) | (Notification.user_id == None)
        )
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    return notifications


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get count of unread notifications."""
    count = (
        db.query(Notification)
        .filter(
            (Notification.user_id == current_user.id) | (Notification.user_id == None),
            Notification.is_read == False,
        )
        .count()
    )
    return {"count": count}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.user_id is not None and notif.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this notification")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for the current user."""
    db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.user_id == None),
        Notification.is_read == False,
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "All marked as read"}
