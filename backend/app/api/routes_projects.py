import logging
from typing import List
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import ResearchProject
from app.models.competitor import Competitor
from app.models.research_job import ResearchJob
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectDetailResponse, ProjectUpdate
from app.schemas.competitor import CompetitorCreate, CompetitorResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """
    Creates a new research project with 1 to 5 competitors.
    Validates company URL and competitor URLs with SSRF protection.
    """
    project = ResearchProject(
        company_name=payload.company_name.strip(),
        website_url=payload.website_url.strip(),
        industry=payload.industry.strip(),
        target_market=payload.target_market.strip(),
        description=payload.description.strip() if payload.description else None
    )
    db.add(project)
    db.flush()

    for comp in payload.competitors:
        parsed = urlparse(comp.website_url)
        domain = parsed.netloc.lower()
        competitor = Competitor(
            project_id=project.id,
            name=comp.name.strip(),
            website_url=comp.website_url.strip(),
            domain=domain,
            is_active=True
        )
        db.add(competitor)

    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """
    Lists all research projects along with competitor counts and latest job status.
    """
    projects = db.query(ResearchProject).order_by(ResearchProject.created_at.desc()).all()
    results = []
    for p in projects:
        comp_count = len(p.competitors)
        latest_job = p.research_jobs[0] if p.research_jobs else None
        results.append(ProjectResponse(
            id=p.id,
            company_name=p.company_name,
            website_url=p.website_url,
            industry=p.industry,
            target_market=p.target_market,
            description=p.description,
            created_at=p.created_at,
            updated_at=p.updated_at,
            competitors_count=comp_count,
            latest_job_status=latest_job.status if latest_job else None,
            latest_job_id=latest_job.id if latest_job else None
        ))
    return results


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full details of a specific research project, including competitors and latest job.
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

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


@router.put("/{project_id}", response_model=ProjectDetailResponse)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    """
    Updates basic project information.
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if payload.company_name is not None:
        project.company_name = payload.company_name.strip()
    if payload.website_url is not None:
        project.website_url = payload.website_url.strip()
    if payload.industry is not None:
        project.industry = payload.industry.strip()
    if payload.target_market is not None:
        project.target_market = payload.target_market.strip()
    if payload.description is not None:
        project.description = payload.description.strip()

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """
    Deletes a research project and cascades deletion to all associated jobs, analyses, and reports.
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
    return None


@router.post("/{project_id}/competitors", response_model=CompetitorResponse, status_code=status.HTTP_201_CREATED)
def add_competitor(project_id: str, payload: CompetitorCreate, db: Session = Depends(get_db)):
    """
    Adds a competitor to an existing project (enforcing maximum of 5 competitors per project).
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    current_count = db.query(Competitor).filter(Competitor.project_id == project_id).count()
    if current_count >= 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum 5 competitors allowed per project")

    # Check for duplicate URL
    parsed = urlparse(payload.website_url)
    domain = parsed.netloc.lower()

    existing = db.query(Competitor).filter(
        Competitor.project_id == project_id,
        Competitor.website_url == payload.website_url
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This competitor URL is already added to this project")

    competitor = Competitor(
        project_id=project_id,
        name=payload.name.strip(),
        website_url=payload.website_url.strip(),
        domain=domain,
        is_active=True
    )
    db.add(competitor)
    db.commit()
    db.refresh(competitor)
    return competitor


@router.get("/{project_id}/competitors", response_model=List[CompetitorResponse])
def get_project_competitors(project_id: str, db: Session = Depends(get_db)):
    """
    Lists all competitors associated with a project.
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return project.competitors
