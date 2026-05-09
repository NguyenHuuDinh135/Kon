from db_core.database import SessionLocal
from db_core.models import AuditLog


def log_action(user_id: int, action: str, table: str, record_id: str, details: dict = None):
    """Log an audit trail entry."""
    session = SessionLocal()
    try:
        log = AuditLog(
            UserID=user_id,
            Action=action,
            Table=table,
            RecordID=record_id,
            Details=details,
        )
        session.add(log)
        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()
