"""Market signals and seasonal intelligence endpoint."""
import uuid
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from wimmer.api.deps import CurrentUser, DB
from wimmer.services.organisation_service import OrganisationService

router = APIRouter(prefix="/organisations/{org_id}/intelligence", tags=["intelligence"])

GERMAN_PUBLIC_HOLIDAYS_2025 = [
    {"date": "2025-01-01", "name": "Neujahrstag", "type": "public_holiday", "impact": "high", "direction": "positive"},
    {"date": "2025-04-18", "name": "Karfreitag", "type": "public_holiday", "impact": "medium", "direction": "positive"},
    {"date": "2025-04-21", "name": "Ostermontag", "type": "public_holiday", "impact": "medium", "direction": "positive"},
    {"date": "2025-05-01", "name": "Tag der Arbeit", "type": "public_holiday", "impact": "medium", "direction": "positive"},
    {"date": "2025-05-29", "name": "Christi Himmelfahrt", "type": "public_holiday", "impact": "medium", "direction": "positive"},
    {"date": "2025-06-09", "name": "Pfingstmontag", "type": "public_holiday", "impact": "medium", "direction": "positive"},
    {"date": "2025-10-03", "name": "Tag der deutschen Einheit", "type": "public_holiday", "impact": "high", "direction": "positive"},
    {"date": "2025-12-25", "name": "1. Weihnachtstag", "type": "public_holiday", "impact": "high", "direction": "positive"},
    {"date": "2025-12-26", "name": "2. Weihnachtstag", "type": "public_holiday", "impact": "high", "direction": "positive"},
]

SEASONAL_SIGNALS = [
    {"month": 12, "name": "Christmas Market Season", "type": "seasonal_event", "impact": "high", "direction": "positive", "description": "Major tourism driver across German cities. Elevated leisure demand December."},
    {"month": 10, "name": "Oktoberfest Season", "type": "seasonal_event", "impact": "high", "direction": "positive", "description": "Peak demand period for Munich. Significant uplift in room rates and occupancy."},
    {"month": 2, "name": "Low Season — Winter", "type": "seasonal_trend", "impact": "medium", "direction": "negative", "description": "Historically weakest leisure demand period. Business travel maintains base occupancy."},
    {"month": 7, "name": "Summer Peak — Leisure", "type": "seasonal_trend", "impact": "high", "direction": "positive", "description": "Peak leisure travel across Germany. Elevated family and tourist demand."},
    {"month": 8, "name": "Summer Peak — Leisure", "type": "seasonal_trend", "impact": "high", "direction": "positive", "description": "Continued summer peak. Conference and business travel pauses."},
    {"month": 11, "name": "Pre-Christmas Dip", "type": "seasonal_trend", "impact": "medium", "direction": "negative", "description": "Brief demand softening before Christmas market season begins."},
]


class SignalResponse(BaseModel):
    id: str
    signal_type: str
    signal_date: str
    title: str
    description: str | None
    impact_level: str
    impact_direction: str
    source: str
    is_demo: bool = True


@router.get("/signals", response_model=list[SignalResponse])
def get_signals(org_id: uuid.UUID, current_user: CurrentUser, db: DB):
    OrganisationService(db).assert_member(org_id, current_user.id)
    today = date.today()
    lookahead = today + timedelta(days=180)
    signals = []

    for h in GERMAN_PUBLIC_HOLIDAYS_2025:
        h_date = date.fromisoformat(h["date"])
        if today - timedelta(days=30) <= h_date <= lookahead:
            signals.append(SignalResponse(
                id=f"holiday-{h['date']}",
                signal_type=h["type"],
                signal_date=h["date"],
                title=h["name"],
                description=f"German public holiday. Expected {h['direction']} demand impact.",
                impact_level=h["impact"],
                impact_direction=h["direction"],
                source="German Federal Holiday Calendar",
            ))

    current_month = today.month
    for s in SEASONAL_SIGNALS:
        if abs(s["month"] - current_month) <= 2 or abs(s["month"] - current_month) >= 10:
            sig_date = date(today.year if s["month"] >= today.month else today.year + 1, s["month"], 1)
            signals.append(SignalResponse(
                id=f"seasonal-{s['month']}-{today.year}",
                signal_type=s["type"],
                signal_date=str(sig_date),
                title=s["name"],
                description=s["description"],
                impact_level=s["impact"],
                impact_direction=s["direction"],
                source="Wimmer Seasonal Intelligence (Demo)",
            ))

    return sorted(signals, key=lambda x: x.signal_date)
