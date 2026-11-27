"""
Seed a restaurant demo account for Wimmer.

Organisation:  Gastro Berlin Group
User:          restaurant@wimmer.dev  /  demo1234
Properties:    3 restaurants (Berlin, Hamburg, Munich)
Data model:    Reuses DailyPerformance — rooms→covers, ADR→avg check, RevPAR→RevPASH
Market data:   idealo.de delivery price intelligence as MarketSignals
History:       Jan 2025 → Oct 2026
Forecasts:     Nov 2026 → Feb 2027
"""
from __future__ import annotations

import math
import os
import random
import sys
import uuid
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///./wimmer_demo.db")
os.environ.setdefault("SECRET_KEY", "demo-secret-key-change-in-production")
os.environ.setdefault("LLM_PROVIDER", "mock")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from wimmer.core.security import hash_password
from wimmer.db.base import Base
from wimmer.db.models.forecast import DemandForecast
from wimmer.db.models.organisation import Organisation, OrganisationMember
from wimmer.db.models.performance import DailyPerformance, MarketSignal
from wimmer.db.models.property import Property
from wimmer.db.models.recommendation import Recommendation
from wimmer.db.models.user import User

# ── constants ──────────────────────────────────────────────────────────────────

RESTAURANT_EMAIL = "restaurant@wimmer.dev"
RESTAURANT_PASSWORD = "demo1234"
RESTAURANT_ORG_SLUG = "gastro-berlin-group"

HISTORY_START = date(2025, 1, 1)
HISTORY_END = date(2026, 10, 31)
FORECAST_START = date(2026, 11, 1)
FORECAST_END = date(2027, 2, 28)

# covers_per_day = seats × avg_seatings_per_day
RESTAURANT_CONFIGS = [
    {
        "name": "Gastro Berlin — Mitte Fine Dining",
        "slug": "gastro-berlin-mitte",
        "city": "Berlin",
        "address": "Friedrichstraße 44, 10117 Berlin",
        "total_rooms": 90,          # max covers/day (45 seats × 2 seatings)
        "stars": 5,
        "latitude": 52.5166,
        "longitude": 13.3883,
        "hotel_type": "fine_dining",
        "base_occ": 0.71,
        "base_adr": 68.0,           # avg check per cover €
        "weekend_boost": 0.14,
        "summer_boost": 0.08,
        "winter_dip": 0.10,
        "christmas_boost": 0.22,
        "noise_sigma": 0.045,
        "rng_seed": 201,
        "delivery_platform": "Wolt",
        "delivery_avg_order": 72.0,
    },
    {
        "name": "Gastro Hamburg — Harbour Bistro",
        "slug": "gastro-hamburg-harbour",
        "city": "Hamburg",
        "address": "Große Elbstraße 9, 22767 Hamburg",
        "total_rooms": 160,         # max covers/day (80 seats × 2 seatings)
        "stars": 3,
        "latitude": 53.5438,
        "longitude": 9.9456,
        "hotel_type": "casual",
        "base_occ": 0.62,
        "base_adr": 29.0,
        "weekend_boost": 0.16,
        "summer_boost": 0.18,
        "winter_dip": 0.12,
        "christmas_boost": 0.09,
        "noise_sigma": 0.055,
        "rng_seed": 202,
        "delivery_platform": "Lieferando",
        "delivery_avg_order": 31.0,
    },
    {
        "name": "Gastro Munich — Bavarian Residence",
        "slug": "gastro-munich-bavarian",
        "city": "Munich",
        "address": "Viktualienmarkt 3, 80331 Munich",
        "total_rooms": 240,         # max covers/day (120 seats, lunch+dinner)
        "stars": 4,
        "latitude": 48.1351,
        "longitude": 11.5753,
        "hotel_type": "traditional",
        "base_occ": 0.67,
        "base_adr": 36.0,
        "weekend_boost": 0.12,
        "summer_boost": 0.14,
        "winter_dip": 0.08,
        "christmas_boost": 0.20,
        "oktoberfest_boost": 0.28,
        "noise_sigma": 0.05,
        "rng_seed": 203,
        "delivery_platform": "Lieferando",
        "delivery_avg_order": 38.0,
    },
]

