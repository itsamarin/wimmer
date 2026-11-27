import uuid

from fastapi import APIRouter, HTTPException

from wimmer.api.deps import CurrentUser, DB
from wimmer.schemas.forecast import ForecastRequest, ForecastResponse
from wimmer.services.forecasting.engine import ForecastingEngine
from wimmer.services.organisation_service import OrganisationService
from wimmer.services.property_service import PropertyService

router = APIRouter(prefix="/organisations/{org_id}/properties/{property_id}/forecasts", tags=["forecasts"])


@router.post("", response_model=ForecastResponse)
def generate_forecast(org_id: uuid.UUID, property_id: uuid.UUID, req: ForecastRequest, current_user: CurrentUser, db: DB):
    from wimmer.db.models.organisation import Organisation
    org = db.query(Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404)
    OrganisationService(db).assert_member(org_id, current_user.id)
    prop = PropertyService(db).get(property_id, org_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if req.metric not in ("occupancy", "revenue", "adr", "revpar", "rooms_sold"):
        raise HTTPException(status_code=400, detail="Unsupported metric")
    return ForecastingEngine(db).generate(property_id, req.metric, req.horizon_days)
