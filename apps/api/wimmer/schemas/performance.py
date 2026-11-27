import uuid
from datetime import date

from pydantic import BaseModel, field_validator


class DailyPerformanceResponse(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    date: date
    rooms_available: int
    rooms_sold: int
    occupancy_rate: float
    room_revenue: float
    adr: float
    revpar: float
    cancellations: int
    new_bookings: int
    data_source: str
    is_validated: bool

    model_config = {"from_attributes": True}


class ImportResult(BaseModel):
    total_rows: int
    imported: int
    skipped: int
    errors: list[str]
    warnings: list[str]


class PerformanceSummary(BaseModel):
    property_id: uuid.UUID
    period_start: date
    period_end: date
    avg_occupancy: float
    avg_adr: float
    avg_revpar: float
    total_revenue: float
    total_rooms_sold: int
    data_points: int
