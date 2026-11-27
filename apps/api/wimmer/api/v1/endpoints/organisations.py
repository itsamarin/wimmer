import uuid

from fastapi import APIRouter, HTTPException, status

from wimmer.api.deps import CurrentUser, DB
from wimmer.schemas.organisation import OrganisationCreate, OrganisationResponse, OrganisationUpdate
from wimmer.services.organisation_service import OrganisationService
from wimmer.services.property_service import PropertyService

router = APIRouter(prefix="/organisations", tags=["organisations"])


@router.post("", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
def create_organisation(data: OrganisationCreate, current_user: CurrentUser, db: DB):
    try:
        org = OrganisationService(db).create(data, current_user.id)
        PropertyService(db).seed_demo_properties(org)
        return org
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[OrganisationResponse])
def list_organisations(current_user: CurrentUser, db: DB):
    return OrganisationService(db).get_for_user(current_user.id)


@router.get("/{org_id}", response_model=OrganisationResponse)
def get_organisation(org_id: uuid.UUID, current_user: CurrentUser, db: DB):
    svc = OrganisationService(db)
    org = db.query(__import__("wimmer.db.models.organisation", fromlist=["Organisation"]).Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    svc.assert_member(org_id, current_user.id)
    return org


@router.patch("/{org_id}", response_model=OrganisationResponse)
def update_organisation(org_id: uuid.UUID, data: OrganisationUpdate, current_user: CurrentUser, db: DB):
    from wimmer.db.models.organisation import Organisation
    svc = OrganisationService(db)
    org = db.query(Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404)
    member = svc.assert_member(org_id, current_user.id)
    if member.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    return svc.update(org, data)
