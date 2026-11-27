"""Tests for forecasting engine — no LLM, pure numerical validation."""
import uuid
from datetime import date, timedelta

import numpy as np
import pytest

from wimmer.services.forecasting.engine import ForecastingEngine, _mae, _rmse, _wape


def test_mae():
    actual = np.array([0.8, 0.7, 0.9])
    predicted = np.array([0.75, 0.72, 0.85])
    result = _mae(actual, predicted)
    assert result > 0
    assert result < 0.1


def test_rmse():
    actual = np.array([100, 200, 150])
    predicted = np.array([110, 190, 160])
    result = _rmse(actual, predicted)
    assert result > 0


def test_wape_zero_actual():
    actual = np.array([0.0, 0.0, 0.0])
    predicted = np.array([0.1, 0.2, 0.3])
    result = _wape(actual, predicted)
    assert np.isnan(result)


def test_wape_nonzero():
    actual = np.array([1.0, 2.0, 3.0])
    predicted = np.array([1.1, 1.9, 3.1])
    result = _wape(actual, predicted)
    assert 0 < result < 0.2


def test_forecast_engine_no_data(db):
    engine = ForecastingEngine(db)
    result = engine.generate(uuid.uuid4(), "occupancy", 30)
    assert result.model_name == "insufficient_data"
    assert result.points == []


def test_seasonal_naive(db):
    import pandas as pd
    engine = ForecastingEngine(db)
    series = pd.Series([0.6 + 0.1 * (i % 7 / 7) for i in range(60)])
    preds, lower, upper = engine._seasonal_naive(series, 14)
    assert len(preds) == 14
    assert all(0 <= p <= 1.5 for p in preds)
    assert all(l <= p <= u for l, p, u in zip(lower, preds, upper))
