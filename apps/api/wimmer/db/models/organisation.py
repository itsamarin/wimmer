import uuid
from enum import Enum

from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from wimmer.db.base import Base, TimestampMixin, UUIDMixin


class SubscriptionTier(str, Enum):
    TRIAL = "trial"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class Organisation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organisations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    subscription_tier: Mapped[str] = mapped_column(String(50), default=SubscriptionTier.TRIAL)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    max_properties: Mapped[int] = mapped_column(default=5)

    members: Mapped[list["OrganisationMember"]] = relationship(back_populates="organisation", cascade="all, delete-orphan")
    properties: Mapped[list["Property"]] = relationship(back_populates="organisation", cascade="all, delete-orphan")


class MemberRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class OrganisationMember(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organisation_members"

    organisation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=MemberRole.VIEWER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    organisation: Mapped["Organisation"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")
