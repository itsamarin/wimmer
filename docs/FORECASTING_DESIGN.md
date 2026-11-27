# Wimmer — Forecasting Design

## Design Principles

### 1. Transparency over complexity

Every forecast must be explainable to a hotel manager who does not have a statistics background. The system returns the model name used, the number of training data days, and backtest accuracy metrics alongside every forecast. If the model selection logic or the error metrics are not clearly documented, the forecast is not production-ready.

### 2. Explainability over accuracy at the cost of interpretability

A simpler model that the team can fully explain and debug is preferred over a more accurate model that behaves as a black box. This is especially important in the MVP where trust with users is being established. Users need to understand *why* the forecast looks as it does.

### 3. No LLM in the numerical prediction path

This is a hard architectural constraint. The forecasting engine is a pure Python statistical module. It has no dependency on any LLM library and makes no network calls. The LLM's role in the system is interpretation and language generation, not number prediction.

**Why:** LLMs are known to hallucinate numerical values. A hallucinated forecast figure that reaches a revenue recommendation is a serious product defect. By separating the numerical pipeline completely, the system guarantees that every predicted value is traceable to a specific statistical method applied to specific historical data.

### 4. Validated data only

The forecasting engine queries `daily_performance` with a filter `is_validated = True`. Rows that failed import validation (negative occupancy, rooms_sold exceeding rooms_available, etc.) are never used in forecasting.

---

## Supported Metrics

| Metric | Column | Unit | Range |
|--------|--------|------|-------|
| `occupancy` | `occupancy_rate` | Decimal fraction | 0.0–1.0 |
| `revenue` | `room_revenue` | Currency (€) | ≥0 |
| `adr` | `adr` | Currency (€/room) | ≥0 |
| `revpar` | `revpar` | Currency (€/room) | ≥0 |
| `rooms_sold` | `rooms_sold` | Integer count | ≥0 |

Occupancy forecasts are clamped to [0, 1]. All other metrics are clamped to [0, ∞) — negative forecasts are nonsensical for hotel performance metrics.

---

## Model Selection

The model is selected automatically based on data availability:

```
Training data available    →    Model selected
─────────────────────────────────────────────
< MIN_TRAINING_DAYS (30)   →    insufficient_data (no forecast generated)
≥ 14 days (validated)      →    seasonal_naive
< 14 days (validated)      →    moving_average
```

**Why 30 days as the minimum threshold?** Below 30 days, the system does not have a full month of data, making seasonal patterns unreliable and backtest evaluation impossible. Rather than return a potentially misleading forecast, the system returns an empty response with `model_name = "insufficient_data"` and the actual `training_data_days` count.

**Why 14 days as the seasonal_naive threshold?** Seasonal naïve with 7-day seasonality requires at least two full weeks to have meaningful seasonal lags. With fewer than 14 data points, there are fewer than two complete 7-day cycles, so the moving average is preferred.

---

## Model Descriptions

### Seasonal Naïve (7-day seasonality)

**Location:** `ForecastingEngine._seasonal_naive()`

**Method:** For each forecast horizon day `i`, the predicted value is the value from 7 days prior in the training series. This captures the weekly pattern that dominates hotel performance (weekday vs. weekend demand, weekly business travel cycles).

**Formula:**
```
ŷ(t+h) = y(t + h mod 7 - 7)
```

For horizon step `i`, the predicted value comes from position `max(0, n - 7 + (i % 7))` in the training array, where `n` is the number of training observations.

**When it performs well:** Properties with stable weekly patterns. Business hotels with consistent weekday/weekend splits. Resorts with predictable weekly leisure demand.

**When it underperforms:** Properties with strong external demand drivers (events, weather, economic shocks) that override the weekly pattern. Early-stage hotels with insufficient data for reliable seasonal lags.

---

### Moving Average

**Location:** `ForecastingEngine._moving_average()`

