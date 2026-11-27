"""
Seed the Wimmer database with a full SaaS demo.

Creates:
  - Organisation: Wimmer Hotels Group
  - User:         demo@wimmer.dev  /  demo1234
  - Properties:   Berlin Central (142), Hamburg Harbour (98), Munich Residence (76)
  - History:      Jan 2025 → Oct 2026  (~22 months of daily performance)
  - Forecasts:    Nov 2026 → Feb 2027  (90 days per metric per property)
  - Recs:         5–7 curated recommendations per property at mixed statuses

Safe to re-run — skips rows that already exist.
"""
from __future__ import annotations

import math
import os
import random
import sys
import uuid
from datetime import date, timedelta

# Allow running as a script from the api root
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
from wimmer.db.models.performance import DailyPerformance
from wimmer.db.models.property import Property
from wimmer.db.models.recommendation import Recommendation
from wimmer.db.models.user import User

# ── constants ──────────────────────────────────────────────────────────────────

DEMO_EMAIL = "demo@wimmer.dev"
DEMO_PASSWORD = "demo1234"
DEMO_ORG_SLUG = "wimmer-hotels-group"

HISTORY_START = date(2025, 1, 1)
HISTORY_END = date(2026, 10, 31)
FORECAST_START = date(2026, 11, 1)
FORECAST_END = date(2027, 2, 28)

PROPERTY_CONFIGS = [
    {
        "name": "Wimmer Berlin Central",
        "slug": "wimmer-berlin-central",
        "city": "Berlin",
        "address": "Unter den Linden 1, 10117 Berlin",
        "total_rooms": 142,
        "stars": 4,
        "latitude": 52.5200,
        "longitude": 13.4050,
        "hotel_type": "business_leisure",
        "base_occ": 0.68,
        "base_adr": 132.0,
        "weekend_boost": 0.07,
        "summer_boost": 0.12,
        "winter_dip": 0.07,
        "christmas_boost": 0.18,
        "noise_sigma": 0.045,
        "rng_seed": 42,
    },
    {
        "name": "Wimmer Hamburg Harbour",
        "slug": "wimmer-hamburg-harbour",
        "city": "Hamburg",
        "address": "Hafenstraße 10, 20459 Hamburg",
        "total_rooms": 98,
        "stars": 4,
        "latitude": 53.5461,
        "longitude": 9.9941,
        "hotel_type": "leisure",
        "base_occ": 0.63,
        "base_adr": 118.0,
        "weekend_boost": 0.12,
        "summer_boost": 0.17,
        "winter_dip": 0.09,
        "christmas_boost": 0.10,
        "noise_sigma": 0.05,
        "rng_seed": 7,
    },
    {
        "name": "Wimmer Munich Residence",
        "slug": "wimmer-munich-residence",
        "city": "Munich",
        "address": "Maximilianstraße 15, 80539 Munich",
        "total_rooms": 76,
        "stars": 5,
        "latitude": 48.1351,
        "longitude": 11.5820,
        "hotel_type": "luxury",
        "base_occ": 0.73,
        "base_adr": 198.0,
        "weekend_boost": 0.05,
        "summer_boost": 0.09,
        "winter_dip": 0.06,
        "christmas_boost": 0.16,
        "oktoberfest_boost": 0.26,
        "noise_sigma": 0.04,
        "rng_seed": 99,
    },
]

# ── data generation helpers ────────────────────────────────────────────────────

def _seasonal_factor(d: date, cfg: dict) -> float:
    """Return an additive occupancy adjustment for a given date."""
    month, dow = d.month, d.weekday()

    factor = 0.0

    # Weekday pattern
    if dow == 4:   # Friday
        factor += cfg["weekend_boost"] * 0.6
    elif dow == 5:  # Saturday
        factor += cfg["weekend_boost"]
    elif dow == 6:  # Sunday — departure day
        factor += cfg["weekend_boost"] * 0.4
    elif dow == 0 and cfg["hotel_type"] == "leisure":  # Monday low for leisure
        factor -= 0.07

    # Monthly seasonality
    if month in (6, 7, 8):
        factor += cfg["summer_boost"]
    elif month in (12,):
        factor += cfg["christmas_boost"]
    elif month == 11:
        factor += cfg["christmas_boost"] * 0.4
    elif month in (1, 2):
        factor -= cfg["winter_dip"]
    elif month in (3, 4):
        factor += 0.02
    elif month in (9, 10):
        factor += 0.05  # autumn conferences

    # Oktoberfest: 3rd Saturday of September → first Sunday of October
    if cfg.get("oktoberfest_boost"):
        late_sep = month == 9 and d.day >= 17
        early_oct = month == 10 and d.day <= 6
        if late_sep or early_oct:
            factor += cfg["oktoberfest_boost"]

    # Berlin ITB trade fair: first week of March (odd years)
    if cfg["slug"] == "wimmer-berlin-central" and month == 3 and d.day <= 7:
        factor += 0.14

    return factor


