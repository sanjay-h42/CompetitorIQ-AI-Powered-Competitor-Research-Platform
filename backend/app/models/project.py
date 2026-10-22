from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String(255), nullable=False)
    website_url = Column(String(512), nullable=False)
    industry = Column(String(128), nullable=False)
    target_market = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    competitors = relationship("Competitor", back_populates="project", cascade="all, delete-orphan", order_by="Competitor.created_at")
    research_jobs = relationship("ResearchJob", back_populates="project", cascade="all, delete-orphan", order_by="desc(ResearchJob.created_at)")
