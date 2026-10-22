import pytest
from app.schemas.ai import (
    CompetitorAnalysisSchema,
    PricingTierSchema,
    EvidenceQuoteSchema,
    ResearchReportSchema,
    FeatureComparisonRow,
    PositioningItem
)
from app.ai.gemini_client import ai_service
from app.reports.generator import generate_markdown_report


def test_structured_schemas_validation():
    tier = PricingTierSchema(
        name="Pro",
        price="$29/mo",
        billing_period="Monthly",
        features=["Unlimited searches", "API access"],
        is_verified=True,
        evidence_url="https://competitor.com/pricing"
    )
    assert tier.is_verified is True

    quote = EvidenceQuoteSchema(
        claim="Pricing tier",
        source_url="https://competitor.com/pricing",
        excerpt="Pro plan is $29/mo.",
        topic="pricing"
    )
    assert quote.topic == "pricing"

    analysis = CompetitorAnalysisSchema(
        company_name="Acme AI",
        website_url="https://acme.ai",
        overview="Acme AI provides automated CRM workflows.",
        products_services=["Acme CRM"],
        target_segments=["SMBs"],
        value_proposition="Automate your sales pipeline in minutes.",
        pricing_model="Tiered Subscription",
        pricing_tiers=[tier],
        key_features=["Pipeline automation", "Email sync"],
        differentiators=["Zero-code setup"],
        strengths=["Fast onboarding"],
        weaknesses=["Limited enterprise security options"],
        marketing_ctas=["Start Free Trial"],
        differentiation_opportunities=["Offer enterprise compliance"],
        verified_facts=["Public Pro plan is $29/mo"],
        unverified_items=["Active user count"],
        evidence_quotes=[quote]
    )
    assert analysis.company_name == "Acme AI"
    assert len(analysis.verified_facts) == 1
    assert "Active user count" in analysis.unverified_items


def test_fallback_ai_service_generates_valid_schema():
    scraped_pages = [
        {
            "url": "https://rival-tool.com",
            "page_type": "HOMEPAGE",
            "title": "RivalTool - High Performance Analytics",
            "meta_description": "Modern analytics for engineering teams.",
            "headings": ["Core Analytics", "Real-Time Tracking", "API Integration"],
            "main_text": "RivalTool gives engineering teams deep visibility into their cloud deployments."
        },
        {
            "url": "https://rival-tool.com/pricing",
            "page_type": "PRICING",
            "title": "Pricing & Plans",
            "meta_description": "Transparent pricing for teams.",
            "headings": ["Starter Plan", "Pro Plan", "Enterprise"],
            "main_text": "Starter Plan is $19/mo. Pro Plan is $49/mo with full dashboard access."
        }
    ]

    analysis = ai_service._generate_fallback_competitor_analysis(
        competitor_name="RivalTool",
        competitor_url="https://rival-tool.com",
        industry="Cloud Analytics",
        target_market="Engineering Teams",
        scraped_pages=scraped_pages
    )

    assert isinstance(analysis, CompetitorAnalysisSchema)
    assert analysis.company_name == "RivalTool"
    assert len(analysis.key_features) > 0
    assert analysis.pricing_model == "Tiered Subscription"
    assert len(analysis.evidence_quotes) > 0


def test_markdown_report_generation():
    analysis = CompetitorAnalysisSchema(
        company_name="CompetitorX",
        website_url="https://competitorx.com",
        overview="CompetitorX overview text.",
        products_services=["App Suite"],
        target_segments=["Enterprise"],
        value_proposition="Fast enterprise software.",
        pricing_model="Custom Quotation",
        pricing_tiers=[],
        key_features=["Feature A", "Feature B"],
        differentiators=["Custom integrations"],
        strengths=["Enterprise scale"],
        weaknesses=["Opaque pricing"],
        marketing_ctas=["Request a Quote"],
        differentiation_opportunities=["Self-serve pricing"],
        verified_facts=["Active website verified"],
        unverified_items=["Pricing amounts"],
        evidence_quotes=[]
    )

    report_schema = ai_service._generate_fallback_report(
        company_name="MyStartup",
        company_url="https://mystartup.com",
        industry="SaaS",
        target_market="Startups",
        analyses=[analysis]
    )

    project_info = {
        "company_name": "MyStartup",
        "website_url": "https://mystartup.com",
        "industry": "SaaS",
        "target_market": "Startups"
    }

    markdown = generate_markdown_report(report_schema, [analysis], project_info)
    assert "# Competitive Intelligence Report: MyStartup" in markdown
    assert "## 1. Executive Summary" in markdown
    assert "## 3. Competitive Feature Comparison Matrix" in markdown
    assert "CompetitorX" in markdown
    assert "## 9. Limitations & Compliance Statement" in markdown
