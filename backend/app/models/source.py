from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String(36), ForeignKey("competitors.id", ondelete="CASCADE"), nullable=True, index=True)

    url = Column(String(1024), nullable=False)
    page_title = Column(String(512), nullable=True)
    claim_type = Column(String(128), nullable=True)  # PRICING, FEATURE, POSITIONING, ABOUT, GENERAL
    excerpt = Column(Text, nullable=False)
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job = relationship("ResearchJob", back_populates="sources")
    competitor = relationship("Competitor", back_populates="sources")
