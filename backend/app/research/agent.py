import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import validate_url_safety
from app.db.session import SessionLocal
from app.models.project import ResearchProject
from app.models.competitor import Competitor
from app.models.research_job import ResearchJob
from app.models.snapshot import WebPageSnapshot
from app.models.analysis import CompetitorAnalysis
from app.models.source import ResearchSource
from app.models.report import ResearchReport
from app.research.scraper import SafeWebScraper, ScrapedPageData
from app.ai.gemini_client import ai_service
from app.reports.generator import generate_markdown_report

logger = logging.getLogger(__name__)


class ResearchAgentWorkflow:
    def __init__(self, job_id: str):
        self.job_id = job_id
        self.scraper = SafeWebScraper()

    def _append_log(self, job: ResearchJob, step: str, message: str, level: str = "INFO"):
        now_str = datetime.now(timezone.utc).isoformat()
        current_logs = list(job.logs or [])
        current_logs.append({
            "timestamp": now_str,
            "step": step,
            "level": level,
            "message": message
        })
        job.logs = current_logs

    def run_sync(self):
        """Entry point for execution in background thread / task."""
        asyncio.run(self.execute_workflow())

    async def execute_workflow(self):
        db: Session = SessionLocal()
        try:
            job = db.query(ResearchJob).filter(ResearchJob.id == self.job_id).first()
            if not job:
                logger.error(f"Job {self.job_id} not found in database")
                return

            project = db.query(ResearchProject).filter(ResearchProject.id == job.project_id).first()
            if not project:
                job.status = "FAILED"
                job.error_message = "Associated project not found"
                db.commit()
                return

            job.status = "RUNNING"
            job.started_at = datetime.now(timezone.utc)
            job.progress_percent = 5
            job.current_step = "VALIDATING"
            self._append_log(job, "VALIDATING", f"Starting research for {project.company_name} in {project.industry}")
            db.commit()

            competitors = db.query(Competitor).filter(Competitor.project_id == project.id).all()
            if not competitors:
                job.status = "FAILED"
                job.error_message = "No competitors configured for project"
                db.commit()
                return

            # STEP 1: VALIDATE REQUEST & URLS
            self._append_log(job, "VALIDATING", f"Validating URLs for {len(competitors)} competitor(s)...")
            validated_competitors = []
            for comp in competitors:
                is_safe, sanitized = validate_url_safety(comp.website_url)
                if not is_safe:
                    self._append_log(job, "VALIDATING", f"Validation warning for {comp.name}: {sanitized}", level="WARNING")
                validated_competitors.append(comp)

            job.progress_percent = 15
            job.current_step = "DISCOVERY"
            self._append_log(job, "DISCOVERY", "Discovering relevant public pages (Homepage, Pricing, Features, About)...")
            db.commit()

            # STEP 2 & 3: FETCH AND EXTRACT CONTENT FOR EACH COMPETITOR
            scraped_competitors_data: Dict[str, List[ScrapedPageData]] = {}
            total_comps = len(validated_competitors)

            for idx, comp in enumerate(validated_competitors):
                self._append_log(job, "FETCHING", f"Crawling public website for {comp.name} ({comp.website_url})...")
                job.current_step = "FETCHING"
                # Crawl competitor
                pages = await self.scraper.scrape_competitor(comp.website_url, max_pages=settings.MAX_PAGES_PER_COMPETITOR)
                scraped_competitors_data[comp.id] = pages

                # Save snapshots in DB
                for page in pages:
                    snapshot = WebPageSnapshot(
                        job_id=job.id,
                        competitor_id=comp.id,
                        url=page.url,
                        page_type=page.page_type,
                        status_code=page.status_code,
                        title=page.title,
                        meta_description=page.meta_description,
                        headings=page.headings,
                        main_text=page.main_text,
                        content_hash=page.content_hash,
                        char_count=page.char_count,
                        retrieved_at=page.retrieved_at
                    )
                    db.add(snapshot)

                progress_increment = int(30 * ((idx + 1) / total_comps))
                job.progress_percent = 15 + progress_increment
                self._append_log(job, "FETCHING", f"Retrieved {len(pages)} page(s) for {comp.name}")
                db.commit()

            # STEP 4 & 5: SUFFICIENCY CHECK & TARGETED DISCOVERY
            job.current_step = "SUFFICIENCY_CHECK"
            job.progress_percent = 50
            self._append_log(job, "SUFFICIENCY_CHECK", "Evaluating completeness of collected website evidence...")
            db.commit()

            for comp in validated_competitors:
                pages = scraped_competitors_data.get(comp.id, [])
                has_pricing = any(p.page_type == "PRICING" for p in pages)
                has_features = any(p.page_type == "FEATURES" for p in pages)
                if not has_pricing:
                    self._append_log(job, "SUFFICIENCY_CHECK", f"Note: Public pricing page not detected for {comp.name}. Will label as unverified.")
                if not has_features:
                    self._append_log(job, "SUFFICIENCY_CHECK", f"Features derived primarily from homepage & meta headers for {comp.name}.")

            # STEP 6: ANALYZE EACH COMPETITOR INDEPENDENTLY
            job.current_step = "ANALYZING"
            job.progress_percent = 60
            self._append_log(job, "ANALYZING", "Running AI competitor analysis on extracted evidence...")
            db.commit()

            analyzed_schemas = []
            for idx, comp in enumerate(validated_competitors):
                self._append_log(job, "ANALYZING", f"Synthesizing structured intelligence for {comp.name}...")
                raw_pages = [p.to_dict() for p in scraped_competitors_data.get(comp.id, [])]
                
                analysis_schema = await ai_service.analyze_competitor(
                    competitor_name=comp.name,
                    competitor_url=comp.website_url,
                    industry=project.industry,
                    target_market=project.target_market,
                    scraped_pages=raw_pages
                )
                analyzed_schemas.append(analysis_schema)

                # Persist CompetitorAnalysis in DB
                analysis_record = CompetitorAnalysis(
                    job_id=job.id,
                    competitor_id=comp.id,
                    overview=analysis_schema.overview,
                    products_services=analysis_schema.products_services,
                    target_segments=analysis_schema.target_segments,
                    value_proposition=analysis_schema.value_proposition,
                    pricing_model=analysis_schema.pricing_model,
                    pricing_tiers=[t.model_dump() for t in analysis_schema.pricing_tiers],
                    key_features=analysis_schema.key_features,
                    differentiators=analysis_schema.differentiators,
                    strengths=analysis_schema.strengths,
                    weaknesses=analysis_schema.weaknesses,
                    marketing_ctas=analysis_schema.marketing_ctas,
                    opportunities=analysis_schema.differentiation_opportunities,
                    verified_facts=analysis_schema.verified_facts,
                    unverified_items=analysis_schema.unverified_items,
                    evidence_quotes=[q.model_dump() for q in analysis_schema.evidence_quotes],
                    raw_json=analysis_schema.model_dump()
                )
                db.add(analysis_record)

                # Persist ResearchSource citations in DB
                for quote in analysis_schema.evidence_quotes:
                    source_record = ResearchSource(
                        job_id=job.id,
                        competitor_id=comp.id,
                        url=quote.source_url,
                        page_title=f"{comp.name} - Evidence",
                        claim_type=quote.topic.upper(),
                        excerpt=quote.excerpt,
                        fetched_at=datetime.now(timezone.utc)
                    )
                    db.add(source_record)

                progress_increment = int(20 * ((idx + 1) / total_comps))
                job.progress_percent = 60 + progress_increment
                db.commit()

            # STEP 7: COMPARE FINDINGS ACROSS COMPETITORS
            job.current_step = "COMPARING"
            job.progress_percent = 85
            self._append_log(job, "COMPARING", "Generating cross-competitor comparison matrix and positioning radar...")
            db.commit()

            # STEP 8: FINAL REPORT GENERATION WITH CITATIONS & LIMITATIONS
            job.current_step = "REPORTING"
            job.progress_percent = 92
            self._append_log(job, "REPORTING", "Synthesizing executive summary, strategic recommendations, and exportable report...")
            db.commit()

            report_schema = await ai_service.generate_comparison_and_report(
                company_name=project.company_name,
                company_url=project.website_url,
                industry=project.industry,
                target_market=project.target_market,
                analyses=analyzed_schemas
            )

            # Generate markdown version
            project_info = {
                "company_name": project.company_name,
                "website_url": project.website_url,
                "industry": project.industry,
                "target_market": project.target_market
            }
            markdown_content = generate_markdown_report(report_schema, analyzed_schemas, project_info)

            # Persist Report in DB
            report_record = ResearchReport(
                job_id=job.id,
                project_id=project.id,
                title=report_schema.title,
                executive_summary=report_schema.executive_summary,
                methodology=report_schema.methodology,
                comparison_matrix=[row.model_dump() for row in report_schema.comparison_matrix],
                pricing_comparison=report_schema.pricing_comparison,
                positioning_matrix=[pos.model_dump() for pos in report_schema.positioning_matrix],
                market_gaps=report_schema.market_gaps,
                opportunities=report_schema.opportunities,
                risks=report_schema.risks,
                strategic_recommendations=report_schema.strategic_recommendations,
                research_limitations=report_schema.research_limitations,
                raw_markdown=markdown_content
            )
            db.add(report_record)

            # Mark job complete
            job.status = "COMPLETED"
            job.current_step = "COMPLETED"
            job.progress_percent = 100
            job.completed_at = datetime.now(timezone.utc)
            self._append_log(job, "COMPLETED", "Research job completed successfully. Report ready for viewing and export.")
            db.commit()

        except Exception as e:
            logger.exception(f"Fatal error executing research workflow for job {self.job_id}: {e}")
            try:
                job = db.query(ResearchJob).filter(ResearchJob.id == self.job_id).first()
                if job:
                    job.status = "FAILED"
                    job.current_step = "FAILED"
                    job.error_message = f"Workflow failed: {str(e)}"
                    self._append_log(job, "FAILED", f"Error encountered: {str(e)}", level="ERROR")
                    db.commit()
            except Exception as inner_e:
                logger.error(f"Could not record failure status: {inner_e}")
        finally:
            db.close()
