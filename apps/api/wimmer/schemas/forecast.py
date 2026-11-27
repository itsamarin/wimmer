from datetime import date

from pydantic import BaseModel


class ForecastPoint(BaseModel):
    date: date
    predicted_value: float
    lower_bound: float | None = None
    upper_bound: float | None = None
    confidence_level: float | None = None


class ForecastResponse(BaseModel):
    property_id: str
    metric: str
    model_name: str
    forecast_date: date
    horizon_days: int
    points: list[ForecastPoint]
    mae: float | None = None
    rmse: float | None = None
    wape: float | None = None
    training_data_days: int


class ForecastRequest(BaseModel):
    metric: str = "occupancy"
    horizon_days: int = 90
    model: str = "auto"
