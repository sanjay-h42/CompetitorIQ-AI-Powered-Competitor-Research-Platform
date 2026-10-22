import React from 'react';
import { ShieldCheck, Sparkles, PlusCircle, LayoutDashboard, Database, Activity } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'new' | 'progress' | 'analysis' | 'report';
  onNavigate: (view: 'dashboard' | 'new') => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
  healthInfo?: { gemini_configured: boolean; ai_status: string };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onSeedDemo,
  isSeeding,
  healthInfo,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                CompetitorIQ
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Competitive Intelligence</p>
          </div>
        </div>

        {/* Engine Status & Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Health / AI Indicator */}
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">
              {healthInfo?.gemini_configured ? 'Gemini 2.5 Active' : 'Heuristic Engine Ready'}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>

          {/* Quick Demo Seed */}
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            title="Populate complete demo dataset with real competitors (DevPulse AI vs Cursor & Copilot)"
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500/50 transition-all duration-200 disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSeeding ? 'Seeding...' : 'Load Demo Project'}</span>
          </button>

          {/* Navigation Links */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center space-x-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('new')}
            className={`flex items-center space-x-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Research</span>
          </button>
        </div>
      </div>
    </header>
  );
};