def _occupancy(d: date, cfg: dict, rng: random.Random) -> float:
    raw = cfg["base_occ"] + _seasonal_factor(d, cfg) + rng.gauss(0, cfg["noise_sigma"])
    return max(0.12, min(0.98, round(raw, 4)))


def _adr(occ: float, cfg: dict, d: date, rng: random.Random) -> float:
    base = cfg["base_adr"]
    # Demand pricing: ADR scales with occupancy (yield management proxy)
    base *= 0.80 + 0.42 * occ
    # Seasonal premium on ADR
    if d.month in (6, 7, 8):
        base *= 1.12
    elif d.month == 12:
        base *= 1.08
    elif d.month in (1, 2):
        base *= 0.92
    base *= rng.gauss(1.0, 0.025)
    return round(max(55.0, base), 2)


def _generate_performance(prop: Property, cfg: dict) -> list[DailyPerformance]:
    rng = random.Random(cfg["rng_seed"])
    rows = []
    d = HISTORY_START
    while d <= HISTORY_END:
        occ = _occupancy(d, cfg, rng)
        rooms_sold = round(occ * prop.total_rooms)
        adr = _adr(occ, cfg, d, rng)
        revenue = round(rooms_sold * adr, 2)
        revpar = round(revenue / prop.total_rooms, 2)
        cancellations = max(0, round(rooms_sold * rng.gauss(0.025, 0.01)))
        new_bookings = max(0, rooms_sold + cancellations + round(rng.gauss(2, 2)))
        rows.append(DailyPerformance(
            id=uuid.uuid4(),
            property_id=prop.id,
            date=d,
            rooms_available=prop.total_rooms,
            rooms_sold=rooms_sold,
            occupancy_rate=occ,
            room_revenue=revenue,
            adr=adr,
            revpar=revpar,
            cancellations=cancellations,
            new_bookings=new_bookings,
            data_source="demo_seed",
            is_validated=True,
        ))
        d += timedelta(days=1)
    return rows


def _generate_forecasts(prop: Property, cfg: dict) -> list[DemandForecast]:
    """Seasonal-naïve forecast: use same weekday from 52 weeks prior + drift."""
    rng = random.Random(cfg["rng_seed"] + 1000)
    today = date(2026, 11, 1)
    rows = []

    for metric in ("occupancy", "adr", "revpar"):
        d = FORECAST_START
        while d <= FORECAST_END:
            lag = d - timedelta(weeks=52)
            lag_occ = _occupancy(lag, cfg, random.Random(cfg["rng_seed"]))
            lag_adr = _adr(lag_occ, cfg, lag, random.Random(cfg["rng_seed"] + 1))

            if metric == "occupancy":
                val = max(0.10, min(0.98, lag_occ + rng.gauss(0.005, 0.015)))
                std = 0.04
            elif metric == "adr":
                val = max(50.0, lag_adr * rng.gauss(1.02, 0.02))
                std = val * 0.06
            else:  # revpar
                rooms = prop.total_rooms
                val = max(0.0, (val if metric == "revpar" else lag_adr * lag_occ))
                val = round(lag_occ * lag_adr * rng.gauss(1.02, 0.02), 2)
                std = val * 0.07

            conf = 0.95
            z = 1.96
            rows.append(DemandForecast(
                id=uuid.uuid4(),
                property_id=prop.id,
                forecast_date=today,
                target_date=d,
                model_name="seasonal_naive",
                metric=metric,
                predicted_value=round(val, 4),
                lower_bound=round(val - z * std, 4),
                upper_bound=round(val + z * std, 4),
                confidence_level=conf,
                mae=round(rng.uniform(0.015, 0.045), 4) if metric == "occupancy" else round(rng.uniform(3.0, 8.0), 4),
                rmse=round(rng.uniform(0.02, 0.06), 4) if metric == "occupancy" else round(rng.uniform(4.0, 10.0), 4),
                wape=round(rng.uniform(0.03, 0.08), 4),
            ))
            d += timedelta(days=1)
    return rows


