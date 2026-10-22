import {
  ResearchProject,
  ProjectCreatePayload,
  ResearchJob,
  ResearchReport,
  ResearchSource
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMsg = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          errorMsg = String(errorData.detail);
        }
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; gemini_configured: boolean; ai_status: string }>(res);
  },

  async getProjects(): Promise<ResearchProject[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return handleResponse<ResearchProject[]>(res);
  },

  async getProject(id: string): Promise<ResearchProject> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse<ResearchProject>(res);
  },

  async createProject(payload: ProjectCreatePayload): Promise<ResearchProject> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ResearchProject>(res);
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete project (${res.status})`);
    }
  },

  async startResearch(projectId: string): Promise<ResearchJob> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/research`, {
      method: 'POST',
    });
    return handleResponse<ResearchJob>(res);
  },

  async getResearchJob(jobId: string): Promise<ResearchJob> {
    const res = await fetch(`${API_BASE}/research/${jobId}`);
    return handleResponse<ResearchJob>(res);
  },

  async getResearchReport(jobId: string): Promise<ResearchReport> {
    const res = await fetch(`${API_BASE}/research/${jobId}/report`);
    return handleResponse<ResearchReport>(res);
  },

  async getResearchSources(jobId: string): Promise<ResearchSource[]> {
    const res = await fetch(`${API_BASE}/research/${jobId}/sources`);
    return handleResponse<ResearchSource[]>(res);
  },

  getMarkdownExportUrl(jobId: string): string {
    return `${API_BASE}/research/${jobId}/export/markdown`;
  },

  async seedDemoProject(): Promise<ResearchProject> {
    const res = await fetch(`${API_BASE}/demo/seed`, {
      method: 'POST',
    });
    return handleResponse<ResearchProject>(res);
  },
};
