from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    website_url = Column(String(512), nullable=False)
    domain = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    project = relationship("ResearchProject", back_populates="competitors")
    snapshots = relationship("WebPageSnapshot", back_populates="competitor", cascade="all, delete-orphan")
    analyses = relationship("CompetitorAnalysis", back_populates="competitor", cascade="all, delete-orphan")
    sources = relationship("ResearchSource", back_populates="competitor", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("project_id", "website_url", name="uq_project_competitor_url"),
    )
