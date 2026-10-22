import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NewResearch } from './pages/NewResearch';
import { ResearchProgress } from './pages/ResearchProgress';
import { CompetitorAnalysisView } from './pages/CompetitorAnalysisView';
import { ResearchReportView } from './pages/ResearchReportView';
import { ResearchProject, ResearchJob, ProjectCreatePayload } from './types';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new' | 'progress' | 'analysis' | 'report'>('dashboard');
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<ResearchJob | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [healthInfo, setHealthInfo] = useState<{ gemini_configured: boolean; ai_status: string } | undefined>(undefined);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealthInfo(data);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  useEffect(() => {
    loadProjects();
    checkHealth();
  }, []);

  const handleCreateProjectAndStart = async (payload: ProjectCreatePayload) => {
    setIsSubmitting(true);
    try {
      const created = await api.createProject(payload);
      showNotification(`Project '${created.company_name}' initialized.`);

      // Launch research job
      const job = await api.startResearch(created.id);
      setActiveJobId(job.id);
      setActiveJob(job);
      setCurrentView('progress');
      loadProjects();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartResearch = async (projectId: string) => {
    try {
      const job = await api.startResearch(projectId);
      setActiveJobId(job.id);
      setActiveJob(job);
      setCurrentView('progress');
      showNotification('Research job started.');
      loadProjects();
    } catch (err: any) {
      showNotification(err.message || 'Failed to start research job', 'error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this research project and all associated reports?')) {
      return;
    }
    try {
      await api.deleteProject(projectId);
      showNotification('Project deleted.');
      loadProjects();
      if (currentView !== 'dashboard') {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete project', 'error');
    }
  };

  const handleSelectProject = async (projectId: string, targetView: 'analysis' | 'progress' | 'report') => {
    try {
      const project = await api.getProject(projectId);
      if (project.latest_job_id) {
        setActiveJobId(project.latest_job_id);
        const job = await api.getResearchJob(project.latest_job_id);
        setActiveJob(job);
        setCurrentView(targetView);
      } else {
        handleStartResearch(projectId);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to load project details', 'error');
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const project = await api.seedDemoProject();
      showNotification('Demo workspace populated with DevPulse AI vs Cursor & GitHub Copilot.');
      await loadProjects();
      if (project.latest_job_id) {
        setActiveJobId(project.latest_job_id);
        const job = await api.getResearchJob(project.latest_job_id);
        setActiveJob(job);
        setCurrentView('analysis');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to seed demo project', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard') loadProjects();
          setCurrentView(view);
        }}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
        healthInfo={healthInfo}
      />

      {/* Floating Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border transition-all animate-bounce ${
          notification.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-800'
            : 'bg-indigo-950/90 text-indigo-200 border-indigo-800'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            projects={projects}
            loading={loadingProjects}
            onSelectProject={handleSelectProject}
            onStartResearch={handleStartResearch}
            onDeleteProject={handleDeleteProject}
            onNewResearch={() => setCurrentView('new')}
            onSeedDemo={handleSeedDemo}
            isSeeding={isSeeding}
          />
        )}

        {currentView === 'new' && (
          <NewResearch
            onBack={() => {
              loadProjects();
              setCurrentView('dashboard');
            }}
            onSubmit={handleCreateProjectAndStart}
            loading={isSubmitting}
          />
        )}

        {currentView === 'progress' && activeJobId && (
          <ResearchProgress
            jobId={activeJobId}
            onJobComplete={(completedJob) => {
              setActiveJob(completedJob);
              loadProjects();
            }}
            onViewAnalysis={() => setCurrentView('analysis')}
            onViewReport={() => setCurrentView('report')}
            onRetry={() => activeJob?.project_id && handleStartResearch(activeJob.project_id)}
          />
        )}

        {currentView === 'analysis' && activeJob && (
          <CompetitorAnalysisView
            job={activeJob}
            onViewReport={() => setCurrentView('report')}
            onBackToDashboard={() => {
              loadProjects();
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'report' && activeJob && (
          <ResearchReportView
            job={activeJob}
            onBack={() => setCurrentView('analysis')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CompetitorIQ — Enterprise Competitive Intelligence & Bounded Web Research</span>
          <span className="font-mono text-slate-600">v1.0.0 • Strict SSRF Protection • Robots.txt Compliant</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
