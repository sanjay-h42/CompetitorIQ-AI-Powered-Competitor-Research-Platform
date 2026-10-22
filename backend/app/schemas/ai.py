from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class PricingTierSchema(BaseModel):
    name: str = Field(description="Name of the pricing tier (e.g. Free, Starter, Pro, Enterprise)")
    price: str = Field(description="Price amount or 'Contact Sales' or 'Not publicly listed'")
    billing_period: Optional[str] = Field(default=None, description="e.g. per user / month, annually, one-time")
    features: List[str] = Field(default_factory=list, description="Key features included in this tier")
    is_verified: bool = Field(default=False, description="True if explicitly found on public pricing page")
    evidence_url: Optional[str] = Field(default=None, description="Source URL where this was observed")


class EvidenceQuoteSchema(BaseModel):
    claim: str = Field(description="The specific fact or claim made about the competitor")
    source_url: str = Field(description="The exact page URL where the excerpt was retrieved")
    excerpt: str = Field(description="Direct verbatim snippet from the website supporting the claim")
    topic: str = Field(default="general", description="Category: pricing, feature, value_prop, about")


class CompetitorAnalysisSchema(BaseModel):
    company_name: str = Field(description="Name of the competitor")
    website_url: str = Field(description="Primary website URL")
    overview: str = Field(description="Objective overview of what the company does")
    products_services: List[str] = Field(default_factory=list, description="Publicly listed products or services")
    target_segments: List[str] = Field(default_factory=list, description="Target customer segments or ideal customer profile")
    value_proposition: str = Field(description="Primary value proposition and market positioning")
    pricing_model: str = Field(description="Pricing model, e.g., 'Subscription tiered', 'Usage-based', or 'Not publicly listed'")
    pricing_tiers: List[PricingTierSchema] = Field(default_factory=list, description="Extracted pricing tiers")
    key_features: List[str] = Field(default_factory=list, description="Documented product features and capabilities")
    differentiators: List[str] = Field(default_factory=list, description="Publicly stated differentiators")
    strengths: List[str] = Field(default_factory=list, description="Observable strengths supported by evidence")
    weaknesses: List[str] = Field(default_factory=list, description="Potential limitations or gaps inferred from public disclosures")
    marketing_ctas: List[str] = Field(default_factory=list, description="Prominent calls-to-action on the site")
    differentiation_opportunities: List[str] = Field(default_factory=list, description="Areas where the user can differentiate")
    verified_facts: List[str] = Field(default_factory=list, description="Directly observed facts backed by public page text")
    unverified_items: List[str] = Field(default_factory=list, description="Information not publicly verified or missing")
    evidence_quotes: List[EvidenceQuoteSchema] = Field(default_factory=list, description="Verifiable citations with excerpts")


class FeatureComparisonRow(BaseModel):
    feature_name: str = Field(description="Name of the feature or capability")
    category: str = Field(description="Category (e.g. Core, AI, Integrations, Analytics, Enterprise)")
    user_company_status: str = Field(description="Status/offering for user company")
    competitor_statuses: Dict[str, str] = Field(description="Dict of competitor_name -> 'Supported', 'Limited', 'Not publicly verified', etc.")
    source_notes: str = Field(default="", description="Citation reference or evidence note")


class PositioningItem(BaseModel):
    company_name: str
    target_audience: str
    core_focus: str
    pricing_tier_summary: str
    notable_strengths: str
    potential_limitations: str


class ResearchReportSchema(BaseModel):
    title: str = Field(description="Title of the research report")
    executive_summary: str = Field(description="Comprehensive executive summary of the competitive landscape")
    methodology: str = Field(description="Description of the empirical research methodology and bounds")
    comparison_matrix: List[FeatureComparisonRow] = Field(default_factory=list, description="Feature comparison matrix")
    pricing_comparison: List[Dict[str, str]] = Field(default_factory=list, description="Comparison of pricing across competitors")
    positioning_matrix: List[PositioningItem] = Field(default_factory=list, description="Positioning breakdown")
    market_gaps: List[str] = Field(default_factory=list, description="Identified unmet market needs or gaps")
    opportunities: List[str] = Field(default_factory=list, description="Strategic opportunities for the user's business")
    risks: List[str] = Field(default_factory=list, description="Competitive risks and challenges")
    strategic_recommendations: List[str] = Field(default_factory=list, description="Actionable, prioritized recommendations")
    research_limitations: List[str] = Field(default_factory=list, description="Clear statement of limitations and unverified items")
