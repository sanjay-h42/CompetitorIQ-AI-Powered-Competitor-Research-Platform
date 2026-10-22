import React from 'react';
import { 
  Building2, 
  Users, 
  Zap, 
  FileText, 
  Play, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { ResearchProject } from '../types';

interface DashboardProps {
  projects: ResearchProject[];
  loading: boolean;
  onSelectProject: (projectId: string, view: 'analysis' | 'progress' | 'report') => void;
  onStartResearch: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onNewResearch: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  loading,
  onSelectProject,
  onStartResearch,
  onDeleteProject,
  onNewResearch,
  onSeedDemo,
  isSeeding,
}) => {
  // Aggregate metrics
  const totalProjects = projects.length;
  const totalCompetitors = projects.reduce((acc, p) => acc + (p.competitors_count || p.competitors?.length || 0), 0);
  const completedReports = projects.filter(p => p.latest_job_status === 'COMPLETED').length;
  const activeJobs = projects.filter(p => p.latest_job_status === 'RUNNING' || p.latest_job_status === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Loading research repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence & Verifiable Citations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Gain an Unfair Advantage with <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">CompetitorIQ</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Extract public market signals, product features, pricing tiers, and positioning gaps across your competitors with bounded AI research agents and verifiable evidence.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNewResearch}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Launch New Research</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>{isSeeding ? 'Seeding Demo Data...' : 'Explore Demo Intelligence (Cursor vs Copilot)'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{totalProjects}</span>
            <span className="text-xs text-slate-400">workspaces</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Competitors Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{totalCompetitors}</span>
            <span className="text-xs text-slate-400">public domains</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reports Generated</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{completedReports}</span>
            <span className="text-xs text-emerald-400 font-medium">ready to export</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{activeJobs}</span>
            <span className="text-xs text-amber-400 font-medium">running jobs</span>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Research Workspaces & Projects</h2>
            <p className="text-xs text-slate-400">Manage target companies, monitored competitors, and strategic reports.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-white">No research projects yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Create your first project or load the pre-built demo to see CompetitorIQ in action.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={onNewResearch}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create Project
              </button>
              <button
                onClick={onSeedDemo}
                disabled={isSeeding}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Load Demo Project
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {projects.map((project) => {
              const compCount = project.competitors_count || project.competitors?.length || 0;
              const status = project.latest_job_status;

              return (
                <div 
                  key={project.id}
                  className="p-5 sm:p-6 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-bold text-white hover:text-indigo-400 transition-colors">
                        {project.company_name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                        {project.industry}
                      </span>
                      {status === 'COMPLETED' && (
                        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Report Ready</span>
                        </span>
                      )}
                      {status === 'RUNNING' && (
                        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Analyzing...</span>
                        </span>
                      )}
                      {status === 'FAILED' && (
                        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <a 
                        href={project.website_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center space-x-1 text-indigo-400 hover:underline"
                      >
                        <span>{project.website_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-300 font-normal">{project.target_market}</strong></span>
                      <span>•</span>
                      <span>Competitors: <strong className="text-indigo-300">{compCount}</strong></span>
                      <span>•</span>
                      <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 sm:self-center shrink-0">
                    {status === 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => onSelectProject(project.id, 'analysis')}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          View Analysis
                        </button>
                        <button
                          onClick={() => onSelectProject(project.id, 'report')}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
                        >
                          Executive Report
                        </button>
                      </>
                    )}

                    {status === 'RUNNING' && (
                      <button
                        onClick={() => onSelectProject(project.id, 'progress')}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-semibold animate-pulse"
                      >
                        Monitor Job
                      </button>
                    )}

                    {(!status || status === 'FAILED') && (
                      <button
                        onClick={() => onStartResearch(project.id)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Research</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete project"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compliance & Methodology Footer Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex items-start space-x-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-400">
          <h4 className="font-semibold text-slate-200">Ethical & Bounded Web Intelligence</h4>
          <p>
            CompetitorIQ operates strictly on publicly accessible web documents. The engine respects robots.txt directives, observes rate-limits, rejects private internal endpoints (SSRF protection), and clearly tags unverified data without fabricating customer numbers or revenue.
          </p>
        </div>
      </div>
    </div>
  );
};