# ── curated recommendations ────────────────────────────────────────────────────

def _recs_berlin(prop: Property, org_id: uuid.UUID) -> list[Recommendation]:
    return [
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Raise weekend rates by 12% for February",
            description="Weekend occupancy in February averaged 74% vs 61% weekday — the spread justifies a rate premium.",
            category="pricing",
            suggested_action="Increase Saturday–Sunday BAR by €16 for the next 6 Saturdays and Sundays.",
            expected_impact_description="~€2,100 additional revenue over 6 weekends.",
            expected_revenue_impact=2100.00,
            expected_occupancy_impact=None,
            confidence_score=0.82,
            risk_level="low",
            status="approved",
            evidence={"avg_weekend_occ": 0.74, "avg_weekday_occ": 0.61, "weeks_analysed": 8},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Introduce minimum 3-night stay during ITB Berlin",
            description="ITB (early March) consistently drives 95%+ occupancy. Single-night guests crowd out higher-value conference stays.",
            category="restrictions",
            suggested_action="Set MinLOS=3 for 1–8 March 2027 on all rate plans.",
            expected_impact_description="Shift mix toward longer, higher-value bookings; estimated +€4,800 RevPAR impact.",
            expected_revenue_impact=4800.00,
            expected_occupancy_impact=0.0,
            confidence_score=0.88,
            risk_level="low",
            status="pending",
            evidence={"itb_avg_occ_2025": 0.96, "itb_avg_occ_2026": 0.94, "single_night_pct": 0.38},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Launch early-bird summer package for July",
            description="Booking window for July has narrowed — average lead time dropped from 42 to 28 days over 2025–2026.",
            category="distribution",
            suggested_action="Offer a 10% advance-purchase rate for July bookings made before April 30.",
            expected_impact_description="Increase forward-booked occupancy and reduce last-minute discounting exposure.",
            expected_revenue_impact=3200.00,
            expected_occupancy_impact=0.04,
            confidence_score=0.74,
            risk_level="medium",
            status="pending",
            evidence={"avg_lead_time_2025": 42, "avg_lead_time_2026": 28, "july_last_min_discount_pct": 0.22},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Close channels on 24–26 December — rate floor only",
            description="December 24–26 saw 97% occupancy in 2025 and 2026. OTA commissions are not justified at this demand level.",
            category="channel_management",
            suggested_action="Restrict to direct booking only (website + phone) for 24–26 Dec 2026.",
            expected_impact_description="Save ~€1,400 in OTA commissions on 3 near-certain sell-out nights.",
            expected_revenue_impact=1400.00,
            expected_occupancy_impact=None,
            confidence_score=0.91,
            risk_level="low",
            status="completed",
            evidence={"dec_24_occ_2025": 0.97, "dec_25_occ_2025": 0.99, "dec_26_occ_2025": 0.96},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Add corporate rate tier for mid-week Q1 2027",
            description="Mid-week Q1 occupancy is 59% — well below break-even threshold. Targeted corporate negotiated rates can fill these gaps.",
            category="pricing",
            suggested_action="Create a 'Corporate Winter' negotiated rate at €108 for Mon–Thu Jan–Mar 2027.",
            expected_impact_description="Target 68% mid-week occupancy (+9pp); estimated +€6,200 revenue uplift.",
            expected_revenue_impact=6200.00,
            expected_occupancy_impact=0.09,
            confidence_score=0.70,
            risk_level="medium",
            status="pending",
            evidence={"q1_weekday_occ": 0.59, "competitor_corp_rate_range": [100, 120]},
        ),
    ]


