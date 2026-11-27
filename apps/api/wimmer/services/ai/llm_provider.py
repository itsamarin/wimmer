"""
LLM provider abstraction.
The LLM interprets validated statistical outputs — it never generates numerical predictions.
"""
from __future__ import annotations

import json
from abc import ABC, abstractmethod

from wimmer.core.config import get_settings
from wimmer.core.logging import get_logger

logger = get_logger("wimmer.ai")


class LLMProvider(ABC):
    @abstractmethod
    def complete(self, system: str, user: str, response_schema: dict | None = None) -> str:
        pass


class MockLLMProvider(LLMProvider):
    """Returns deterministic structured responses for development/testing."""

    def complete(self, system: str, user: str, response_schema: dict | None = None) -> str:
        logger.info("mock_llm_called", user_preview=user[:100])
        return json.dumps({
            "recommendations": [
                {
                    "title": "Adjust pricing for upcoming high-demand period",
                    "description": "Forecast data indicates elevated demand 3–4 weeks ahead. Historical patterns suggest pricing can be optimised.",
                    "category": "revenue",
                    "suggested_action": "Review and adjust room rate strategy for the identified high-demand window. Consider length-of-stay restrictions.",
                    "expected_impact_description": "Potential uplift in RevPAR through improved price positioning during peak demand",
                    "expected_revenue_impact": 4800.00,
                    "expected_occupancy_impact": 0.03,
                    "confidence_score": 0.72,
                    "risk_level": "low",
                    "evidence_summary": "Seasonal naive forecast shows occupancy above 85% for identified period. Historical data confirms similar seasonal pattern.",
                }
            ],
            "reasoning": "Based on validated forecast data showing above-average predicted occupancy, pricing optimisation is recommended. This is a low-risk adjustment given strong historical precedent."
        })


class NebiusLLMProvider(LLMProvider):
    def complete(self, system: str, user: str, response_schema: dict | None = None) -> str:
        from openai import OpenAI
        settings = get_settings()
        client = OpenAI(api_key=settings.NEBIUS_API_KEY, base_url=settings.NEBIUS_BASE_URL)
        messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        kwargs: dict = {"model": settings.NEBIUS_MODEL, "messages": messages, "max_tokens": 2048, "temperature": 0.3}
        if response_schema:
            kwargs["response_format"] = {"type": "json_object"}
        response = client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""


class OpenAILLMProvider(LLMProvider):
    def complete(self, system: str, user: str, response_schema: dict | None = None) -> str:
        from openai import OpenAI
        settings = get_settings()
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        kwargs: dict = {"model": settings.OPENAI_MODEL, "messages": messages, "max_tokens": 2048, "temperature": 0.3}
        if response_schema:
            kwargs["response_format"] = {"type": "json_object"}
        response = client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""


def get_llm_provider() -> LLMProvider:
    settings = get_settings()
    if settings.LLM_PROVIDER == "nebius" and settings.NEBIUS_API_KEY:
        return NebiusLLMProvider()
    if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAILLMProvider()
    return MockLLMProvider()