**Method:** Computes the mean of the last `window=28` training observations and uses that constant as the prediction for all horizon days.

**Formula:**
```
ŷ(t+h) = (1/w) × Σ y(t-w+1 ... t)
```

where `w = min(28, n)` and `n` is the number of training observations.

**When it performs well:** Properties with insufficient data for seasonal patterns. Early-stage data with no clear seasonality yet. As a fallback when seasonal naïve is not applicable.

**When it underperforms:** Properties with strong trends (consistently growing or declining performance), because the moving average lags behind the trend. It is a stable-baseline model, not a trend-following model.

---

## Prediction Intervals

Both models produce 95% prediction intervals using an approximation based on historical standard deviation:

```
lower_bound = predicted_value - 1.96 × std(training_values)
upper_bound = predicted_value + 1.96 × std(training_values)
```

For the moving average, `std` is computed over the last 28 training values (or all values if fewer than 28 are available).

**Assumptions:** This interval assumes the forecast errors are approximately normally distributed with constant variance (homoscedastic). In practice, hotel occupancy is bounded (0–1) and revenue can be non-normal. These intervals are approximate and should be treated as indicative, not exact probability statements.

**What the interval means:** "Based on the historical variance in this property's data, the actual value is likely to fall within this range 95% of the time under stable conditions." It does not account for structural breaks, extraordinary events, or model misspecification.

**Constant-width intervals:** The current implementation uses a constant interval width (same standard deviation applied to all horizon days). In reality, uncertainty should grow with the forecast horizon (further ahead = wider interval). This is a known limitation to be addressed in a future model iteration.

---

## Evaluation Metrics

### MAE — Mean Absolute Error

```
MAE = (1/n) × Σ|y_i - ŷ_i|
```

**Interpretation:** Average absolute deviation of forecast from actual, in the same units as the forecast metric (e.g., €, occupancy fraction). Directly interpretable: "On average, the forecast was off by X."

**Strength:** Easy to explain. Not sensitive to large outliers (compared to RMSE).

---

### RMSE — Root Mean Squared Error

```
RMSE = √((1/n) × Σ(y_i - ŷ_i)²)
```

**Interpretation:** Similar to MAE but penalises large errors more heavily due to squaring. RMSE ≥ MAE always. If RMSE is significantly larger than MAE, there are some large individual errors.

**Strength:** Standard benchmark metric for regression and forecasting. Allows comparison against published baselines.

---

### WAPE — Weighted Absolute Percentage Error

```
WAPE = Σ|y_i - ŷ_i| / Σ|y_i|
```

**Interpretation:** Sum of absolute errors divided by sum of actuals. Equivalent to a weighted average of percentage errors where larger values are weighted more. Ranges 0–∞, with lower being better.

**Why WAPE, not MAPE?** The classic MAPE (Mean Absolute Percentage Error) formula is `(1/n) × Σ|y_i - ŷ_i| / y_i`, which is undefined when `y_i = 0`. Hotels can legitimately have zero occupancy on certain dates (closures, renovations). WAPE avoids this division-by-zero problem while retaining the scale-relative interpretation of percentage error.

**When WAPE is returned as NaN:** When `Σ|y_i| = 0` (all actuals are zero in the test set), WAPE is returned as `float("nan")`. This is a valid edge case for a property that was closed during the backtest period.

---

## Backtesting

**Method:** A single holdout split. The last 14 days of training data are withheld as a test set. The model is re-trained on all data before the holdout, predictions are generated for the holdout period, and accuracy metrics are computed against the actual values.

**Minimum requirement:** At least 28 days of training data are required to run the backtest (14 days train + 14 days test). If fewer than 28 days are available, `mae`, `rmse`, and `wape` are returned as `null`.

**Backtest trigger:**
```python
if len(series) >= 28:
    train = series[:-14]
    test_actual = series[-14:].values
    test_pred, _, _ = model(train, 14)
    mae = _mae(test_actual, test_pred)
    rmse = _rmse(test_actual, test_pred)
    wape = _wape(test_actual, test_pred)
```

