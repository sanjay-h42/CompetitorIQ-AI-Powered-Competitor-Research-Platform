import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import init_db
from app.api.routes_projects import router as projects_router
from app.api.routes_research import router as research_router
from app.api.routes_health import router as health_router
from app.api.routes_demo import router as demo_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("competitoriq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    logger.info("Initializing CompetitorIQ Database Tables...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down CompetitorIQ.")


app = FastAPI(
    title="CompetitorIQ API",
    description="AI-Powered Competitor Research Platform API with bounded research workflows, SSRF protection, and verifiable citations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(research_router, prefix="/api")
app.include_router(demo_router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "CompetitorIQ API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
