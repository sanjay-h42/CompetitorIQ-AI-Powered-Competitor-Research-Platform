from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class ResearchJobCreate(BaseModel):
    project_id: str


class WebPageSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    competitor_id: Optional[str]
    url: str
    page_type: str
    status_code: Optional[int]
    title: Optional[str]
    meta_description: Optional[str]
    headings: List[str] = []
    char_count: int = 0
    retrieved_at: datetime


class ResearchSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    competitor_id: Optional[str]
    competitor_name: Optional[str] = None
    url: str
    page_title: Optional[str]
    claim_type: Optional[str]
    excerpt: str
    fetched_at: datetime


class CompetitorAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    competitor_id: str
    competitor_name: str
    competitor_url: str
    overview: Optional[str]
    products_services: List[str] = []
    target_segments: List[str] = []
    value_proposition: Optional[str]
    pricing_model: Optional[str]
    pricing_tiers: List[Dict[str, Any]] = []
    key_features: List[str] = []
    differentiators: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    marketing_ctas: List[str] = []
    opportunities: List[str] = []
    verified_facts: List[str] = []
    unverified_items: List[str] = []
    evidence_quotes: List[Dict[str, Any]] = []


class ResearchReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    project_id: str
    title: str
    executive_summary: str
    methodology: str
    comparison_matrix: List[Dict[str, Any]] = []
    pricing_comparison: List[Dict[str, Any]] = []
    positioning_matrix: List[Dict[str, Any]] = []
    market_gaps: List[str] = []
    opportunities: List[str] = []
    risks: List[str] = []
    strategic_recommendations: List[str] = []
    research_limitations: List[str] = []
    raw_markdown: Optional[str] = None
    created_at: datetime


class ResearchJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    status: str  # PENDING, RUNNING, COMPLETED, FAILED
    current_step: str
    progress_percent: int
    error_message: Optional[str] = None
    logs: List[Dict[str, Any]] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class ResearchJobDetailResponse(ResearchJobResponse):
    report: Optional[ResearchReportResponse] = None
    analyses: List[CompetitorAnalysisResponse] = []
    sources: List[ResearchSourceResponse] = []