# ── data generation ────────────────────────────────────────────────────────────

def _cover_factor(d: date, cfg: dict) -> float:
    month, dow = d.month, d.weekday()
    factor = 0.0

    # Day of week — restaurants peak Fri/Sat, low Mon/Tue
    if dow == 4:    factor += cfg["weekend_boost"] * 0.7
    elif dow == 5:  factor += cfg["weekend_boost"]
    elif dow == 6:  factor += cfg["weekend_boost"] * 0.5
    elif dow == 0:  factor -= 0.08
    elif dow == 1:  factor -= 0.05

    # Seasonal
    if month in (6, 7, 8):     factor += cfg["summer_boost"]
    elif month == 12:           factor += cfg["christmas_boost"]
    elif month == 11:           factor += cfg["christmas_boost"] * 0.3
    elif month in (1, 2):       factor -= cfg["winter_dip"]
    elif month in (3, 4):       factor += 0.03
    elif month in (9, 10):      factor += 0.04

    # Oktoberfest boost for Munich
    if cfg.get("oktoberfest_boost"):
        if (month == 9 and d.day >= 17) or (month == 10 and d.day <= 6):
            factor += cfg["oktoberfest_boost"]

    # Valentine's Day
    if month == 2 and d.day == 14:
        factor += 0.25 if cfg["hotel_type"] == "fine_dining" else 0.12

    # New Year's Eve
    if month == 12 and d.day == 31:
        factor += 0.35

    return factor


def _occupancy(d: date, cfg: dict, rng: random.Random) -> float:
    raw = cfg["base_occ"] + _cover_factor(d, cfg) + rng.gauss(0, cfg["noise_sigma"])
    return max(0.10, min(0.99, round(raw, 4)))


def _avg_check(occ: float, cfg: dict, d: date, rng: random.Random) -> float:
    base = cfg["base_adr"]
    base *= 0.82 + 0.35 * occ
    if d.month in (6, 7, 8):   base *= 1.06
    elif d.month == 12:         base *= 1.10
    elif d.month in (1, 2):     base *= 0.94
    base *= rng.gauss(1.0, 0.025)
    return round(max(12.0, base), 2)


def _generate_performance(prop: Property, cfg: dict) -> list[DailyPerformance]:
    rng = random.Random(cfg["rng_seed"])
    rows = []
    d = HISTORY_START
    while d <= HISTORY_END:
        occ = _occupancy(d, cfg, rng)
        covers_sold = round(occ * prop.total_rooms)
        avg_check = _avg_check(occ, cfg, d, rng)
        revenue = round(covers_sold * avg_check, 2)
        revpash = round(revenue / prop.total_rooms, 2)
        no_shows = max(0, round(covers_sold * rng.gauss(0.03, 0.01)))
        new_bookings = max(0, covers_sold + no_shows + round(rng.gauss(3, 2)))
        rows.append(DailyPerformance(
            id=uuid.uuid4(),
            property_id=prop.id,
            date=d,
            rooms_available=prop.total_rooms,
            rooms_sold=covers_sold,
            occupancy_rate=occ,
            room_revenue=revenue,
            adr=avg_check,
            revpar=revpash,
            cancellations=no_shows,
            new_bookings=new_bookings,
            data_source="demo_seed",
            is_validated=True,
        ))
        d += timedelta(days=1)
    return rows


