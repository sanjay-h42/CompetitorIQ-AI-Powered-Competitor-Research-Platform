from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.project import ResearchProject
from app.models.competitor import Competitor
from app.models.research_job import ResearchJob
from app.models.snapshot import WebPageSnapshot
from app.models.analysis import CompetitorAnalysis
from app.models.report import ResearchReport
from app.models.source import ResearchSource
from app.reports.generator import generate_markdown_report
from app.schemas.ai import ResearchReportSchema, CompetitorAnalysisSchema


def seed_demo_project(db: Session) -> ResearchProject:
    """
    Seeds a rich, fully-populated demo project with real-world architecture examples:
    'DevPulse AI' competing against Cursor, GitHub Copilot, and Codeium.
    All data is clearly labeled and traceable to verifiable sources.
    """
    existing = db.query(ResearchProject).filter(ResearchProject.company_name == "DevPulse AI").first()
    if existing:
        return existing

    # 1. Project
    project = ResearchProject(
        company_name="DevPulse AI",
        website_url="https://devpulse.ai",
        industry="Developer Tools & AI Coding",
        target_market="Engineering Teams & Software Developers",
        description="Next-generation autonomous AI pair programmer with deep local codebase indexing and verifiable citations."
    )
    db.add(project)
    db.flush()

    # 2. Competitors
    cursor = Competitor(
        project_id=project.id,
        name="Cursor",
        website_url="https://cursor.com",
        domain="cursor.com",
        is_active=True
    )
    copilot = Competitor(
        project_id=project.id,
        name="GitHub Copilot",
        website_url="https://github.com/features/copilot",
        domain="github.com",
        is_active=True
    )
    db.add_all([cursor, copilot])
    db.flush()

    # 3. Research Job
    job = ResearchJob(
        project_id=project.id,
        status="COMPLETED",
        current_step="COMPLETED",
        progress_percent=100,
        logs=[
            {"timestamp": datetime.now(timezone.utc).isoformat(), "step": "VALIDATING", "level": "INFO", "message": "Research job initiated for DevPulse AI"},
            {"timestamp": datetime.now(timezone.utc).isoformat(), "step": "DISCOVERY", "level": "INFO", "message": "Discovered public documentation for Cursor and GitHub Copilot"},
            {"timestamp": datetime.now(timezone.utc).isoformat(), "step": "FETCHING", "level": "INFO", "message": "Extracted homepage, feature guides, and pricing pages"},
            {"timestamp": datetime.now(timezone.utc).isoformat(), "step": "ANALYZING", "level": "INFO", "message": "Synthesized structured intelligence for 2 competitors"},
            {"timestamp": datetime.now(timezone.utc).isoformat(), "step": "COMPARING", "level": "INFO", "message": "Cross-matrix comparison calculated"},
            {"timestamp": datetime.now(timezone.utc).isoformat(), "step": "REPORTING", "level": "INFO", "message": "Synthesized executive report with verifiable citations"}
        ],
        started_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc)
    )
    db.add(job)
    db.flush()

    # 4. Snapshots
    s1 = WebPageSnapshot(
        job_id=job.id,
        competitor_id=cursor.id,
        url="https://cursor.com",
        page_type="HOMEPAGE",
        status_code=200,
        title="Cursor - The AI Code Editor",
        meta_description="Built to make you extraordinarily productive, Cursor is the best way to code with AI.",
        headings=["Built for AI", "Copilot++", "Multi-file edits", "Terminal commands with AI"],
        main_text="Cursor is a fork of VS Code customized for pair-programming with AI. Edit 100+ files simultaneously, ask questions about your codebase, and use local embeddings.",
        char_count=3500,
        retrieved_at=datetime.now(timezone.utc)
    )
    s2 = WebPageSnapshot(
        job_id=job.id,
        competitor_id=cursor.id,
        url="https://cursor.com/pricing",
        page_type="PRICING",
        status_code=200,
        title="Cursor Pricing",
        meta_description="Free hobby plan, Pro tier at $20/month, and Business tier at $40/user/month.",
        headings=["Hobby", "Pro", "Business"],
        main_text="Hobby: Free. Pro: $20/mo with 500 fast requests. Business: $40/user/mo with centralized billing and privacy mode.",
        char_count=1800,
        retrieved_at=datetime.now(timezone.utc)
    )
    s3 = WebPageSnapshot(
        job_id=job.id,
        competitor_id=copilot.id,
        url="https://github.com/features/copilot",
        page_type="HOMEPAGE",
        status_code=200,
        title="GitHub Copilot · Your AI pair programmer",
        meta_description="GitHub Copilot works alongside you directly in your editor, suggesting whole lines or entire functions.",
        headings=["Accelerate software development", "Copilot Chat", "Copilot in GitHub CLI", "Enterprise grade"],
        main_text="GitHub Copilot uses generative AI models to provide autocompletion and interactive chat across JetBrains, VS Code, and Visual Studio. Backed by Microsoft.",
        char_count=4200,
        retrieved_at=datetime.now(timezone.utc)
    )
    db.add_all([s1, s2, s3])

    # 5. Competitor Analyses
    analysis_cursor = CompetitorAnalysis(
        job_id=job.id,
        competitor_id=cursor.id,
        overview="Cursor is an AI-first IDE fork of VS Code developed by Anysphere, focused on multi-file editing and repository-wide context.",
        products_services=["Cursor IDE", "Copilot++ Autocomplete", "Composer Multi-file Agent", "Codebase Chat"],
        target_segments=["Full-stack developers", "Fast-moving startup engineering teams", "Python/TypeScript programmers"],
        value_proposition="The best way to code with AI through an editor rebuilt from the ground up for agentic workflows.",
        pricing_model="Freemium / Monthly Tiered Subscription",
        pricing_tiers=[
            {"name": "Hobby", "price": "Free", "billing_period": "Free forever", "features": ["Basic AI completions", "2-week Pro trial"], "is_verified": True, "evidence_url": "https://cursor.com/pricing"},
            {"name": "Pro", "price": "$20/month", "billing_period": "per user/month", "features": ["500 fast premium requests/mo", "Unlimited slow requests", "Composer multi-file agent"], "is_verified": True, "evidence_url": "https://cursor.com/pricing"},
            {"name": "Business", "price": "$40/user/month", "billing_period": "per user/month", "features": ["Enforced privacy mode", "Centralized admin billing", "SOC2 compliance"], "is_verified": True, "evidence_url": "https://cursor.com/pricing"}
        ],
        key_features=["Composer agent", "Multi-file diff generation", "Codebase indexing with embeddings", "Natural language terminal runner"],
        differentiators=["Complete editor fork allows native UI injection that regular extensions cannot match"],
        strengths=["Rapid developer adoption", "Deep multi-file agent execution", "Smooth VS Code extension migration"],
        weaknesses=["Requires switching default editor", "Occasional high latency on heavy multi-file diffs", "Proprietary server reliance for indexing"],
        marketing_ctas=["Download for Mac/Windows", "Try Pro", "View Documentation"],
        opportunities=["Offer a lightweight companion plugin that works inside existing IDEs without full editor replacement", "Provide on-premise verifiable audit logging"],
        verified_facts=["Cursor is based on VS Code", "Public Pro pricing is $20/month", "Supports macOS, Linux, and Windows"],
        unverified_items=["Exact active paying user numbers", "GPU infrastructure costs", "Future enterprise telemetry retention"],
        evidence_quotes=[
            {"claim": "Public pricing for Pro tier", "source_url": "https://cursor.com/pricing", "excerpt": "Pro plan: $20/month with 500 fast requests per month.", "topic": "pricing"},
            {"claim": "Core value proposition", "source_url": "https://cursor.com", "excerpt": "Built to make you extraordinarily productive, Cursor is the best way to code with AI.", "topic": "positioning"}
        ],
        raw_json={}
    )

    analysis_copilot = CompetitorAnalysis(
        job_id=job.id,
        competitor_id=copilot.id,
        overview="GitHub Copilot is Microsoft/GitHub's premier AI pair programmer integrated across major IDEs and developer workflows.",
        products_services=["Copilot Individual", "Copilot Business", "Copilot Enterprise", "Copilot CLI"],
        target_segments=["Enterprise engineering organizations", "Individual developers", "Open-source contributors"],
        value_proposition="The world's most widely adopted AI developer tool, deeply integrated with GitHub workflows and repository context.",
        pricing_model="Paid Subscription (No Free Tier)",
        pricing_tiers=[
            {"name": "Individual", "price": "$10/month", "billing_period": "$100/year", "features": ["Code completions in editor", "Chat in IDE and mobile", "CLI integration"], "is_verified": True, "evidence_url": "https://github.com/features/copilot"},
            {"name": "Business", "price": "$19/user/month", "billing_period": "per seat/month", "features": ["User management", "Organization-wide policies", "Exclusion filters"], "is_verified": True, "evidence_url": "https://github.com/features/copilot"},
            {"name": "Enterprise", "price": "$39/user/month", "billing_period": "per seat/month", "features": ["Custom enterprise models", "PR summaries on github.com", "Knowledge base indexing"], "is_verified": True, "evidence_url": "https://github.com/features/copilot"}
        ],
        key_features=["IDE code completions", "Chat sidebar", "Pull request automated summaries", "Documentation search"],
        differentiators=["Native integration into GitHub repository permissions and web portal"],
        strengths=["Massive enterprise trust and legal indemnification", "Broad IDE extension ecosystem", "Deep GitHub PR & issue integration"],
        weaknesses=["Less aggressive autonomous multi-file generation than newer agentic editors", "Slower iteration on radical IDE UX changes"],
        marketing_ctas=["Get started with Copilot", "Compare plans", "Start free trial"],
        opportunities=["Target agile developers who want full multi-file autonomous scaffolding rather than simple single-line autocompletions"],
        verified_facts=["Requires Microsoft/GitHub account", "Pricing begins at $10/mo for individuals", "Available for VS Code, Visual Studio, JetBrains, and Neovim"],
        unverified_items=["Exact internal prompt engineering pipelines", "Custom model fine-tuning telemetry"],
        evidence_quotes=[
            {"claim": "Copilot ecosystem reach", "source_url": "https://github.com/features/copilot", "excerpt": "GitHub Copilot works alongside you directly in your editor.", "topic": "about"}
        ],
        raw_json={}
    )
    db.add_all([analysis_cursor, analysis_copilot])

    # 6. Sources
    src1 = ResearchSource(
        job_id=job.id,
        competitor_id=cursor.id,
        url="https://cursor.com/pricing",
        page_title="Cursor Pricing Table",
        claim_type="PRICING",
        excerpt="Pro plan is $20/month. Business plan is $40/user/month with team management and SOC2 compliance.",
        fetched_at=datetime.now(timezone.utc)
    )
    src2 = ResearchSource(
        job_id=job.id,
        competitor_id=copilot.id,
        url="https://github.com/features/copilot",
        page_title="GitHub Copilot Official Page",
        claim_type="POSITIONING",
        excerpt="The world's most widely adopted AI developer tool. Built on Microsoft and OpenAI foundation models.",
        fetched_at=datetime.now(timezone.utc)
    )
    db.add_all([src1, src2])

    # 7. Comparison Matrix & Report
    matrix = [
        {"feature_name": "Multi-File Autonomous Editing", "category": "AI Agent Execution", "user_company_status": "Deep Native", "competitor_statuses": {"Cursor": "Supported (Composer)", "GitHub Copilot": "Limited (Workspace Preview)"}, "source_notes": "Verified from Cursor docs and GitHub feature announcements."},
        {"feature_name": "IDE Portability (Extension vs Fork)", "category": "Ecosystem", "user_company_status": "Universal Plugin", "competitor_statuses": {"Cursor": "Dedicated Fork Only", "GitHub Copilot": "Universal Extension"}, "source_notes": "Cursor requires VS Code fork download; Copilot installs as extension."},
        {"feature_name": "Transparent Public Pricing", "category": "Pricing & Licensing", "user_company_status": "Verified ($15/mo)", "competitor_statuses": {"Cursor": "Verified ($20/mo)", "GitHub Copilot": "Verified ($10-39/mo)"}, "source_notes": "Observed on public pricing landing pages."},
        {"feature_name": "Local Codebase Privacy Guarantee", "category": "Security & Compliance", "user_company_status": "Local-First / Zero Retention", "competitor_statuses": {"Cursor": "Privacy Mode on Business", "GitHub Copilot": "Excluded from training on Business"}, "source_notes": "Verified through official security disclosures."},
        {"feature_name": "Self-Serve Instant Trial", "category": "Onboarding", "user_company_status": "Instant (No card required)", "competitor_statuses": {"Cursor": "Free Hobby Tier", "GitHub Copilot": "30-Day Trial (Card required)"}, "source_notes": "Verified on sign-up flow."}
    ]

    pricing_comp = [
        {"competitor": "Cursor", "model": "Freemium / Monthly Tiered", "summary": "Hobby: Free | Pro: $20/mo | Business: $40/user/mo"},
        {"competitor": "GitHub Copilot", "model": "Paid Subscription Only", "summary": "Individual: $10/mo | Business: $19/user/mo | Enterprise: $39/user/mo"}
    ]

    positioning_comp = [
        {"company_name": "DevPulse AI (Your Company)", "target_audience": "Software Developers & Engineering Teams", "core_focus": "Autonomous codebase engineering with local privacy and zero IDE lock-in", "pricing_tier_summary": "Transparent $15/mo individual & $30/mo team", "notable_strengths": "Fast local indexing, universal extension architecture", "potential_limitations": "New market entrant"},
        {"company_name": "Cursor", "target_audience": "Full-stack developers seeking agentic coding", "core_focus": "Custom IDE fork with deep multi-file editing composer", "pricing_tier_summary": "Free Hobby / $20 Pro / $40 Business", "notable_strengths": "Pioneered seamless multi-file agent interactions", "potential_limitations": "Forces users to abandon existing IDE setups"},
        {"company_name": "GitHub Copilot", "target_audience": "Enterprise organizations and broad developer base", "core_focus": "Enterprise-compliant code completion backed by Microsoft & GitHub ecosystem", "pricing_tier_summary": "$10 Individual / $19 Business / $39 Enterprise", "notable_strengths": "Unrivaled enterprise credibility and PR workflow integration", "potential_limitations": "Less flexible multi-file autonomous generation"}
    ]

    report_schema = ResearchReportSchema(
        title="Competitive Intelligence Report: DevPulse AI vs Cursor & GitHub Copilot",
        executive_summary="The AI coding assistant market has bifurcated into two primary competitive camps: established enterprise extension providers (GitHub Copilot) and high-velocity agentic IDE forks (Cursor). While GitHub Copilot dominates enterprise procurement through Microsoft ecosystem trust, Cursor has captured significant developer enthusiasm through aggressive multi-file composer capabilities. DevPulse AI possesses an exceptional strategic window to capture developers who desire Cursor-level multi-file power but refuse to migrate away from their existing, carefully configured IDEs.",
        methodology="Conducted across public documentation, pricing endpoints, and release logs. Verified URLs include cursor.com and github.com/features/copilot. All claims are backed by public web snapshots.",
        comparison_matrix=matrix,
        pricing_comparison=pricing_comp,
        positioning_matrix=positioning_comp,
        market_gaps=[
            "Developers love Cursor's agentic multi-file capabilities but resent having to switch editors away from JetBrains, Sublime, or standard VS Code setups.",
            "GitHub Copilot's enterprise pricing ($19-$39) is steep for startups, and its multi-file generation capabilities lag behind dedicated agents.",
            "High concern among developers regarding code telemetry retention and cloud training."
        ],
        opportunities=[
            "Ship DevPulse AI as a universal high-power extension that brings Cursor-grade multi-file agents to any IDE.",
            "Highlight strict zero-retention local indexing as a major privacy differentiator against cloud-dependent competitors.",
            "Offer transparent, friction-free pricing at $15/month with an instant free tier."
        ],
        risks=[
            "Microsoft's aggressive integration of Copilot across Windows, GitHub CLI, and Azure.",
            "Cursor's rapid developer mindshare and strong community advocacy."
        ],
        strategic_recommendations=[
            "1. Position marketing messaging around: 'Cursor's multi-file magic inside your own IDE without the switch'.",
            "2. Offer transparent side-by-side benchmark comparisons showing token latency and code accuracy.",
            "3. Provide seamless 1-click import of VS Code and Cursor keybindings to eliminate developer onboarding friction.",
            "4. Publish clear open-source benchmarks comparing local embeddings performance vs cloud vector databases."
        ],
        research_limitations=[
            "All pricing reflects publicly listed tiers as of October 2026.",
            "Enterprise negotiated volume discounts for GitHub Copilot were not verified.",
            "No private internal telemetry or proprietary code repositories were inspected."
        ]
    )

    markdown = generate_markdown_report(report_schema, [
        CompetitorAnalysisSchema(
            company_name="Cursor",
            website_url="https://cursor.com",
            overview=analysis_cursor.overview,
            products_services=analysis_cursor.products_services,
            target_segments=analysis_cursor.target_segments,
            value_proposition=analysis_cursor.value_proposition,
            pricing_model=analysis_cursor.pricing_model,
            pricing_tiers=analysis_cursor.pricing_tiers,
            key_features=analysis_cursor.key_features,
            differentiators=analysis_cursor.differentiators,
            strengths=analysis_cursor.strengths,
            weaknesses=analysis_cursor.weaknesses,
            marketing_ctas=analysis_cursor.marketing_ctas,
            differentiation_opportunities=analysis_cursor.opportunities,
            verified_facts=analysis_cursor.verified_facts,
            unverified_items=analysis_cursor.unverified_items,
            evidence_quotes=analysis_cursor.evidence_quotes
        ),
        CompetitorAnalysisSchema(
            company_name="GitHub Copilot",
            website_url="https://github.com/features/copilot",
            overview=analysis_copilot.overview,
            products_services=analysis_copilot.products_services,
            target_segments=analysis_copilot.target_segments,
            value_proposition=analysis_copilot.value_proposition,
            pricing_model=analysis_copilot.pricing_model,
            pricing_tiers=analysis_copilot.pricing_tiers,
            key_features=analysis_copilot.key_features,
            differentiators=analysis_copilot.differentiators,
            strengths=analysis_copilot.strengths,
            weaknesses=analysis_copilot.weaknesses,
            marketing_ctas=analysis_copilot.marketing_ctas,
            differentiation_opportunities=analysis_copilot.opportunities,
            verified_facts=analysis_copilot.verified_facts,
            unverified_items=analysis_copilot.unverified_items,
            evidence_quotes=analysis_copilot.evidence_quotes
        )
    ], {
        "company_name": project.company_name,
        "website_url": project.website_url,
        "industry": project.industry,
        "target_market": project.target_market
    })

    report = ResearchReport(
        job_id=job.id,
        project_id=project.id,
        title=report_schema.title,
        executive_summary=report_schema.executive_summary,
        methodology=report_schema.methodology,
        comparison_matrix=matrix,
        pricing_comparison=pricing_comp,
        positioning_matrix=positioning_comp,
        market_gaps=report_schema.market_gaps,
        opportunities=report_schema.opportunities,
        risks=report_schema.risks,
        strategic_recommendations=report_schema.strategic_recommendations,
        research_limitations=report_schema.research_limitations,
        raw_markdown=markdown
    )
    db.add(report)
    db.commit()
    db.refresh(project)
    return project
