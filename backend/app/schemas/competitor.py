from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.core.security import validate_url_safety


class CompetitorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Competitor company name")
    website_url: str = Field(..., min_length=3, max_length=512, description="Competitor website URL")

    @field_validator("website_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        is_safe, sanitized = validate_url_safety(v)
        if not is_safe:
            raise ValueError(f"Unsafe or invalid competitor URL: {sanitized}")
        return sanitized


class CompetitorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    name: str
    website_url: str
    domain: str
    is_active: bool
    created_at: datetime
