from pydantic import BaseModel


class PropertyCreate(BaseModel):
    name: str
    slug: str
    property_type: str = "hotel"
    address: str | None = None
    city: str | None = None
    country: str = "DE"
    latitude: float | None = None
    longitude: float | None = None
    total_rooms: int = 0
    stars: int | None = None
    timezone: str = "Europe/Berlin"


class PropertyResponse(BaseModel):
    id: str
    organisation_id: str
    name: str
    slug: str
    property_type: str
    address: str | None
    city: str | None
    country: str
    latitude: float | None
    longitude: float | None
    total_rooms: int
    stars: int | None
    is_active: bool
    is_demo: bool
    timezone: str

    model_config = {"from_attributes": True}


class PropertyUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    total_rooms: int | None = None
    stars: int | None = None
