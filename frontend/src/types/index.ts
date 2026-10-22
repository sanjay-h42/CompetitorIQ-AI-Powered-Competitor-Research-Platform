export interface Competitor {
  id: string;
  project_id: string;
  name: string;
  website_url: string;
  domain: string;
  is_active: boolean;
  created_at: string;
}

export interface ResearchProject {
  id: string;
  company_name: string;
  website_url: string;
  industry: string;
  target_market: string;
  description?: string;
  created_at: string;
  updated_at: string;
  competitors_count?: number;
  latest_job_status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | null;
  latest_job_id?: string | null;
  competitors?: Competitor[];
}

export interface ProjectCreatePayload {
  company_name: string;
  website_url: string;
  industry: string;
  target_market: string;
  description?: string;
  competitors: { name: string; website_url: string }[];
}

export interface PricingTier {
  name: string;
  price: string;
  billing_period?: string;
  features: string[];
  is_verified: boolean;
  evidence_url?: string;
}

export interface EvidenceQuote {
  claim: string;
  source_url: string;
  excerpt: string;
  topic: string;
}

export interface CompetitorAnalysis {
  id: string;
  competitor_id: string;
  competitor_name: string;
  competitor_url: string;
  overview?: string;
  products_services: string[];
  target_segments: string[];
  value_proposition?: string;
  pricing_model?: string;
  pricing_tiers: PricingTier[];
  key_features: string[];
  differentiators: string[];
  strengths: string[];
  weaknesses: string[];
  marketing_ctas: string[];
  opportunities: string[];
  verified_facts: string[];
  unverified_items: string[];
  evidence_quotes: EvidenceQuote[];
}

export interface FeatureComparisonRow {
  feature_name: string;
  category: string;
  user_company_status: string;
  competitor_statuses: Record<string, string>;
  source_notes: string;
}

export interface PositioningItem {
  company_name: string;
  target_audience: string;
  core_focus: string;
  pricing_tier_summary: string;
  notable_strengths: string;
  potential_limitations: string;
}

export interface ResearchReport {
  id: string;
  job_id: string;
  project_id: string;
  title: string;
  executive_summary: string;
  methodology: string;
  comparison_matrix: FeatureComparisonRow[];
  pricing_comparison: { competitor: string; model: string; summary: string }[];
  positioning_matrix: PositioningItem[];
  market_gaps: string[];
  opportunities: string[];
  risks: string[];
  strategic_recommendations: string[];
  research_limitations: string[];
  raw_markdown?: string;
  created_at: string;
}

export interface ResearchSource {
  id: string;
  job_id: string;
  competitor_id?: string;
  competitor_name?: string;
  url: string;
  page_title?: string;
  claim_type?: string;
  excerpt: string;
  fetched_at: string;
}

export interface ResearchJobLog {
  timestamp: string;
  step: string;
  level: string;
  message: string;
}

export interface ResearchJob {
  id: string;
  project_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  current_step: string;
  progress_percent: number;
  error_message?: string;
  logs: ResearchJobLog[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
  report?: ResearchReport;
  analyses: CompetitorAnalysis[];
  sources: ResearchSource[];
}
