from pydantic import BaseModel, field_validator
import re


class OrganisationCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("Slug must contain only lowercase letters, numbers, and hyphens")
        return v


class OrganisationResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    subscription_tier: str
    is_active: bool
    max_properties: int

    model_config = {"from_attributes": True}


class OrganisationUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
