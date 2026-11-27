import uuid

from fastapi import APIRouter, HTTPException, status

from wimmer.api.deps import CurrentUser, DB
from wimmer.db.models.recommendation import Recommendation
from wimmer.schemas.recommendation import RecommendationApproval, RecommendationResponse
from wimmer.services.ai.recommendation_service import RecommendationService
from wimmer.services.organisation_service import OrganisationService
from wimmer.services.property_service import PropertyService

router = APIRouter(prefix="/organisations/{org_id}/properties/{property_id}/recommendations", tags=["recommendations"])


def _get_prop(org_id, property_id, current_user, db):
    from wimmer.db.models.organisation import Organisation
    org = db.query(Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404)
    OrganisationService(db).assert_member(org_id, current_user.id)
    prop = PropertyService(db).get(property_id, org_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return org, prop


@router.post("", response_model=list[RecommendationResponse], status_code=status.HTTP_201_CREATED)
def generate_recommendations(org_id: uuid.UUID, property_id: uuid.UUID, current_user: CurrentUser, db: DB):
    org, prop = _get_prop(org_id, property_id, current_user, db)
    svc = RecommendationService(db)
    recs = svc.generate_for_property(prop, org_id)
    return recs


@router.get("", response_model=list[RecommendationResponse])
def list_recommendations(org_id: uuid.UUID, property_id: uuid.UUID, current_user: CurrentUser, db: DB):
    org, prop = _get_prop(org_id, property_id, current_user, db)
    return RecommendationService(db).list_for_property(property_id, org_id)


@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
def approve_recommendation(org_id: uuid.UUID, property_id: uuid.UUID, recommendation_id: uuid.UUID, approval: RecommendationApproval, current_user: CurrentUser, db: DB):
    org, prop = _get_prop(org_id, property_id, current_user, db)
    rec = db.query(Recommendation).filter_by(id=recommendation_id, property_id=property_id, organisation_id=org_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending recommendations can be approved or rejected")
    return RecommendationService(db).approve(rec, current_user.id, approval)
