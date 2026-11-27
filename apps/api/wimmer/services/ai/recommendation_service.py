"""
AI Decision Centre — DISCOVER → VERIFY → PREDICT → RECOMMEND → ACT
The LLM interprets validated statistical outputs. It never invents numerical predictions.
"""
from __future__ import annotations

import json
import uuid
from datetime import date, timedelta

from sqlalchemy.orm import Session

from wimmer.core.logging import get_logger
from wimmer.db.models.performance import DailyPerformance
from wimmer.db.models.property import Property
from wimmer.db.models.recommendation import Recommendation, RecommendationStatus
from wimmer.schemas.recommendation import RecommendationApproval
from wimmer.services.ai.llm_provider import get_llm_provider
from wimmer.services.forecasting.engine import ForecastingEngine

logger = get_logger("wimmer.ai.recommendations")

SYSTEM_PROMPT = """You are Wimmer Intelligence, an expert hospitality revenue and operations analyst.

Your role is to analyse validated hotel performance data and statistical forecasts, then generate evidence-backed commercial recommendations.

RULES:
- Base ALL recommendations on the validated data and forecast figures provided. Never invent data.
- Never claim specific occupancy percentages, revenue figures, or ADR values unless taken directly from the provided context.
- Each recommendation must cite specific evidence from the data.
- Distinguish between statistical forecast uncertainty and business risk.
- Recommendations must be commercially actionable, not generic.
- Do not recommend automatic price changes without human approval.
- Output valid JSON only.

Output schema:
{
  "recommendations": [
    {
      "title": "string (max 80 chars)",
      "description": "string — detailed analysis",
      "category": "revenue|operations|staffing|procurement|marketing",
      "suggested_action": "string — specific action to take",
      "expected_impact_description": "string",
      "expected_revenue_impact": number_or_null,
      "expected_occupancy_impact": number_or_null,
      "confidence_score": number_0_to_1,
      "risk_level": "low|medium|high",
      "evidence_summary": "string — cite specific data points"
    }
  ],
  "reasoning": "string — overall analytical reasoning"
}"""


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm_provider()
        self.forecasting = ForecastingEngine(db)

    def generate_for_property(self, property_obj: Property, org_id: uuid.UUID) -> list[Recommendation]:
        """Full DISCOVER → VERIFY → PREDICT → RECOMMEND pipeline."""

        # DISCOVER: gather recent performance
        today = date.today()
        lookback = today - timedelta(days=90)
        rows = (
            self.db.query(DailyPerformance)
            .filter(DailyPerformance.property_id == property_obj.id, DailyPerformance.date >= lookback, DailyPerformance.is_validated == True)
            .order_by(DailyPerformance.date)
            .all()
        )

        # VERIFY: check data quality
        if len(rows) < 7:
            logger.warning("insufficient_data_for_recommendations", property_id=str(property_obj.id), rows=len(rows))
            return []

        avg_occupancy = sum(float(r.occupancy_rate) for r in rows) / len(rows)
        avg_adr = sum(float(r.adr) for r in rows) / len(rows)
        avg_revpar = sum(float(r.revpar) for r in rows) / len(rows)
        total_revenue = sum(float(r.room_revenue) for r in rows)

        # PREDICT: run forecasting engine
        occ_forecast = self.forecasting.generate(property_obj.id, "occupancy", 90)
        rev_forecast = self.forecasting.generate(property_obj.id, "revenue", 90)

        forecast_summary = "Insufficient historical data for statistical forecast."
        if occ_forecast.points:
            next_30 = [p.predicted_value for p in occ_forecast.points[:30]]
            avg_forecast_occ = sum(next_30) / len(next_30)
            forecast_summary = (
                f"30-day average predicted occupancy: {avg_forecast_occ:.1%} "
                f"(model: {occ_forecast.model_name}, WAPE: {occ_forecast.wape or 'n/a'}). "
                f"Forecast horizon: {occ_forecast.horizon_days} days."
            )

        # Build context for LLM
        user_prompt = f"""Property: {property_obj.name} ({property_obj.city}, {property_obj.country})
Hotel type: {property_obj.property_type}, {property_obj.total_rooms} rooms, {property_obj.stars or 'unrated'} stars.
Analysis date: {today}

HISTORICAL PERFORMANCE (last {len(rows)} days):
- Average occupancy: {avg_occupancy:.1%}
- Average ADR: €{avg_adr:.2f}
- Average RevPAR: €{avg_revpar:.2f}
- Total room revenue: €{total_revenue:,.2f}

STATISTICAL FORECAST:
{forecast_summary}

Generate 2–4 specific, evidence-backed commercial recommendations for this property.
Only recommend actions that are directly supported by the data above."""

        # RECOMMEND: call LLM
        try:
            raw = self.llm.complete(SYSTEM_PROMPT, user_prompt, response_schema={})
            parsed = json.loads(raw)
        except Exception as e:
            logger.error("llm_recommendation_failed", error=str(e))
            return []

        recs_data = parsed.get("recommendations", [])
        llm_reasoning = parsed.get("reasoning", "")
        created = []

        for rd in recs_data:
            rec = Recommendation(
                id=uuid.uuid4(),
                property_id=property_obj.id,
                organisation_id=org_id,
                title=rd.get("title", "Untitled")[:255],
                description=rd.get("description", ""),
                category=rd.get("category", "general"),
                suggested_action=rd.get("suggested_action", ""),
                expected_impact_description=rd.get("expected_impact_description"),
                expected_revenue_impact=rd.get("expected_revenue_impact"),
                expected_occupancy_impact=rd.get("expected_occupancy_impact"),
                confidence_score=rd.get("confidence_score"),
                risk_level=rd.get("risk_level", "medium"),
                status=RecommendationStatus.PENDING,
                evidence={"summary": rd.get("evidence_summary", ""), "data_points": len(rows), "forecast_model": occ_forecast.model_name},
                forecast_references=[str(occ_forecast.forecast_date)],
                llm_reasoning=llm_reasoning,
            )
            self.db.add(rec)
            created.append(rec)

        self.db.commit()
        logger.info("recommendations_generated", property_id=str(property_obj.id), count=len(created))
        return created

    def approve(self, rec: Recommendation, user_id: uuid.UUID, approval: RecommendationApproval) -> Recommendation:
        rec.status = approval.status
        rec.approved_by_id = user_id
        rec.approval_notes = approval.notes
        self.db.commit()
        self.db.refresh(rec)
        return rec

    def list_for_property(self, property_id: uuid.UUID, org_id: uuid.UUID) -> list[Recommendation]:
        return (
            self.db.query(Recommendation)
            .filter(Recommendation.property_id == property_id, Recommendation.organisation_id == org_id)
            .order_by(Recommendation.created_at.desc())
            .all()
        )
