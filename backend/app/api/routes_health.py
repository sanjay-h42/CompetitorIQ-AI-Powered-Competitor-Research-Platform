from fastapi import APIRouter
from app.core.config import settings
from app.ai.gemini_client import ai_service

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """
    Returns system status, environment, and AI provider readiness.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "ai_status": "ready" if ai_service.is_available() else "fallback_mode (deterministic)"
    }
