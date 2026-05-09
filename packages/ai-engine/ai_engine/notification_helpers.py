from db_core.database import SessionLocal
from db_core.models import Notification


def create_notification(type: str, title: str, message: str, user_id=None):
    """Create a system notification."""
    session = SessionLocal()
    try:
        notif = Notification(type=type, title=title, message=message, user_id=user_id)
        session.add(notif)
        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()


def notify_model_trained(model_name: str, accuracy: float):
    """Notify that an ML model has been retrained."""
    create_notification(
        type="ml_training",
        title=f"{model_name} Retrained",
        message=f"Model '{model_name}' has been retrained with accuracy {accuracy:.1%}.",
    )


def notify_high_churn(count: int):
    """Alert when many customers have high churn probability."""
    create_notification(
        type="churn_alert",
        title="High Churn Alert",
        message=f"{count} customers identified with >70% churn probability.",
    )
