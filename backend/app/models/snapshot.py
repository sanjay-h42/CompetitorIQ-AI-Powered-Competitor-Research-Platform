from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class WebPageSnapshot(Base):
    __tablename__ = "web_page_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String(36), ForeignKey("competitors.id", ondelete="CASCADE"), nullable=True, index=True)

    url = Column(String(1024), nullable=False)
    page_type = Column(String(32), default="HOMEPAGE", nullable=False)  # HOMEPAGE, ABOUT, PRICING, FEATURES, BLOG, OTHER
    status_code = Column(Integer, nullable=True)
    title = Column(String(512), nullable=True)
    meta_description = Column(Text, nullable=True)
    headings = Column(JSON, default=list, nullable=False)
    main_text = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True)
    char_count = Column(Integer, default=0, nullable=False)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job = relationship("ResearchJob", back_populates="snapshots")
    competitor = relationship("Competitor", back_populates="snapshots")
