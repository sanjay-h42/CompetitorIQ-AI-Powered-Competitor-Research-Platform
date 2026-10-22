from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    project_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    methodology = Column(Text, nullable=False)
    comparison_matrix = Column(JSON, default=list, nullable=False)
    pricing_comparison = Column(JSON, default=list, nullable=False)
    positioning_matrix = Column(JSON, default=list, nullable=False)
    market_gaps = Column(JSON, default=list, nullable=False)
    opportunities = Column(JSON, default=list, nullable=False)
    risks = Column(JSON, default=list, nullable=False)
    strategic_recommendations = Column(JSON, default=list, nullable=False)
    research_limitations = Column(JSON, default=list, nullable=False)
    raw_markdown = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job = relationship("ResearchJob", back_populates="report")
