import logging
import threading
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import ResearchProject
from app.models.research_job import ResearchJob
from app.models.report import ResearchReport
from app.models.source import ResearchSource
from app.models.analysis import CompetitorAnalysis
from app.schemas.research import (
    ResearchJobResponse,
    ResearchJobDetailResponse,
    ResearchReportResponse,
    ResearchSourceResponse,
    CompetitorAnalysisResponse,
)
from app.research.agent import ResearchAgentWorkflow

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Research"])


@router.post("/projects/{project_id}/research", response_model=ResearchJobResponse, status_code=status.HTTP_202_ACCEPTED)
def start_research_job(project_id: str, db: Session = Depends(get_db)):
    """
    Initiates an asynchronous competitor research job for the given project.
    Runs the multi-step bounded agent in a background thread so the HTTP request returns immediately.
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not project.competitors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start research: Project has no competitors configured. Add at least 1 competitor."
        )

    # Create job in PENDING state
    job = ResearchJob(
        project_id=project.id,
        status="PENDING",
        current_step="INITIALIZING",
        progress_percent=0,
        logs=[{
            "timestamp": "now",
            "step": "INITIALIZING",
            "level": "INFO",
            "message": f"Job queued for {project.company_name} with {len(project.competitors)} competitor(s)"
        }]
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch background execution
    agent = ResearchAgentWorkflow(job_id=job.id)
    thread = threading.Thread(target=agent.run_sync, daemon=True)
    thread.start()

    return job


@router.get("/research/{job_id}", response_model=ResearchJobDetailResponse)
def get_research_job(job_id: str, db: Session = Depends(get_db)):
    """
    Returns current status, step progress, execution logs, and completed analyses/report for a job.
    """
    job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research job not found")

    # Map analyses
    analyses_resp: List[CompetitorAnalysisResponse] = []
    for a in job.analyses:
        comp_name = a.competitor.name if a.competitor else "Unknown Competitor"
        comp_url = a.competitor.website_url if a.competitor else ""
        analyses_resp.append(CompetitorAnalysisResponse(
            id=a.id,
            competitor_id=a.competitor_id,
            competitor_name=comp_name,
            competitor_url=comp_url,
            overview=a.overview,
            products_services=a.products_services or [],
            target_segments=a.target_segments or [],
            value_proposition=a.value_proposition,
            pricing_model=a.pricing_model,
            pricing_tiers=a.pricing_tiers or [],
            key_features=a.key_features or [],
            differentiators=a.differentiators or [],
            strengths=a.strengths or [],
            weaknesses=a.weaknesses or [],
            marketing_ctas=a.marketing_ctas or [],
            opportunities=a.opportunities or [],
            verified_facts=a.verified_facts or [],
            unverified_items=a.unverified_items or [],
            evidence_quotes=a.evidence_quotes or []
        ))

    # Map sources
    sources_resp: List[ResearchSourceResponse] = []
    for s in job.sources:
        comp_name = s.competitor.name if s.competitor else None
        sources_resp.append(ResearchSourceResponse(
            id=s.id,
            job_id=s.job_id,
            competitor_id=s.competitor_id,
            competitor_name=comp_name,
            url=s.url,
            page_title=s.page_title,
            claim_type=s.claim_type,
            excerpt=s.excerpt,
            fetched_at=s.fetched_at
        ))

    report_resp = None
    if job.report:
        report_resp = ResearchReportResponse.model_validate(job.report)

    return ResearchJobDetailResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        current_step=job.current_step,
        progress_percent=job.progress_percent,
        error_message=job.error_message,
        logs=job.logs or [],
        started_at=job.started_at,
        completed_at=job.completed_at,
        created_at=job.created_at,
        report=report_resp,
        analyses=analyses_resp,
        sources=sources_resp
    )


@router.get("/research/{job_id}/report", response_model=ResearchReportResponse)
def get_research_report(job_id: str, db: Session = Depends(get_db)):
    """
    Retrieves the generated research report for a completed job.
    """
    report = db.query(ResearchReport).filter(ResearchReport.job_id == job_id).first()
    if not report:
        # Check if job exists
        job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research job not found")
        if job.status == "RUNNING" or job.status == "PENDING":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Research report is still being generated")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found for this job")

    return report


@router.get("/research/{job_id}/sources", response_model=List[ResearchSourceResponse])
def get_research_sources(job_id: str, db: Session = Depends(get_db)):
    """
    Retrieves all evidence sources and citations tied to the research job.
    """
    sources = db.query(ResearchSource).filter(ResearchSource.job_id == job_id).all()
    results = []
    for s in sources:
        comp_name = s.competitor.name if s.competitor else None
        results.append(ResearchSourceResponse(
            id=s.id,
            job_id=s.job_id,
            competitor_id=s.competitor_id,
            competitor_name=comp_name,
            url=s.url,
            page_title=s.page_title,
            claim_type=s.claim_type,
            excerpt=s.excerpt,
            fetched_at=s.fetched_at
        ))
    return results


@router.get("/research/{job_id}/export/markdown")
def export_research_markdown(job_id: str, db: Session = Depends(get_db)):
    """
    Exports the complete research report as a formatted Markdown document.
    """
    report = db.query(ResearchReport).filter(ResearchReport.job_id == job_id).first()
    if not report or not report.raw_markdown:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report markdown not available")

    filename = f"competitor_report_{job_id[:8]}.md"
    return Response(
        content=report.raw_markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
