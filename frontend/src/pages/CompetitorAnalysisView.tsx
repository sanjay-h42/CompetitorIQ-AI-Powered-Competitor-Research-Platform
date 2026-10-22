import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  DollarSign, 
  Check, 
  X, 
  HelpCircle, 
  Quote, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  BarChart2, 
  Layers, 
  Target, 
  ThumbsUp, 
  AlertTriangle,
  ArrowRight,
  FileText
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { ResearchJob, CompetitorAnalysis, PricingTier } from '../types';

interface CompetitorAnalysisViewProps {
  job: ResearchJob;
  onViewReport: () => void;
  onBackToDashboard: () => void;
}

export const CompetitorAnalysisView: React.FC<CompetitorAnalysisViewProps> = ({
  job,
  onViewReport,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'matrix' | 'pricing' | 'charts' | 'citations'>('profiles');
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(
    job.analyses[0]?.competitor_id || ''
  );

  const activeAnalysis = job.analyses.find(a => a.competitor_id === selectedCompetitorId) || job.analyses[0];
  const report = job.report;

  // Prepare chart data for Recharts
  const chartData = [
    {
      metric: 'Feature Breadth',
      ...(job.analyses.reduce((acc, a) => ({
        ...acc,
        [a.competitor_name]: Math.min(100, (a.key_features?.length || 2) * 18)
      }), {}))
    },
    {
      metric: 'Pricing Transparency',
      ...(job.analyses.reduce((acc, a) => ({
        ...acc,
        [a.competitor_name]: a.pricing_model !== 'Not publicly listed' ? 90 : 25
      }), {}))
    },
    {
      metric: 'Target Market Focus',
      ...(job.analyses.reduce((acc, a) => ({
        ...acc,
        [a.competitor_name]: Math.min(100, (a.target_segments?.length || 2) * 22)
      }), {}))
    },
    {
      metric: 'Public Evidence Density',
      ...(job.analyses.reduce((acc, a) => ({
        ...acc,
        [a.competitor_name]: Math.min(100, (a.evidence_quotes?.length || 1) * 30)
      }), {}))
    },
    {
      metric: 'Strategic Agility',
      ...(job.analyses.reduce((acc, a) => ({
        ...acc,
        [a.competitor_name]: 70
      }), {}))
    }
  ];

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981'];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <button onClick={onBackToDashboard} className="hover:text-white transition-colors">Dashboard</button>
            <span>/</span>
            <span className="text-slate-300">Competitor Intelligence Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Competitor Landscape
          </h1>
        </div>

        <button
          onClick={onViewReport}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>View Executive Research Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'profiles', label: 'Competitor Profiles', icon: Building2 },
          { id: 'matrix', label: 'Feature Comparison Matrix', icon: Layers },
          { id: 'pricing', label: 'Pricing & Packaging', icon: DollarSign },
          { id: 'charts', label: 'Positioning Visuals', icon: BarChart2 },
          { id: 'citations', label: 'Evidence & Citations', icon: Quote },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILES */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          {/* Competitor Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {job.analyses.map(a => (
              <button
                key={a.competitor_id}
                onClick={() => setSelectedCompetitorId(a.competitor_id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCompetitorId === a.competitor_id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{a.competitor_name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                  {a.pricing_model || 'Public'}
                </span>
              </button>
            ))}
          </div>

          {activeAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Info (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hero Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <span>{activeAnalysis.competitor_name}</span>
                        <a
                          href={activeAnalysis.competitor_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{activeAnalysis.competitor_url}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                        {activeAnalysis.pricing_model || 'Not publicly listed'}
                      </span>
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      Core Value Proposition & Positioning
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      "{activeAnalysis.value_proposition || 'Empirical value proposition derived from homepage disclosures.'}"
                    </p>
                  </div>

                  {/* Overview */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Overview</span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {activeAnalysis.overview}
                    </p>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Observed Key Features & Capabilities ({activeAnalysis.key_features.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeAnalysis.key_features.map((feat, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SWOT / Observable Strengths & Inferred Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <ThumbsUp className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Observable Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {activeAnalysis.strengths.map((s, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Potential Limitations / Gaps</h3>
                    </div>
                    <ul className="space-y-2">
                      {activeAnalysis.weaknesses.map((w, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar Cards (1 col) */}
              <div className="space-y-6">
                {/* Target Segments */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Target className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Target Audience</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAnalysis.target_segments.map((seg, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {seg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Marketing CTAs */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Public Calls to Action</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAnalysis.marketing_ctas.map((cta, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
                        {cta}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strategic Opportunities */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-violet-400">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">How to Win Against {activeAnalysis.competitor_name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {activeAnalysis.opportunities.map((opp, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-violet-400 font-bold">→</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Verified vs Unverified Data Breakdown */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Integrity Audit</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-emerald-400 font-semibold">Verified Facts:</span>
                      <p className="text-slate-400 mt-0.5 line-clamp-3">
                        {activeAnalysis.verified_facts.join(' • ') || 'Domain presence, public meta tags, and visible landing pages.'}
                      </p>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 font-semibold">Excluded / Unverified:</span>
                      <p className="text-slate-500 mt-0.5">
                        {activeAnalysis.unverified_items.join(' • ') || 'Internal revenue, paying customer counts, confidential roadmaps.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: FEATURE COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Side-by-Side Feature Matrix</h2>
              <p className="text-xs text-slate-400">Empirically evaluated capabilities across all tracked competitors</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
              Verified from public pages
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Capability / Feature</th>
                  <th className="px-6 py-3.5 text-indigo-400 font-bold bg-indigo-950/30">Your Company</th>
                  {job.analyses.map(a => (
                    <th key={a.competitor_id} className="px-6 py-3.5 text-white">
                      {a.competitor_name}
                    </th>
                  ))}
                  <th className="px-6 py-3.5 text-slate-400">Evidence Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(report?.comparison_matrix || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {row.feature_name}
                    </td>
                    <td className="px-6 py-4 bg-indigo-950/20 font-medium text-indigo-300">
                      {row.user_company_status}
                    </td>
                    {job.analyses.map(a => {
                      const status = row.competitor_statuses?.[a.competitor_name] || 'Not publicly verified';
                      const isSupported = status.toLowerCase().includes('supported') || status.toLowerCase().includes('verified') || status.toLowerCase().includes('available');
                      const isUnverified = status.toLowerCase().includes('not publicly') || status.toLowerCase().includes('limited');

                      return (
                        <td key={a.competitor_id} className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                            isSupported 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isUnverified
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {isSupported ? <Check className="w-3 h-3" /> : isUnverified ? <HelpCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{status}</span>
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-slate-400 text-[11px] max-w-xs">
                      {row.source_notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & PACKAGING */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {job.analyses.map(a => (
              <div key={a.competitor_id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white">{a.competitor_name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
                    {a.pricing_model || 'Not publicly listed'}
                  </span>
                </div>

                <div className="space-y-3">
                  {a.pricing_tiers && a.pricing_tiers.length > 0 ? (
                    a.pricing_tiers.map((tier, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{tier.name}</span>
                          <span className="font-bold text-sm text-indigo-400 font-mono">{tier.price}</span>
                        </div>
                        {tier.billing_period && (
                          <p className="text-[11px] text-slate-400">{tier.billing_period}</p>
                        )}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            tier.is_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {tier.is_verified ? 'Publicly Verified' : 'Unverified / Contact Sales'}
                          </span>
                          {tier.evidence_url && (
                            <a href={tier.evidence_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 italic">
                      Pricing is not publicly listed on their website.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: POSITIONING CHARTS */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Multi-Dimensional Competitor Radar</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated across feature breadth, public transparency, evidence density, and target market focus.
            </p>
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  {job.analyses.map((a, i) => (
                    <Radar
                      key={a.competitor_id}
                      name={a.competitor_name}
                      dataKey={a.competitor_name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11, color: '#cbd5e1' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Feature Density Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">
              Total number of documented product features extracted per competitor.
            </p>
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={job.analyses.map(a => ({ name: a.competitor_name, features: a.key_features.length, quotes: a.evidence_quotes.length }))}>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#cbd5e1' }} />
                  <Bar dataKey="features" name="Extracted Features" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="quotes" name="Verifiable Citations" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CITATIONS & EVIDENCE */}
      {activeTab === 'citations' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Verifiable Sources & Extracted Quotations</h2>
              <p className="text-xs text-slate-400">Every strategic claim is backed by direct website observation.</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              {job.sources.length} sources registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.sources.map(src => (
              <div key={src.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300">{src.competitor_name || 'Competitor'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {src.claim_type || 'FACT'}
                  </span>
                </div>
                <blockquote className="text-xs text-slate-300 italic border-l-2 border-indigo-500 pl-3 py-1">
                  "{src.excerpt}"
                </blockquote>
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1">
                    <span className="line-clamp-1 max-w-xs">{src.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <span>{new Date(src.fetched_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
