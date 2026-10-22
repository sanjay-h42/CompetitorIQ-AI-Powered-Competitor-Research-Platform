from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class CompetitorAnalysis(Base):
    __tablename__ = "competitor_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("research_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String(36), ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)

    overview = Column(Text, nullable=True)
    products_services = Column(JSON, default=list, nullable=False)
    target_segments = Column(JSON, default=list, nullable=False)
    value_proposition = Column(Text, nullable=True)
    pricing_model = Column(String(128), nullable=True)
    pricing_tiers = Column(JSON, default=list, nullable=False)
    key_features = Column(JSON, default=list, nullable=False)
    differentiators = Column(JSON, default=list, nullable=False)
    strengths = Column(JSON, default=list, nullable=False)
    weaknesses = Column(JSON, default=list, nullable=False)
    marketing_ctas = Column(JSON, default=list, nullable=False)
    opportunities = Column(JSON, default=list, nullable=False)
    
    verified_facts = Column(JSON, default=list, nullable=False)
    unverified_items = Column(JSON, default=list, nullable=False)
    evidence_quotes = Column(JSON, default=list, nullable=False)
    raw_json = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job = relationship("ResearchJob", back_populates="analyses")
    competitor = relationship("Competitor", back_populates="analyses")