def _generate_forecasts(prop: Property, cfg: dict) -> list[DemandForecast]:
    rng = random.Random(cfg["rng_seed"] + 500)
    today = date(2026, 11, 1)
    rows = []
    for metric in ("occupancy", "adr", "revpar"):
        d = FORECAST_START
        while d <= FORECAST_END:
            lag = d - timedelta(weeks=52)
            lag_rng = random.Random(cfg["rng_seed"])
            lag_occ = _occupancy(lag, cfg, lag_rng)
            lag_check = _avg_check(lag_occ, cfg, lag, lag_rng)

            if metric == "occupancy":
                val = max(0.10, min(0.99, lag_occ + rng.gauss(0.005, 0.015)))
                std = 0.045
            elif metric == "adr":
                val = max(10.0, lag_check * rng.gauss(1.02, 0.02))
                std = val * 0.07
            else:
                val = round(lag_occ * lag_check * rng.gauss(1.02, 0.02), 2)
                std = val * 0.08

            rows.append(DemandForecast(
                id=uuid.uuid4(),
                property_id=prop.id,
                forecast_date=today,
                target_date=d,
                model_name="seasonal_naive",
                metric=metric,
                predicted_value=round(val, 4),
                lower_bound=round(val - 1.96 * std, 4),
                upper_bound=round(val + 1.96 * std, 4),
                confidence_level=0.95,
                mae=round(rng.uniform(0.02, 0.05), 4) if metric == "occupancy" else round(rng.uniform(1.5, 4.0), 4),
                rmse=round(rng.uniform(0.025, 0.065), 4) if metric == "occupancy" else round(rng.uniform(2.0, 5.5), 4),
                wape=round(rng.uniform(0.04, 0.09), 4),
            ))
            d += timedelta(days=1)
    return rows


# ── idealo market signals ──────────────────────────────────────────────────────

def _idealo_signals(prop: Property, org_id: uuid.UUID, cfg: dict) -> list[MarketSignal]:
    """Market intelligence sourced from idealo.de delivery price comparison."""
    platform = cfg["delivery_platform"]
    our_avg = cfg["delivery_avg_order"]
    signals = []

    # idealo price index signal — monthly competitive snapshot
    for month_offset in range(0, 22):
        signal_date = date(2025, 1, 1) + timedelta(days=month_offset * 30)
        rng = random.Random(cfg["rng_seed"] + month_offset)
        competitor_avg = round(our_avg * rng.gauss(0.97, 0.06), 2)
        gap_pct = round((our_avg - competitor_avg) / competitor_avg * 100, 1)
        direction = "negative" if gap_pct > 5 else ("positive" if gap_pct < -3 else "neutral")
        impact = "high" if abs(gap_pct) > 8 else ("medium" if abs(gap_pct) > 4 else "low")

        signals.append(MarketSignal(
            id=uuid.uuid4(),
            property_id=prop.id,
            organisation_id=org_id,
            signal_type="idealo_price_index",
            signal_date=signal_date,
            title=f"idealo.de: {platform} avg order €{competitor_avg} vs our €{our_avg:.2f} ({gap_pct:+.1f}%)",
            description=(
                f"idealo.de delivery price tracker shows {platform} competitor average "
                f"order value of €{competitor_avg} this month. Our menu pricing averages "
                f"€{our_avg:.2f} per delivery order — a {gap_pct:+.1f}% gap. "
                f"{'We are priced above market — risk of losing price-sensitive customers.' if gap_pct > 5 else 'We are competitively priced.' if gap_pct > -3 else 'Below-market pricing may be leaving revenue on the table.'}"
            ),
            impact_level=impact,
            impact_direction=direction,
            source="idealo.de/delivery",
        ))

    # Seasonal demand spike signals from idealo search volume
    idealo_spikes = [
        (date(2025, 2, 14), "Valentine's Day idealo search spike +340% for fine dining delivery"),
        (date(2025, 12, 24), "Christmas Eve idealo delivery searches up 280% — competitors sold out by 18:00"),
        (date(2026, 2, 14), "Valentine's 2026: idealo fine dining delivery demand up 310%, avg order €94"),
        (date(2026, 10, 3), "German Unity Day: idealo shows +180% delivery demand vs normal Sunday"),
    ]
    for spike_date, title in idealo_spikes:
        signals.append(MarketSignal(
            id=uuid.uuid4(),
            property_id=prop.id,
            organisation_id=org_id,
            signal_type="idealo_demand_spike",
            signal_date=spike_date,
            title=title,
            description=f"idealo.de price comparison data reveals a significant demand spike. "
                        f"Platforms on idealo showing price premiums of 15–30% on this date. "
                        f"Recommend reviewing {platform} surge pricing and in-house reservation strategy.",
            impact_level="high",
            impact_direction="positive",
            source="idealo.de/trends",
        ))

    return signals


