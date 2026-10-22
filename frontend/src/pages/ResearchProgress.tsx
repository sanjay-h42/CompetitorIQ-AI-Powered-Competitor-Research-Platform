import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Terminal, 
  FileSearch, 
  Cpu, 
  BarChart3, 
  FileText,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { ResearchJob } from '../types';
import { api } from '../services/api';

interface ResearchProgressProps {
  jobId: string;
  onJobComplete: (job: ResearchJob) => void;
  onViewAnalysis: () => void;
  onViewReport: () => void;
  onRetry: () => void;
}

const WORKFLOW_STEPS = [
  { id: 'VALIDATING', label: 'URL & Security Check', desc: 'SSRF validation & DNS resolution', icon: ShieldCheck },
  { id: 'DISCOVERY', label: 'Page Discovery', desc: 'Inspect robots.txt & discover subpages', icon: Globe },
  { id: 'FETCHING', label: 'Website Crawl & Extraction', desc: 'Extract headings, pricing, & text', icon: FileSearch },
  { id: 'SUFFICIENCY_CHECK', label: 'Evidence Evaluation', desc: 'Assess completeness of facts', icon: Clock },
  { id: 'ANALYZING', label: 'AI Competitor Synthesis', desc: 'Structured analysis & evidence quotes', icon: Cpu },
  { id: 'COMPARING', label: 'Cross-Competitor Matrix', desc: 'Feature comparison & positioning radar', icon: BarChart3 },
  { id: 'REPORTING', label: 'Executive Report Synthesis', desc: 'Markdown synthesis & strategic advice', icon: FileText },
];

export const ResearchProgress: React.FC<ResearchProgressProps> = ({
  jobId,
  onJobComplete,
  onViewAnalysis,
  onViewReport,
  onRetry,
}) => {
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: any;

    const pollJob = async () => {
      try {
        const data = await api.getResearchJob(jobId);
        setJob(data);
        setLoading(false);

        if (data.status === 'COMPLETED') {
          clearInterval(intervalId);
          onJobComplete(data);
        } else if (data.status === 'FAILED') {
          clearInterval(intervalId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to poll job status.');
      }
    };

    pollJob();
    intervalId = setInterval(pollJob, 1800);

    return () => clearInterval(intervalId);
  }, [jobId]);

  if (loading && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Connecting to autonomous research agent...</p>
      </div>
    );
  }

  const currentStep = job?.current_step || 'INITIALIZING';
  const progressPercent = job?.progress_percent || 0;
  const isCompleted = job?.status === 'COMPLETED';
  const isFailed = job?.status === 'FAILED';

  // Determine active step index
  const activeStepIdx = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 font-mono">
                Job ID: {jobId.slice(0, 8)}
              </span>
              <span className="text-slate-600">•</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                isCompleted 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : isFailed 
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse'
              }`}>
                {job?.status || 'RUNNING'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isCompleted ? 'Research Completed Successfully' : isFailed ? 'Research Workflow Encountered an Issue' : 'Executing Autonomous Research Pipeline'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {isCompleted 
                ? 'All competitor web signals, pricing tiers, and positioning data synthesized.' 
                : 'The research agent is crawling public endpoints, evaluating evidence, and generating structured insights.'}
            </p>
          </div>

          {/* Action buttons upon completion or failure */}
          <div className="flex items-center space-x-2 shrink-0">
            {isCompleted && (
              <>
                <button
                  onClick={onViewAnalysis}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center space-x-1.5"
                >
                  <span>Explore Competitor Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onViewReport}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
                >
                  Full Report
                </button>
              </>
            )}

            {isFailed && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Research</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Overall Progress</span>
            <span className="font-mono text-indigo-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : isFailed
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Error banner if failed */}
      {isFailed && job?.error_message && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-200">Execution Error</h4>
            <p className="text-xs text-rose-300 mt-0.5">{job.error_message}</p>
          </div>
        </div>
      )}

      {/* 8-Step Visual Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <span>Workflow Execution Stages</span>
          <span className="text-xs text-slate-400 font-normal">(Bounded, Non-Hallucinating Pipeline)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isPast = isCompleted || (activeStepIdx !== -1 && idx < activeStepIdx);
            const isCurrent = !isCompleted && !isFailed && step.id === currentStep;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : isPast
                    ? 'bg-slate-900/80 border-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    isCurrent ? 'bg-indigo-500/20 text-indigo-400' : isPast ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />}
                    {!isPast && !isCurrent && <Circle className="w-4 h-4 text-slate-700" />}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-white">{idx + 1}. {step.label}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Agent Terminal Logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">Autonomous Agent Execution Logs</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
        </div>

        <div className="p-4 font-mono text-xs space-y-2 max-h-72 overflow-y-auto bg-slate-950/90 text-slate-300">
          {(!job?.logs || job.logs.length === 0) ? (
            <p className="text-slate-600 italic">Waiting for workflow dispatcher...</p>
          ) : (
            job.logs.map((log, index) => {
              const isWarning = log.level === 'WARNING';
              const isError = log.level === 'ERROR';

              return (
                <div key={index} className="flex items-start space-x-2.5 leading-relaxed">
                  <span className="text-slate-600 select-none text-[10px]">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isError
                      ? 'bg-rose-500/20 text-rose-400'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {log.step}
                  </span>
                  <span className={isError ? 'text-rose-300 font-semibold' : isWarning ? 'text-amber-300' : 'text-slate-300'}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
