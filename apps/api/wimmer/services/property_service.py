import uuid

from sqlalchemy.orm import Session

from wimmer.db.models.organisation import Organisation
from wimmer.db.models.property import Property
from wimmer.schemas.property import PropertyCreate, PropertyUpdate


class PropertyService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org: Organisation, data: PropertyCreate) -> Property:
        count = self.db.query(Property).filter(Property.organisation_id == org.id, Property.is_active == True).count()
        if count >= org.max_properties:
            raise ValueError(f"Organisation has reached the maximum of {org.max_properties} properties")
        prop = Property(
            id=uuid.uuid4(),
            organisation_id=org.id,
            **data.model_dump(),
        )
        self.db.add(prop)
        self.db.commit()
        self.db.refresh(prop)
        return prop

    def list_for_org(self, org_id: uuid.UUID) -> list[Property]:
        return self.db.query(Property).filter(Property.organisation_id == org_id, Property.is_active == True).all()

    def get(self, property_id: uuid.UUID, org_id: uuid.UUID) -> Property | None:
        return self.db.query(Property).filter(Property.id == property_id, Property.organisation_id == org_id).first()

    def update(self, prop: Property, data: PropertyUpdate) -> Property:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(prop, field, value)
        self.db.commit()
        self.db.refresh(prop)
        return prop

    def seed_demo_properties(self, org: Organisation) -> list[Property]:
        demos = [
            {"name": "Wimmer Berlin Central", "slug": "wimmer-berlin-central", "city": "Berlin", "country": "DE", "total_rooms": 142, "stars": 4, "latitude": 52.5200, "longitude": 13.4050, "address": "Unter den Linden 1, 10117 Berlin"},
            {"name": "Wimmer Hamburg Harbour", "slug": "wimmer-hamburg-harbour", "city": "Hamburg", "country": "DE", "total_rooms": 98, "stars": 4, "latitude": 53.5461, "longitude": 9.9941, "address": "Hafenstraße 10, 20459 Hamburg"},
            {"name": "Wimmer Munich Residence", "slug": "wimmer-munich-residence", "city": "Munich", "country": "DE", "total_rooms": 76, "stars": 5, "latitude": 48.1351, "longitude": 11.5820, "address": "Maximilianstraße 15, 80539 Munich"},
        ]
        created = []
        for d in demos:
            existing = self.db.query(Property).filter(Property.slug == d["slug"], Property.organisation_id == org.id).first()
            if not existing:
                prop = Property(id=uuid.uuid4(), organisation_id=org.id, is_demo=True, **d)
                self.db.add(prop)
                created.append(prop)
        self.db.commit()
        return created
