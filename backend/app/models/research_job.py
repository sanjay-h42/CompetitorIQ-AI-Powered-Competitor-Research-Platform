from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class ResearchJob(Base):
    __tablename__ = "research_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)

    status = Column(String(32), default="PENDING", nullable=False, index=True)  # PENDING, RUNNING, COMPLETED, FAILED
    current_step = Column(String(64), default="VALIDATING", nullable=False)
    progress_percent = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    logs = Column(JSON, default=list, nullable=False)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    project = relationship("ResearchProject", back_populates="research_jobs")
    snapshots = relationship("WebPageSnapshot", back_populates="job", cascade="all, delete-orphan")
    analyses = relationship("CompetitorAnalysis", back_populates="job", cascade="all, delete-orphan")
    report = relationship("ResearchReport", back_populates="job", uselist=False, cascade="all, delete-orphan")
    sources = relationship("ResearchSource", back_populates="job", cascade="all, delete-orphan")