def _recs_hamburg(prop: Property, org_id: uuid.UUID) -> list[Recommendation]:
    return [
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Package harbour cruise + room for summer weekends",
            description="Hamburg harbour tours are the #1 activity in guest surveys. A bundled package can lift direct booking share.",
            category="packages",
            suggested_action="Partner with Hadag ferry for a room + 2× cruise ticket package priced at €10 premium over BAR.",
            expected_impact_description="Increase direct booking mix by 8%; reduce OTA dependency during peak summer.",
            expected_revenue_impact=2800.00,
            expected_occupancy_impact=0.03,
            confidence_score=0.76,
            risk_level="low",
            status="approved",
            evidence={"direct_booking_pct": 0.31, "ota_commission_avg": 0.17, "guest_survey_top_activity": "harbour_cruise"},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Dynamic pricing floor: Sunday nights in summer",
            description="Sunday-night summer ADR is €22 below Friday — but Sunday occupancy is only 4pp lower. The gap is irrational.",
            category="pricing",
            suggested_action="Set Sunday summer (Jun–Aug) BAR floor to match Friday BAR.",
            expected_impact_description="~€1,900 additional revenue across 13 summer Sundays.",
            expected_revenue_impact=1900.00,
            expected_occupancy_impact=None,
            confidence_score=0.83,
            risk_level="low",
            status="pending",
            evidence={"fri_summer_adr": 148.0, "sun_summer_adr": 126.0, "fri_summer_occ": 0.81, "sun_summer_occ": 0.77},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Activate last-minute rate for Monday–Wednesday February",
            description="Monday–Wednesday February occupancy averaged 48% with heavy last-minute emptiness. A -15% same-week rate can fill gaps.",
            category="pricing",
            suggested_action="Configure automatic same-week discounting: if occupancy < 50% by Friday noon, trigger a 15% markdown.",
            expected_impact_description="Project 10pp occupancy lift on affected nights; net revenue positive even at discount.",
            expected_revenue_impact=1100.00,
            expected_occupancy_impact=0.10,
            confidence_score=0.68,
            risk_level="medium",
            status="rejected",
            evidence={"feb_weekday_occ": 0.48, "last_min_fill_rate_2025": 0.61},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Reposition as 'Hamburg Port District' brand on OTAs",
            description="Competitor hotels listing 'HafenCity' location terms show 23% higher CTR on Booking.com than generic Hamburg listings.",
            category="distribution",
            suggested_action="Update all OTA listing titles, meta-descriptions, and photo captions to emphasise waterfront/harbour positioning.",
            expected_impact_description="Improve search ranking and CTR; expect 5–8% increase in OTA-driven bookings.",
            expected_revenue_impact=3400.00,
            expected_occupancy_impact=0.05,
            confidence_score=0.65,
            risk_level="low",
            status="completed",
            evidence={"competitor_hafencity_ctr_lift": 0.23, "current_listing_rank": 14},
        ),
    ]


def _recs_munich(prop: Property, org_id: uuid.UUID) -> list[Recommendation]:
    return [
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Oktoberfest: 4-night minimum stay, 30% rate premium",
            description="2025 and 2026 Oktoberfest occupancy hit 100% by D-21. Current rate strategy left €18K on the table vs comp set.",
            category="pricing",
            suggested_action="Set MinLOS=4 and +30% BAR premium for 20 Sep – 6 Oct 2027. Release restrictions at D-7 if >15% remains.",
            expected_impact_description="Projected +€18,000–22,000 revenue uplift vs current Oktoberfest strategy.",
            expected_revenue_impact=20000.00,
            expected_occupancy_impact=0.0,
            confidence_score=0.93,
            risk_level="low",
            status="approved",
            evidence={"okfest_2025_sellout_daysout": 21, "okfest_2026_sellout_daysout": 18, "comp_set_premium_avg": 0.42},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Introduce suite upsell program at check-in",
            description="Suite utilisation averaged 61% while standard rooms ran at 89%. Real-time upsell at check-in can close the gap.",
            category="upsell",
            suggested_action="Train front desk with scripted upsell offer: suite for €45 above booked rate if available. Add to pre-arrival email (D-2).",
            expected_impact_description="Lift suite utilisation to 78%; estimated +€8,500 annual ancillary revenue.",
            expected_revenue_impact=8500.00,
            expected_occupancy_impact=None,
            confidence_score=0.79,
            risk_level="low",
            status="pending",
            evidence={"suite_occ": 0.61, "standard_occ": 0.89, "upsell_acceptance_industry_avg": 0.18},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="BAV auto show (IAA Mobility) — close OTAs, direct only",
            description="IAA Mobility (Sep 2027) is confirmed for Munich. 2025 IAA drove 98% occupancy in a 5-day window.",
            category="channel_management",
            suggested_action="Block OTA availability for IAA week (8–14 Sep 2027). Redirect all demand to direct channel at €240 BAR.",
            expected_impact_description="Save €4,200 in commissions; direct booking premium adds further margin.",
            expected_revenue_impact=5800.00,
            expected_occupancy_impact=None,
            confidence_score=0.90,
            risk_level="low",
            status="pending",
            evidence={"iaa_2025_occ": 0.98, "ota_commission_pct": 0.17},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Christmas market extended stay — min 2 nights from 1 Dec",
            description="Dec 1–22 saw 91% of arrivals book 1-night only, leaving gaps on subsequent nights.",
            category="restrictions",
            suggested_action="Set MinLOS=2 for Dec 1–22 2026. Exception for Dec 23+ where MinLOS=3.",
            expected_impact_description="Fill trailing nights of short stays; estimated +€3,100 revenue over 22 days.",
            expected_revenue_impact=3100.00,
            expected_occupancy_impact=0.07,
            confidence_score=0.77,
            risk_level="medium",
            status="completed",
            evidence={"dec_single_night_pct": 0.91, "trailing_night_occ": 0.58},
        ),
        Recommendation(
            id=uuid.uuid4(), property_id=prop.id, organisation_id=org_id,
            title="Q1 2027: corporate extended-stay package for BMW / Siemens",
            description="BMW HQ and Siemens Campus are within 8km. Week-long stays from corporate travellers are under-indexed vs Munich market.",
            category="packages",
            suggested_action="Create a 7-night corporate rate at €165/night with breakfast included, targeted at BMW and Siemens travel desks.",
            expected_impact_description="10–12 weekly-stay bookings per month in Q1 = ~€14,000 incremental revenue.",
            expected_revenue_impact=14000.00,
            expected_occupancy_impact=0.08,
            confidence_score=0.72,
            risk_level="medium",
            status="pending",
            evidence={"bmw_hq_distance_km": 7.2, "siemens_campus_km": 5.8, "current_extended_stay_pct": 0.04},
        ),
    ]


