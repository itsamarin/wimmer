from fastapi import APIRouter

from wimmer.api.v1.endpoints import auth, forecasts, intelligence, organisations, properties, recommendations

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(organisations.router)
api_router.include_router(properties.router)
api_router.include_router(forecasts.router)
api_router.include_router(recommendations.router)
api_router.include_router(intelligence.router)
