import uuid
from datetime import datetime

from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    organisation_id: uuid.UUID
    title: str
    description: str
    category: str
    suggested_action: str
    expected_impact_description: str | None
    expected_revenue_impact: float | None
    expected_occupancy_impact: float | None
    confidence_score: float | None
    risk_level: str
    status: str
    evidence: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class RecommendationApproval(BaseModel):
    status: str
    notes: str | None = None

    def model_post_init(self, __context) -> None:
        if self.status not in ("approved", "rejected"):
            raise ValueError("status must be 'approved' or 'rejected'")


class GenerateRecommendationsRequest(BaseModel):
    property_id: str
    force_refresh: bool = False
