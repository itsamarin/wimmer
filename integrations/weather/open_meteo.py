"""
Open-Meteo weather integration.
Docs: https://open-meteo.com/en/docs
Free, no API key required.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any

import httpx

BASE_URL = "https://api.open-meteo.com/v1"


async def get_forecast(latitude: float, longitude: float, days: int = 7) -> dict[str, Any]:
    """Fetch weather forecast for a location."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{BASE_URL}/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max",
                "forecast_days": min(days, 16),
                "timezone": "Europe/Berlin",
            },
        )
        resp.raise_for_status()
        return resp.json()


async def get_historical(latitude: float, longitude: float, start: date, end: date) -> dict[str, Any]:
    """Fetch historical weather data."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{BASE_URL}/archive",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "start_date": str(start),
                "end_date": str(end),
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
                "timezone": "Europe/Berlin",
            },
        )
        resp.raise_for_status()
        return resp.json()


def mock_weather_forecast(days: int = 7) -> dict[str, Any]:
    """Mock weather data for development when integration is not configured."""
    today = date.today()
    return {
        "daily": {
            "time": [(today + timedelta(days=i)).isoformat() for i in range(days)],
            "temperature_2m_max": [8 + i % 5 for i in range(days)],
            "temperature_2m_min": [2 + i % 3 for i in range(days)],
            "precipitation_sum": [i % 3 * 0.5 for i in range(days)],
        },
        "_source": "mock",
    }
