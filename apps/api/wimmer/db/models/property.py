import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from wimmer.db.base import Base, TimestampMixin, UUIDMixin


class Property(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "properties"

    organisation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    property_type: Mapped[str] = mapped_column(String(100), default="hotel")
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(2), default="DE")
    latitude: Mapped[float | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[float | None] = mapped_column(Numeric(9, 6))
    total_rooms: Mapped[int] = mapped_column(Integer, default=0)
    stars: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    timezone: Mapped[str] = mapped_column(String(50), default="Europe/Berlin")

    organisation: Mapped["Organisation"] = relationship(back_populates="properties")
    daily_performance: Mapped[list["DailyPerformance"]] = relationship(back_populates="property", cascade="all, delete-orphan")
    demand_forecasts: Mapped[list["DemandForecast"]] = relationship(back_populates="property", cascade="all, delete-orphan")
    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="property", cascade="all, delete-orphan")
