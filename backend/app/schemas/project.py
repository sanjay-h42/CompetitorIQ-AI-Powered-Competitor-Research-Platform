from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.core.security import validate_url_safety
from app.schemas.competitor import CompetitorCreate, CompetitorResponse


class ProjectCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255, description="Your company or product name")
    website_url: str = Field(..., min_length=3, max_length=512, description="Your website URL")
    industry: str = Field(..., min_length=2, max_length=128, description="Primary industry or vertical")
    target_market: str = Field(..., min_length=2, max_length=255, description="Target market, persona, or geography")
    description: Optional[str] = Field(default=None, description="Optional brief description of your offering")
    competitors: List[CompetitorCreate] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="List of 1 to 5 competitor websites to research"
    )

    @field_validator("website_url")
    @classmethod
    def validate_company_url(cls, v: str) -> str:
        is_safe, sanitized = validate_url_safety(v)
        if not is_safe:
            raise ValueError(f"Unsafe or invalid company URL: {sanitized}")
        return sanitized

    @field_validator("competitors")
    @classmethod
    def validate_competitors_count_and_unique(cls, competitors: List[CompetitorCreate]) -> List[CompetitorCreate]:
        if not (1 <= len(competitors) <= 5):
            raise ValueError("You must provide between 1 and 5 competitors.")
        
        seen_urls = set()
        for comp in competitors:
            normalized = comp.website_url.lower().rstrip("/")
            if normalized in seen_urls:
                raise ValueError(f"Duplicate competitor URL specified: {comp.website_url}")
            seen_urls.add(normalized)
        return competitors


class ProjectUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    website_url: Optional[str] = Field(None, min_length=3, max_length=512)
    industry: Optional[str] = Field(None, min_length=2, max_length=128)
    target_market: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_name: str
    website_url: str
    industry: str
    target_market: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    competitors_count: int = 0
    latest_job_status: Optional[str] = None
    latest_job_id: Optional[str] = None


class ProjectDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_name: str
    website_url: str
    industry: str
    target_market: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    competitors: List[CompetitorResponse] = []
    latest_job_id: Optional[str] = None
