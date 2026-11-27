"""
Baseline forecasting models for research and evaluation.
These are standalone implementations for ML research.
Production forecasting runs in apps/api/wimmer/services/forecasting/engine.py.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from dataclasses import dataclass


@dataclass
class ForecastResult:
    predictions: np.ndarray
    lower: np.ndarray
    upper: np.ndarray
    model_name: str
    mae: float | None = None
    rmse: float | None = None
    wape: float | None = None


def seasonal_naive(series: pd.Series, horizon: int, period: int = 7) -> ForecastResult:
    """Seasonal naïve baseline — repeats last seasonal cycle."""
    n = len(series)
    values = series.values
    preds = np.array([values[max(0, n - period + (i % period))] for i in range(horizon)])
    std = np.std(values)
    return ForecastResult(
        predictions=preds,
        lower=np.maximum(0, preds - 1.96 * std),
        upper=preds + 1.96 * std,
        model_name="seasonal_naive",
    )


def moving_average(series: pd.Series, horizon: int, window: int = 28) -> ForecastResult:
    """Moving average forecast."""
    values = series.values[-window:] if len(series) >= window else series.values
    mean = np.mean(values)
    std = np.std(values)
    preds = np.full(horizon, mean)
    return ForecastResult(
        predictions=preds,
        lower=np.maximum(0, preds - 1.96 * std),
        upper=preds + 1.96 * std,
        model_name="moving_average",
    )


def evaluate(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    """Compute MAE, RMSE, WAPE."""
    mae = float(np.mean(np.abs(actual - predicted)))
    rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))
    total = np.sum(np.abs(actual))
    wape = float(np.sum(np.abs(actual - predicted)) / total) if total > 0 else float("nan")
    return {"mae": mae, "rmse": rmse, "wape": wape}


def backtest(series: pd.Series, model_fn, horizon: int = 14, folds: int = 3) -> dict:
    """Walk-forward backtest."""
    results = []
    n = len(series)
    for fold in range(folds):
        split = n - horizon * (fold + 1)
        if split < 14:
            break
        train = series.iloc[:split]
        test = series.iloc[split:split + horizon].values
        result = model_fn(train, horizon)
        metrics = evaluate(test, result.predictions[:len(test)])
        results.append(metrics)

    if not results:
        return {}

    return {
        "mean_mae": np.mean([r["mae"] for r in results]),
        "mean_rmse": np.mean([r["rmse"] for r in results]),
        "mean_wape": np.mean([r["wape"] for r in results]),
        "folds": len(results),
    }