# ── curated recommendations ────────────────────────────────────────────────────

def _recs_mitte(prop: Property, org_id: uuid.UUID) -> list[Recommendation]:
    return [
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Raise delivery menu prices 8% — idealo shows room",
            description="idealo.de price tracker shows competitor fine dining delivery averaging €74 vs our €68. "
                       "14 consecutive months of data confirms we are systematically under-priced on Wolt.",
            category="pricing",
            suggested_action="Increase Wolt menu prices by 8% across all mains and desserts. Keep wine list unchanged.",
            expected_impact_description="~€1,800 additional monthly delivery revenue at current order volumes.",
            expected_revenue_impact=1800.00,
            expected_occupancy_impact=None,
            confidence_score=0.84,
            risk_level="low",
            status="approved",
            evidence={"idealo_competitor_avg": 74.0, "our_wolt_avg": 68.0, "months_tracked": 14, "source": "idealo.de/delivery"},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Valentine's Day: pre-fixe only, no à la carte",
            description="Cover occupancy hit 99% on Valentine's 2025 and 2026 but avg check was 12% below NYE. "
                       "idealo shows demand so high that price premiums are accepted by competitors.",
            category="pricing",
            suggested_action="Offer pre-fixe menu only on Feb 14 at €95pp (4 courses + champagne). Remove à la carte.",
            expected_impact_description="Lift avg check from €68 to €95 on 90 covers = +€2,430 on one night.",
            expected_revenue_impact=2430.00,
            expected_occupancy_impact=None,
            confidence_score=0.91,
            risk_level="low",
            status="pending",
            evidence={"valentines_occ_2025": 0.99, "valentines_occ_2026": 0.99, "idealo_demand_spike": "340%", "competitor_prix_fixe_avg": 88.0},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Monday closure — covers don't cover costs",
            description="Monday covers averaged 29% occupancy Jan–Oct 2026, generating €1,240/day revenue "
                       "against estimated €1,850 fixed cost floor. Net loss every Monday.",
            category="operations",
            suggested_action="Close Mondays from January 2027. Redirect staff to Tuesday prep and private event setups.",
            expected_impact_description="Save ~€610/week in net losses. Reallocate 3 FTE staff hours to higher-value shifts.",
            expected_revenue_impact=2440.00,
            expected_occupancy_impact=None,
            confidence_score=0.88,
            risk_level="medium",
            status="pending",
            evidence={"monday_avg_occ": 0.29, "monday_revenue": 1240, "fixed_cost_floor": 1850},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Launch private dining room for corporate events",
            description="Tuesday–Thursday covers are 54% — below break-even. The private room (12 seats) "
                       "is used ad-hoc. Formalising it as a bookable product can fill the gap.",
            category="distribution",
            suggested_action="List private dining room on OpenTable and direct website. Minimum 10 guests, €85pp minimum spend.",
            expected_impact_description="2–3 bookings/month = ~€2,000–3,000 additional monthly revenue.",
            expected_revenue_impact=2500.00,
            expected_occupancy_impact=0.08,
            confidence_score=0.75,
            risk_level="low",
            status="completed",
            evidence={"weekday_avg_occ": 0.54, "private_room_capacity": 12},
        ),
    ]


