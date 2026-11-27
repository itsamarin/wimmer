import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from wimmer.db.base import Base, TimestampMixin, UUIDMixin


class DailyPerformance(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "daily_performance"

    property_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    rooms_available: Mapped[int] = mapped_column(Integer, nullable=False)
    rooms_sold: Mapped[int] = mapped_column(Integer, default=0)
    occupancy_rate: Mapped[float] = mapped_column(Numeric(5, 4), default=0)
    room_revenue: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    adr: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    revpar: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    cancellations: Mapped[int] = mapped_column(Integer, default=0)
    new_bookings: Mapped[int] = mapped_column(Integer, default=0)
    source_file: Mapped[str | None] = mapped_column(String(255))
    data_source: Mapped[str] = mapped_column(String(50), default="upload")
    is_validated: Mapped[bool] = mapped_column(default=False)

    property: Mapped["Property"] = relationship(back_populates="daily_performance")


class MarketSignal(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "market_signals"

    property_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    organisation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    signal_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    signal_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    impact_level: Mapped[str] = mapped_column(String(20), default="medium")
    impact_direction: Mapped[str] = mapped_column(String(20), default="positive")
    source: Mapped[str | None] = mapped_column(String(100))
    metadata_json: Mapped[str | None] = mapped_column(Text)
