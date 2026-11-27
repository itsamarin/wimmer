import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from wimmer.db.base import Base, TimestampMixin, UUIDMixin


class DemandForecast(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "demand_forecasts"

    property_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    target_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    metric: Mapped[str] = mapped_column(String(50), nullable=False)
    predicted_value: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    lower_bound: Mapped[float | None] = mapped_column(Numeric(12, 4))
    upper_bound: Mapped[float | None] = mapped_column(Numeric(12, 4))
    confidence_level: Mapped[float | None] = mapped_column(Numeric(4, 3))
    mae: Mapped[float | None] = mapped_column(Numeric(10, 4))
    rmse: Mapped[float | None] = mapped_column(Numeric(10, 4))
    wape: Mapped[float | None] = mapped_column(Numeric(6, 4))

    property: Mapped["Property"] = relationship(back_populates="demand_forecasts")