**Limitation:** A single holdout split is not a comprehensive evaluation. Walk-forward cross-validation (rolling origin) would provide more robust accuracy estimates but adds computational overhead. This is planned for the LightGBM implementation in Milestone 2.

---

## Data Quality Checks

Data quality is enforced at import time, not at forecast time. The import layer sets `is_validated = True` for rows that pass these checks:

| Check | Rule |
|-------|------|
| Required columns | `date` and `rooms_available` must be present and non-null |
| Non-negative values | `rooms_sold`, `room_revenue`, `adr`, `revpar`, `cancellations`, `new_bookings` must be ≥ 0 |
| Rooms constraint | `rooms_sold <= rooms_available` |
| Occupancy consistency | If `adr > 0`, `rooms_sold > 0` should follow |
| Date format | Must parse as ISO 8601 (`YYYY-MM-DD`) |
| Duplicate dates | Duplicate `(property_id, date)` pairs are rejected (upsert constraint) |

**Missing column handling:** Optional columns (`rooms_sold`, `room_revenue`, etc.) that are missing from the import file are defaulted to 0. The import result warns on missing optional columns.

**Missing dates:** The forecasting engine does not perform gap filling. If a property has sparse data with many missing dates, the series will be shorter than the calendar period suggests. The `training_data_days` field in the response reports the actual number of validated rows, not the calendar range.

---

## Forecast Persistence

Forecasts are persisted to the `demand_forecasts` table after generation. Before inserting new forecast points, all existing forecasts for the same `(property_id, metric, forecast_date)` combination are deleted:

```python
self.db.query(DemandForecast).filter(
    DemandForecast.property_id == property_id,
    DemandForecast.metric == metric,
    DemandForecast.forecast_date == forecast_date,
).delete()
```

This means calling the forecast endpoint multiple times on the same day replaces the previous forecast with an identical one (or an updated one if new data was imported in between).

**Retention policy:** No automatic retention policy is implemented in the MVP. Old forecasts accumulate in the table as `forecast_date` advances. A cleanup job is planned for Milestone 2.

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `FORECAST_HORIZON_DAYS` | 90 | Maximum forecast horizon in days |
| `MIN_TRAINING_DAYS` | 30 | Minimum validated rows required to generate any forecast |

These are set in `Settings` (pydantic-settings) and read from the `.env` file.

---

## Future: LightGBM for Properties with 180+ Days of Data

Planned for Milestone 2.

**When:** Once a property accumulates ≥180 days of validated performance data, LightGBM becomes the preferred model.

**Features planned:**

| Feature | Category |
|---------|----------|
| Day-of-week (0–6) | Calendar |
| Day-of-month (1–31) | Calendar |
| Month (1–12) | Calendar |
| Is public holiday (boolean) | External signal |
| Days until next public holiday | External signal |
| Is school holiday week (boolean) | External signal |
| Weather temperature (mean, max) | External signal (Open-Meteo) |
| Precipitation (mm) | External signal (Open-Meteo) |
| Lag 7 days (same weekday last week) | Historical |
| Lag 14 days | Historical |
| Lag 28 days | Historical |
| Rolling mean (7-day, 28-day) | Historical |
| Rolling std (7-day, 28-day) | Historical |

**Evaluation:** Walk-forward cross-validation with 14-day test windows across the last 90 days of data. Model is retrained weekly or on-demand.

**Integration:** LightGBM will be a third model option in `ForecastingEngine._select_model()`. The selection logic will check the data length threshold and fall through to `seasonal_naive` if LightGBM cannot be used.

**External signals in model vs. in intelligence layer:** External signals (weather, holidays) are used as features in the LightGBM model. They are separately surfaced in the Intelligence module as human-readable signals. The model uses them quantitatively; the intelligence layer explains them qualitatively.
