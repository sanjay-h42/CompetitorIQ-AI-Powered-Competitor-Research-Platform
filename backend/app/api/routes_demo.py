from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.research.mock_data import seed_demo_project
from app.schemas.project import ProjectDetailResponse

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/seed", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
def seed_demo(db: Session = Depends(get_db)):
    """
    Populates an end-to-end demo competitive research project (DevPulse AI vs Cursor & GitHub Copilot)
    with complete snapshots, analyses, feature comparison matrix, and executive report.
    """
    project = seed_demo_project(db)
    latest_job = project.research_jobs[0] if project.research_jobs else None
    return ProjectDetailResponse(
        id=project.id,
        company_name=project.company_name,
        website_url=project.website_url,
        industry=project.industry,
        target_market=project.target_market,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        competitors=project.competitors,
        latest_job_id=latest_job.id if latest_job else None
    )
