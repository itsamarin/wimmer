"""
Forecasting engine — statistical methods only.
No LLM involvement in numerical prediction.
"""
from __future__ import annotations

import uuid
from datetime import date, timedelta

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from wimmer.db.models.forecast import DemandForecast
from wimmer.db.models.performance import DailyPerformance
from wimmer.schemas.forecast import ForecastPoint, ForecastResponse


def _mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.mean(np.abs(actual - predicted)))


def _rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))


def _wape(actual: np.ndarray, predicted: np.ndarray) -> float:
    total_actual = np.sum(np.abs(actual))
    if total_actual == 0:
        return float("nan")
    return float(np.sum(np.abs(actual - predicted)) / total_actual)


class ForecastingEngine:
    def __init__(self, db: Session):
        self.db = db

    def _load_history(self, property_id: uuid.UUID, metric: str) -> pd.DataFrame:
        rows = (
            self.db.query(DailyPerformance)
            .filter(DailyPerformance.property_id == property_id, DailyPerformance.is_validated == True)
            .order_by(DailyPerformance.date)
            .all()
        )
        if not rows:
            return pd.DataFrame()

        col_map = {
            "occupancy": "occupancy_rate",
            "revenue": "room_revenue",
            "adr": "adr",
            "revpar": "revpar",
            "rooms_sold": "rooms_sold",
        }
        col = col_map.get(metric, "occupancy_rate")
        data = [{"date": r.date, "value": float(getattr(r, col))} for r in rows]
        return pd.DataFrame(data).set_index("date")

    def _seasonal_naive(self, series: pd.Series, horizon: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Seasonal naïve forecast with 7-day seasonality."""
        values = series.values
        n = len(values)
        predictions = np.array([values[max(0, n - 7 + (i % 7))] for i in range(horizon)])

        # Rough prediction interval using historical std
        std = np.std(values) if len(values) > 7 else 0
        lower = predictions - 1.96 * std
        upper = predictions + 1.96 * std
        return predictions, lower, upper

    def _moving_average(self, series: pd.Series, horizon: int, window: int = 28) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Centred moving average forecast."""
        values = series.values
        ma = np.mean(values[-window:]) if len(values) >= window else np.mean(values)
        predictions = np.full(horizon, ma)
        std = np.std(values[-window:]) if len(values) >= window else np.std(values)
        lower = predictions - 1.96 * std
        upper = predictions + 1.96 * std
        return predictions, lower, upper

    def _select_model(self, series: pd.Series) -> str:
        if len(series) >= 14:
            return "seasonal_naive"
        return "moving_average"

    def generate(self, property_id: uuid.UUID, metric: str = "occupancy", horizon_days: int = 90) -> ForecastResponse:
        from wimmer.core.config import get_settings
        settings = get_settings()

        history = self._load_history(property_id, metric)
        today = date.today()

        if history.empty or len(history) < settings.MIN_TRAINING_DAYS:
            # Return empty forecast with explanation when insufficient data
            return ForecastResponse(
                property_id=str(property_id),
                metric=metric,
                model_name="insufficient_data",
                forecast_date=today,
                horizon_days=horizon_days,
                points=[],
                training_data_days=len(history),
            )

        series = history["value"].dropna()
        model_name = self._select_model(series)

        if model_name == "seasonal_naive":
            predictions, lower, upper = self._seasonal_naive(series, horizon_days)
        else:
            predictions, lower, upper = self._moving_average(series, horizon_days)

        # Clamp occupancy to [0, 1]
        if metric == "occupancy":
            predictions = np.clip(predictions, 0, 1)
            lower = np.clip(lower, 0, 1)
            upper = np.clip(upper, 0, 1)
        else:
            predictions = np.maximum(predictions, 0)
            lower = np.maximum(lower, 0)
            upper = np.maximum(upper, 0)

        # Backtest on last 14 days if enough data
        mae, rmse, wape = None, None, None
        if len(series) >= 28:
            train = series[:-14]
            test_actual = series[-14:].values
            if model_name == "seasonal_naive":
                test_pred, _, _ = self._seasonal_naive(train, 14)
            else:
                test_pred, _, _ = self._moving_average(train, 14)
            mae = _mae(test_actual, test_pred)
            rmse = _rmse(test_actual, test_pred)
            wape = _wape(test_actual, test_pred)

        points = []
        for i in range(horizon_days):
            target = today + timedelta(days=i + 1)
            points.append(ForecastPoint(
                date=target,
                predicted_value=round(float(predictions[i]), 4),
                lower_bound=round(float(lower[i]), 4),
                upper_bound=round(float(upper[i]), 4),
                confidence_level=0.95,
            ))

        # Persist to database
        self._persist(property_id, metric, model_name, today, points, mae, rmse, wape)

        return ForecastResponse(
            property_id=str(property_id),
            metric=metric,
            model_name=model_name,
            forecast_date=today,
            horizon_days=horizon_days,
            points=points,
            mae=round(mae, 4) if mae is not None else None,
            rmse=round(rmse, 4) if rmse is not None else None,
            wape=round(wape, 4) if wape is not None else None,
            training_data_days=len(series),
        )

    def _persist(self, property_id: uuid.UUID, metric: str, model_name: str, forecast_date: date, points: list[ForecastPoint], mae, rmse, wape) -> None:
        # Remove stale forecasts for today
        self.db.query(DemandForecast).filter(
            DemandForecast.property_id == property_id,
            DemandForecast.metric == metric,
            DemandForecast.forecast_date == forecast_date,
        ).delete()
        for point in points:
            self.db.add(DemandForecast(
                id=uuid.uuid4(),
                property_id=property_id,
                forecast_date=forecast_date,
                target_date=point.date,
                model_name=model_name,
                metric=metric,
                predicted_value=point.predicted_value,
                lower_bound=point.lower_bound,
                upper_bound=point.upper_bound,
                confidence_level=point.confidence_level,
                mae=mae,
                rmse=rmse,
                wape=wape,
            ))
        self.db.commit()
