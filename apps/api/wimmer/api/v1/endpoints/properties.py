import uuid

from fastapi import APIRouter, HTTPException, UploadFile, status

from wimmer.api.deps import CurrentUser, DB
from wimmer.db.models.property import Property
from wimmer.schemas.performance import ImportResult, PerformanceSummary
from wimmer.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from wimmer.services.data_import_service import DataImportService
from wimmer.services.organisation_service import OrganisationService
from wimmer.services.property_service import PropertyService

router = APIRouter(prefix="/organisations/{org_id}/properties", tags=["properties"])


def _get_org_and_prop(org_id: uuid.UUID, property_id: uuid.UUID, current_user, db):
    from wimmer.db.models.organisation import Organisation
    org = db.query(Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    OrganisationService(db).assert_member(org_id, current_user.id)
    prop = PropertyService(db).get(property_id, org_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return org, prop


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(org_id: uuid.UUID, data: PropertyCreate, current_user: CurrentUser, db: DB):
    from wimmer.db.models.organisation import Organisation
    org = db.query(Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404)
    OrganisationService(db).assert_member(org_id, current_user.id)
    try:
        return PropertyService(db).create(org, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[PropertyResponse])
def list_properties(org_id: uuid.UUID, current_user: CurrentUser, db: DB):
    from wimmer.db.models.organisation import Organisation
    org = db.query(Organisation).filter_by(id=org_id).first()
    if not org:
        raise HTTPException(status_code=404)
    OrganisationService(db).assert_member(org_id, current_user.id)
    return PropertyService(db).list_for_org(org_id)


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(org_id: uuid.UUID, property_id: uuid.UUID, current_user: CurrentUser, db: DB):
    _, prop = _get_org_and_prop(org_id, property_id, current_user, db)
    return prop


@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property(org_id: uuid.UUID, property_id: uuid.UUID, data: PropertyUpdate, current_user: CurrentUser, db: DB):
    _, prop = _get_org_and_prop(org_id, property_id, current_user, db)
    return PropertyService(db).update(prop, data)


@router.post("/{property_id}/import", response_model=ImportResult)
async def import_performance(org_id: uuid.UUID, property_id: uuid.UUID, file: UploadFile, current_user: CurrentUser, db: DB):
    _, prop = _get_org_and_prop(org_id, property_id, current_user, db)
    if file.content_type not in ("text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/octet-stream"):
        if not (file.filename or "").endswith((".csv", ".xlsx", ".xls")):
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are accepted")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
    result = DataImportService(db).import_file(content, file.filename or "upload", prop)
    return result
