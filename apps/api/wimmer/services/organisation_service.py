import uuid

from sqlalchemy.orm import Session

from wimmer.db.models.organisation import MemberRole, Organisation, OrganisationMember
from wimmer.schemas.organisation import OrganisationCreate, OrganisationUpdate


class OrganisationService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: OrganisationCreate, owner_id: uuid.UUID) -> Organisation:
        existing = self.db.query(Organisation).filter(Organisation.slug == data.slug).first()
        if existing:
            raise ValueError(f"Organisation slug '{data.slug}' already taken")
        org = Organisation(
            id=uuid.uuid4(),
            name=data.name,
            slug=data.slug,
            description=data.description,
        )
        self.db.add(org)
        self.db.flush()
        member = OrganisationMember(
            id=uuid.uuid4(),
            organisation_id=org.id,
            user_id=owner_id,
            role=MemberRole.OWNER,
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(org)
        return org

    def get_by_slug(self, slug: str) -> Organisation | None:
        return self.db.query(Organisation).filter(Organisation.slug == slug).first()

    def get_for_user(self, user_id: uuid.UUID) -> list[Organisation]:
        return (
            self.db.query(Organisation)
            .join(OrganisationMember)
            .filter(OrganisationMember.user_id == user_id, OrganisationMember.is_active == True)
            .all()
        )

    def assert_member(self, org_id: uuid.UUID, user_id: uuid.UUID) -> OrganisationMember:
        member = (
            self.db.query(OrganisationMember)
            .filter(
                OrganisationMember.organisation_id == org_id,
                OrganisationMember.user_id == user_id,
                OrganisationMember.is_active == True,
            )
            .first()
        )
        if not member:
            raise PermissionError("Not a member of this organisation")
        return member

    def update(self, org: Organisation, data: OrganisationUpdate) -> Organisation:
        if data.name is not None:
            org.name = data.name
        if data.description is not None:
            org.description = data.description
        self.db.commit()
        self.db.refresh(org)
        return org
