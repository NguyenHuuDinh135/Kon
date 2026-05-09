from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from db_core import get_db
from db_core.models import Campaign, Notification, User
from auth import get_current_user, require_admin

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class CampaignCreate(BaseModel):
    name: str
    segment_target: str  # "VIP", "At Risk", "All", etc.
    discount_pct: float


@router.get("")
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all campaigns, most recent first."""
    return db.query(Campaign).order_by(Campaign.created_at.desc()).all()


@router.post("")
def create_campaign(
    data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new campaign in draft status."""
    campaign = Campaign(
        name=data.name,
        segment_target=data.segment_target,
        discount_pct=data.discount_pct,
        status="draft",
        created_by=current_user.id,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # Create broadcast notification
    notif = Notification(
        type="campaign",
        title="New Campaign Created",
        message=(
            f"Campaign '{data.name}' targeting {data.segment_target} "
            f"with {data.discount_pct}% discount is awaiting approval."
        ),
        user_id=None,
    )
    db.add(notif)
    db.commit()
    return campaign


@router.put("/{campaign_id}/approve")
def approve_campaign(
    campaign_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Approve a draft campaign (admin only)."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "draft":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot approve campaign in '{campaign.status}' status",
        )
    campaign.status = "approved"
    db.commit()
    return campaign


@router.put("/{campaign_id}/execute")
def execute_campaign(
    campaign_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Execute an approved campaign (admin only)."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Campaign must be approved before execution",
        )
    campaign.status = "executed"
    campaign.executed_at = datetime.now()
    db.commit()

    # Notify about execution
    notif = Notification(
        type="campaign_executed",
        title="Campaign Executed",
        message=(
            f"Campaign '{campaign.name}' has been executed "
            f"targeting {campaign.segment_target}."
        ),
        user_id=None,
    )
    db.add(notif)
    db.commit()
    return campaign
