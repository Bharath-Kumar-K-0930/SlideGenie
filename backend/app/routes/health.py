from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "active",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