def _recs_hamburg(prop: Property, org_id: uuid.UUID) -> list[Recommendation]:
    return [
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Lieferando commission too high — test direct ordering",
            description="Lieferando charges 13% commission. idealo.de shows our avg delivery order at €31, "
                       "so we lose €4.03 per order. 2026 YTD: 4,200 Lieferando orders = €16,900 in commission.",
            category="channel_management",
            suggested_action="Build direct ordering page (order.gastro-hamburg.de). Offer 10% discount vs Lieferando price to incentivise shift.",
            expected_impact_description="If 30% of orders shift to direct: save ~€5,000/year in commissions.",
            expected_revenue_impact=5000.00,
            expected_occupancy_impact=None,
            confidence_score=0.72,
            risk_level="medium",
            status="pending",
            evidence={"lieferando_commission": 0.13, "avg_order": 31.0, "ytd_orders": 4200, "ytd_commission": 16926, "source": "idealo.de/delivery"},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Summer harbour terrace — increase covers by 40 for June–August",
            description="Summer occupancy hits 95%+ on Friday–Sunday. We turn away 15–20 walk-ins per night "
                       "with no way to capture them. The harbour terrace has unused capacity.",
            category="operations",
            suggested_action="Set up 20 additional terrace covers (10 tables × 2) for June–August. Hire 1 seasonal server.",
            expected_impact_description="~20 additional covers × 3 days × 13 weeks × €29 avg = ~€22,620 seasonal uplift.",
            expected_revenue_impact=22620.00,
            expected_occupancy_impact=0.12,
            confidence_score=0.82,
            risk_level="low",
            status="approved",
            evidence={"summer_weekend_occ": 0.95, "avg_walkaway_covers": 17, "terrace_unused_tables": 10},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Introduce prix-fixe lunch for port workers — Mon to Fri",
            description="Lunchtime Mon–Fri occupancy is 48%. The harbour area has 2,000+ port-adjacent workers. "
                       "A fast €16 lunch special can drive regular repeat customers.",
            category="packages",
            suggested_action="Offer a 2-course express lunch at €16 (45-min service guarantee). Promote via Hamburg Port Authority intranet.",
            expected_impact_description="Target 65% lunch occupancy (+17pp) = ~€3,100 additional monthly lunch revenue.",
            expected_revenue_impact=3100.00,
            expected_occupancy_impact=0.17,
            confidence_score=0.70,
            risk_level="low",
            status="pending",
            evidence={"lunch_weekday_occ": 0.48, "port_workers_nearby": 2000},
        ),
    ]


