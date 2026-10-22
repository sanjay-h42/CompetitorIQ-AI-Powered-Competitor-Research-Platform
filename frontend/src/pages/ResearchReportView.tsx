import React from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Target,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { ResearchJob } from '../types';
import { api } from '../services/api';

interface ResearchReportViewProps {
  job: ResearchJob;
  onBack: () => void;
}

export const ResearchReportView: React.FC<ResearchReportViewProps> = ({ job, onBack }) => {
  const report = job.report;

  if (!report) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-slate-400">Research report is not available for this job.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Back
        </button>
      </div>
    );
  }

  const handleDownloadMarkdown = () => {
    const markdownUrl = api.getMarkdownExportUrl(job.id);
    const link = document.createElement('a');
    link.href = markdownUrl;
    link.setAttribute('download', `CompetitorIQ_Report_${job.id.slice(0, 8)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-24">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print / PDF Export</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Report Document Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-10 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="space-y-4 border-b border-slate-800 pb-8 print:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 print:text-indigo-800 font-mono">
              Empirical Competitive Intelligence Report
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Research Date: {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white print:text-black tracking-tight leading-tight">
            {report.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 print:text-slate-600">
            <span>Prepared by: <strong className="text-slate-200 print:text-black">CompetitorIQ Research Engine</strong></span>
            <span>•</span>
            <span>Competitors Analyzed: <strong className="text-indigo-400 font-bold">{job.analyses.length}</strong></span>
            <span>•</span>
            <span>Compliance Mode: <strong className="text-emerald-400 font-medium">Robots.txt & SSRF Compliant</strong></span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>1. Executive Summary</span>
          </h2>
          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-slate-200 print:bg-slate-100 print:text-slate-900 text-sm leading-relaxed font-normal">
            {report.executive_summary}
          </div>
        </section>

        {/* 2. Methodology & Compliance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>2. Research Methodology & Scope</span>
          </h2>
          <div className="text-xs text-slate-300 print:text-slate-700 leading-relaxed bg-slate-950/60 print:bg-transparent p-4 rounded-xl border border-slate-800 print:border-slate-200">
            {report.methodology}
          </div>
        </section>

        {/* 3. Feature Comparison Table */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <span>3. Competitive Feature Comparison Matrix</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Capability</th>
                  <th className="px-4 py-3 text-indigo-400 font-bold">Your Company</th>
                  {job.analyses.map(a => (
                    <th key={a.competitor_id} className="px-4 py-3 text-white print:text-black">
                      {a.competitor_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-800">
                {report.comparison_matrix.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-semibold text-white print:text-black">{row.feature_name}</td>
                    <td className="px-4 py-3 text-indigo-300 font-medium">{row.user_company_status}</td>
                    {job.analyses.map(a => (
                      <td key={a.competitor_id} className="px-4 py-3">
                        {row.competitor_statuses?.[a.competitor_name] || 'Not publicly verified'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Strategic Recommendations */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>4. Actionable Strategic Recommendations</span>
          </h2>
          <div className="space-y-3">
            {report.strategic_recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-200 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 print:text-slate-900 leading-relaxed font-medium">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Market Opportunities & Gaps */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 bg-slate-950/80 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Differentiation Opportunities</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800">
              {report.opportunities.map((opp, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 bg-slate-950/80 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Competitive Risks to Mitigate</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800">
              {report.risks.map((risk, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">!</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Verifiable Sources & Excerpts */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>5. Verifiable Citations & Source Links</span>
          </h2>
          <div className="space-y-2">
            {job.sources.slice(0, 5).map(src => (
              <div key={src.id} className="p-3.5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 print:text-slate-600">
                  <span className="font-semibold text-slate-200 print:text-black">{src.competitor_name}</span>
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1 font-mono text-[11px]">
                    <span>{src.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-300 print:text-slate-800 italic">
                  "{src.excerpt}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Limitations & Compliance */}
        <section className="p-5 rounded-2xl bg-slate-950 border border-slate-800 print:border-slate-200 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Research Limitations & Disclaimers</span>
          </h3>
          <ul className="space-y-1 text-xs text-slate-400">
            {report.research_limitations.map((lim, i) => (
              <li key={i}>• {lim}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