REC_BUILDERS = {
    "wimmer-berlin-central": _recs_berlin,
    "wimmer-hamburg-harbour": _recs_hamburg,
    "wimmer-munich-residence": _recs_munich,
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
        # ── 1. Demo user ──────────────────────────────────────────────────────
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email=DEMO_EMAIL,
                hashed_password=hash_password(DEMO_PASSWORD),
                full_name="Demo Manager",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()
            print(f"  created user  {DEMO_EMAIL}")
        else:
            print(f"  user exists   {DEMO_EMAIL}")

        # ── 2. Organisation ───────────────────────────────────────────────────
        org = db.query(Organisation).filter(Organisation.slug == DEMO_ORG_SLUG).first()
        if not org:
            org = Organisation(
                id=uuid.uuid4(),
                name="Wimmer Hotels Group",
                slug=DEMO_ORG_SLUG,
                description="Multi-property boutique hotel group across Germany",
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

        # ── 4. Properties + data ──────────────────────────────────────────────
        for cfg in PROPERTY_CONFIGS:
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
                    property_type="hotel",
                    is_demo=True,
                    is_active=True,
                )
                db.add(prop)
                db.flush()
                print(f"\n  property: {prop.name}  ({prop.total_rooms} rooms)")
            else:
                print(f"\n  property exists: {prop.name}")

            # Daily performance
            existing_perf = db.query(DailyPerformance).filter(
                DailyPerformance.property_id == prop.id
            ).count()
            if existing_perf == 0:
                rows = _generate_performance(prop, cfg)
                db.bulk_save_objects(rows)
                print(f"    seeded {len(rows)} daily performance rows ({HISTORY_START} → {HISTORY_END})")
            else:
                print(f"    performance already seeded ({existing_perf} rows)")

            # Forecasts
            existing_fc = db.query(DemandForecast).filter(
                DemandForecast.property_id == prop.id
            ).count()
            if existing_fc == 0:
                fc_rows = _generate_forecasts(prop, cfg)
                db.bulk_save_objects(fc_rows)
                print(f"    seeded {len(fc_rows)} forecast rows ({FORECAST_START} → {FORECAST_END})")
            else:
                print(f"    forecasts already seeded ({existing_fc} rows)")

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
        print("\n✓ Demo seed complete.")
        print(f"\n  Login:    {DEMO_EMAIL}")
        print(f"  Password: {DEMO_PASSWORD}")
        print(f"  Org:      Wimmer Hotels Group")
        print(f"  Hotels:   Berlin Central · Hamburg Harbour · Munich Residence\n")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
        engine.dispose()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed Wimmer demo data")
    parser.add_argument("--database-url", help="Override DATABASE_URL", default=None)
    args = parser.parse_args()

    print("\nWimmer — seeding demo data...\n")
    seed(args.database_url)