def _recs_munich(prop: Property, org_id: uuid.UUID) -> list[Recommendation]:
    return [
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Oktoberfest: 48h advance reservation only, no walk-ins",
            description="Oktoberfest 2025 and 2026 saw 100% covers by 17:00 daily with 30+ walk-in rejections/night. "
                       "Walk-ins disrupt service and have lower avg check than reservations.",
            category="operations",
            suggested_action="Require 48h advance reservation for all Oktoberfest period (Sep 20 – Oct 6 2027). No walk-in policy.",
            expected_impact_description="Better service flow, higher avg check (+€4 estimated), eliminate walk-in friction.",
            expected_revenue_impact=3200.00,
            expected_occupancy_impact=None,
            confidence_score=0.89,
            risk_level="low",
            status="completed",
            evidence={"okfest_occ": 1.0, "daily_walkin_rejections": 32, "reservation_vs_walkin_check_gap": 4.2},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Lieferando vs idealo — premium beer garden box launch",
            description="idealo.de shows growing demand for premium Bavarian meal kits delivered to home. "
                       "Competitor 'Hofbräu Box' at €54 sells out every Friday on idealo delivery comparison.",
            category="packages",
            suggested_action="Launch 'Gastro Munich Brotzeit Box' (€48 for 2): pretzels, cold cuts, radishes, 2×0.5L Helles. List on Lieferando + idealo.",
            expected_impact_description="Target 25 boxes/week at €48 = €1,200/week = €62,400/year new revenue channel.",
            expected_revenue_impact=62400.00,
            expected_occupancy_impact=None,
            confidence_score=0.68,
            risk_level="medium",
            status="pending",
            evidence={"idealo_competitor_brotzeit_price": 54.0, "weekly_sellout": True, "source": "idealo.de/delivery/munich"},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Raise weekday lunch avg check by offering Tagesessen upgrade",
            description="Weekday lunch avg check is €28 vs weekend €38. Introducing a premium Tagesessen option "
                       "at €34 (with soup starter) can lift the weekday average without adding covers.",
            category="pricing",
            suggested_action="Add 'Tagesessen Premium' at €34 — includes soup of the day, main, and coffee. Train staff to suggest it first.",
            expected_impact_description="If 35% of lunch covers upgrade: +€2.10 per cover × 85 covers × 5 days × 52 weeks = +€46,410/year.",
            expected_revenue_impact=46410.00,
            expected_occupancy_impact=None,
            confidence_score=0.76,
            risk_level="low",
            status="pending",
            evidence={"weekday_lunch_avg_check": 28.0, "weekend_avg_check": 38.0, "lunch_covers_avg": 85},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Christmas market season: add mulled wine stand outside",
            description="Dec 1–22 street traffic past the restaurant increases 4× during Christkindlmarkt. "
                       "An outdoor mulled wine (Glühwein) stand captures passing trade with zero seat capacity impact.",
            category="operations",
            suggested_action="Set up licensed mulled wine stand (Glühweinstand) outside Dec 1–22. €4.50/cup, target 80 cups/day.",
            expected_impact_description="80 cups × €4.50 × 22 days = €7,920 incremental revenue at ~85% margin.",
            expected_revenue_impact=7920.00,
            expected_occupancy_impact=None,
            confidence_score=0.86,
            risk_level="low",
            status="approved",
            evidence={"christkindlmarkt_foot_traffic_multiplier": 4.2, "target_cups_per_day": 80, "cup_price": 4.50},
        ),
    ]


REC_BUILDERS = {
    "gastro-berlin-mitte": _recs_mitte,
    "gastro-hamburg-harbour": _recs_hamburg,
    "gastro-munich-bavarian": _recs_munich,
}

# ── main seed ──────────────────────────────────────────────────────────────────

