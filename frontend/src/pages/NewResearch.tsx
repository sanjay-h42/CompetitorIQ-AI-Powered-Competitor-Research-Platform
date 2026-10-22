import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  AlertCircle, 
  ShieldAlert,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { ProjectCreatePayload } from '../types';

interface NewResearchProps {
  onBack: () => void;
  onSubmit: (payload: ProjectCreatePayload) => Promise<void>;
  loading: boolean;
}

const COMMON_INDUSTRIES = [
  'Developer Tools & AI Coding',
  'B2B SaaS & Productivity',
  'AI & Machine Learning Platforms',
  'FinTech & Payments',
  'Cybersecurity & Identity',
  'E-Commerce & Retail Tech',
  'HealthTech & Digital Health'
];

export const NewResearch: React.FC<NewResearchProps> = ({ onBack, onSubmit, loading }) => {
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState(COMMON_INDUSTRIES[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [description, setDescription] = useState('');

  // 1 to 5 competitors
  const [competitors, setCompetitors] = useState([
    { name: '', website_url: '' },
    { name: '', website_url: '' },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  const addCompetitorRow = () => {
    if (competitors.length >= 5) {
      setFormError('Maximum 5 competitors allowed per research job.');
      return;
    }
    setCompetitors([...competitors, { name: '', website_url: '' }]);
    setFormError(null);
  };

  const removeCompetitorRow = (index: number) => {
    if (competitors.length <= 1) {
      setFormError('At least 1 competitor is required for competitive intelligence.');
      return;
    }
    const updated = competitors.filter((_, i) => i !== index);
    setCompetitors(updated);
    setFormError(null);
  };

  const updateCompetitor = (index: number, field: 'name' | 'website_url', value: string) => {
    const updated = [...competitors];
    updated[index][field] = value;
    setCompetitors(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate main company
    if (!companyName.trim()) {
      setFormError('Please provide your company or product name.');
      return;
    }
    if (!websiteUrl.trim()) {
      setFormError('Please provide your company website URL.');
      return;
    }
    if (!targetMarket.trim()) {
      setFormError('Please specify your target market or primary customer persona.');
      return;
    }

    const finalIndustry = industry === 'Other' ? customIndustry.trim() : industry;
    if (!finalIndustry) {
      setFormError('Please specify the industry category.');
      return;
    }

    // Validate competitors
    const validCompetitors = competitors.filter(c => c.name.trim() && c.website_url.trim());
    if (validCompetitors.length === 0) {
      setFormError('Please provide at least 1 competitor with both a name and website URL.');
      return;
    }

    // Check for duplicate URLs
    const seenUrls = new Set<string>();
    for (const c of validCompetitors) {
      const norm = c.website_url.trim().toLowerCase().replace(/\/+$/, '');
      if (seenUrls.has(norm)) {
        setFormError(`Duplicate competitor URL detected: ${c.website_url}`);
        return;
      }
      seenUrls.add(norm);
    }

    try {
      await onSubmit({
        company_name: companyName.trim(),
        website_url: websiteUrl.trim(),
        industry: finalIndustry,
        target_market: targetMarket.trim(),
        description: description.trim() || undefined,
        competitors: validCompetitors.map(c => ({
          name: c.name.trim(),
          website_url: c.website_url.trim()
        }))
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to initialize research project.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Configure New Competitive Research
        </h1>
        <p className="text-sm text-slate-400">
          Enter your company profile and up to 5 competitor websites. CompetitorIQ's bounded agents will extract public features, pricing, positioning, and synthesize an evidence-backed intelligence report.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Your Company Details */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Product or Company</h2>
              <p className="text-xs text-slate-400">Baseline context for head-to-head comparison</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Cloud"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Website URL <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. acmecloud.com or https://acmecloud.com"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Industry / Vertical <span className="text-indigo-400">*</span>
              </label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white outline-none transition-colors"
              >
                {COMMON_INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
                <option value="Other">Other (Specify below)</option>
              </select>
              {industry === 'Other' && (
                <input
                  type="text"
                  placeholder="Type industry name..."
                  value={customIndustry}
                  onChange={e => setCustomIndustry(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Market / Ideal Customer Profile <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering leaders, SMB e-commerce founders"
                  value={targetMarket}
                  onChange={e => setTargetMarket(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Brief Offering Overview <span className="text-slate-500 font-normal">(Optional context for the agent)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. We provide serverless database hosting with automatic scaling and instant branch previews."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Step 2: Competitors */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Competitor Websites to Analyze</h2>
                <p className="text-xs text-slate-400">Add between 1 and 5 publicly accessible competitors</p>
              </div>
            </div>

            <button
              type="button"
              onClick={addCompetitorRow}
              disabled={competitors.length >= 5}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Competitor ({competitors.length}/5)</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {competitors.map((comp, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-center gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-mono shrink-0">
                  {idx + 1}
                </div>

                <div className="w-full sm:w-1/3">
                  <input
                    type="text"
                    required
                    placeholder="Competitor Name (e.g. Cursor)"
                    value={comp.name}
                    onChange={e => updateCompetitor(idx, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div className="w-full sm:flex-1 relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="https://competitor.com"
                    value={comp.website_url}
                    onChange={e => updateCompetitor(idx, 'website_url', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeCompetitorRow(idx)}
                  disabled={competitors.length <= 1}
                  title="Remove this competitor"
                  className="self-end sm:self-center p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Security & Validation Notice */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-start space-x-3 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong>Security & Protection Guardrails:</strong> Outbound requests strictly enforce public IP validation (preventing SSRF & DNS rebinding), adhere to robots.txt, and respect server rate limits. Private network destinations or non-standard ports are rejected.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Initializing Research Agent...' : 'Start Autonomous Research'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