def seed(database_url: str | None = None) -> None:
    db_url = database_url or os.environ["DATABASE_URL"]
    is_sqlite = db_url.startswith("sqlite")
    kwargs: dict = {}
    if is_sqlite:
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        kwargs.update({"pool_size": 5, "max_overflow": 10})

    engine = create_engine(db_url, **kwargs)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    db = Session()

    try:
        # ── 1. User ───────────────────────────────────────────────────────────
        user = db.query(User).filter(User.email == RESTAURANT_EMAIL).first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email=RESTAURANT_EMAIL,
                hashed_password=hash_password(RESTAURANT_PASSWORD),
                full_name="Restaurant Demo Manager",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()
            print(f"  created user  {RESTAURANT_EMAIL}")
        else:
            print(f"  user exists   {RESTAURANT_EMAIL}")

        # ── 2. Organisation ───────────────────────────────────────────────────
        org = db.query(Organisation).filter(Organisation.slug == RESTAURANT_ORG_SLUG).first()
        if not org:
            org = Organisation(
                id=uuid.uuid4(),
                name="Gastro Berlin Group",
                slug=RESTAURANT_ORG_SLUG,
                description="Multi-location restaurant group with idealo.de delivery price intelligence",
                subscription_tier="professional",
                is_active=True,
                max_properties=10,
            )
            db.add(org)
            db.flush()
            print(f"  created org   {org.name}")
        else:
            print(f"  org exists    {org.name}")

        # ── 3. Membership ─────────────────────────────────────────────────────
        member = db.query(OrganisationMember).filter(
            OrganisationMember.organisation_id == org.id,
            OrganisationMember.user_id == user.id,
        ).first()
        if not member:
            db.add(OrganisationMember(
                id=uuid.uuid4(),
                organisation_id=org.id,
                user_id=user.id,
                role="owner",
                is_active=True,
            ))
            print("  created membership  owner")

        # ── 4. Restaurants + data ─────────────────────────────────────────────
        for cfg in RESTAURANT_CONFIGS:
            prop = db.query(Property).filter(
                Property.slug == cfg["slug"],
                Property.organisation_id == org.id,
            ).first()
            if not prop:
                prop = Property(
                    id=uuid.uuid4(),
                    organisation_id=org.id,
                    name=cfg["name"],
                    slug=cfg["slug"],
                    city=cfg["city"],
                    country="DE",
                    address=cfg["address"],
                    total_rooms=cfg["total_rooms"],
                    stars=cfg["stars"],
                    latitude=cfg["latitude"],
                    longitude=cfg["longitude"],
                    property_type="restaurant",
                    is_demo=True,
                    is_active=True,
                )
                db.add(prop)
                db.flush()
                print(f"\n  restaurant: {prop.name}  ({prop.total_rooms} covers/day)")
            else:
                print(f"\n  restaurant exists: {prop.name}")

            # Daily performance (covers data)
            existing_perf = db.query(DailyPerformance).filter(
                DailyPerformance.property_id == prop.id
            ).count()
            if existing_perf == 0:
                rows = _generate_performance(prop, cfg)
                db.bulk_save_objects(rows)
                print(f"    seeded {len(rows)} daily cover rows")
            else:
                print(f"    covers already seeded ({existing_perf} rows)")

            # Forecasts
            existing_fc = db.query(DemandForecast).filter(
                DemandForecast.property_id == prop.id
            ).count()
            if existing_fc == 0:
                fc_rows = _generate_forecasts(prop, cfg)
                db.bulk_save_objects(fc_rows)
                print(f"    seeded {len(fc_rows)} forecast rows")
            else:
                print(f"    forecasts already seeded ({existing_fc} rows)")

            # idealo market signals
            existing_signals = db.query(MarketSignal).filter(
                MarketSignal.property_id == prop.id
            ).count()
            if existing_signals == 0:
                signals = _idealo_signals(prop, org.id, cfg)
                for s in signals:
                    db.add(s)
                print(f"    seeded {len(signals)} idealo.de market signals")
            else:
                print(f"    market signals already seeded ({existing_signals})")

            # Recommendations
            existing_recs = db.query(Recommendation).filter(
                Recommendation.property_id == prop.id
            ).count()
            if existing_recs == 0:
                builder = REC_BUILDERS.get(cfg["slug"])
                if builder:
                    recs = builder(prop, org.id)
                    for r in recs:
                        db.add(r)
                    print(f"    seeded {len(recs)} recommendations")
            else:
                print(f"    recommendations already seeded ({existing_recs})")

        db.commit()
        print("\n✓ Restaurant demo seed complete.")
        print(f"\n  Login:    {RESTAURANT_EMAIL}")
        print(f"  Password: {RESTAURANT_PASSWORD}")
        print(f"  Org:      Gastro Berlin Group")
        print(f"  Restaurants: Mitte Fine Dining · Hamburg Harbour Bistro · Munich Bavarian\n")
        print(f"  Market data: idealo.de delivery price intelligence included\n")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
        engine.dispose()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed Wimmer restaurant demo")
    parser.add_argument("--database-url", default=None)
    args = parser.parse_args()
    print("\nWimmer — seeding restaurant demo data...\n")
    seed(args.database_url)
