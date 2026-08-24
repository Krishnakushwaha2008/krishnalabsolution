/**
 * KRISHNA LAB SOLUTIONS
 * API Client Services
 */

import {
  Camera,
  DashboardStats,
  DetectionResult,
  ReportSummary,
  SecurityAlert,
  SystemSettings,
  UserProfile,
} from '../types';

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    return res.json();
  },

  // Cameras
  async getCameras(): Promise<Camera[]> {
    const res = await fetch('/api/cameras');
    if (!res.ok) throw new Error('Failed to load cameras');
    return res.json();
  },

  async addCamera(cameraData: Partial<Camera> & { password?: string }): Promise<Camera> {
    const res = await fetch('/api/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cameraData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add camera');
    }
    return res.json();
  },

  async updateCamera(id: string, cameraData: Partial<Camera> & { password?: string }): Promise<Camera> {
    const res = await fetch(`/api/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cameraData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update camera');
    }
    return res.json();
  },

  async deleteCamera(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/cameras/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete camera');
    return res.json();
  },

  async testCameraConnection(id: string): Promise<{
    success: boolean;
    status: string;
    latencyMs: number;
    protocol: string;
    resolution: string;
    rtspHandshake: string;
    codec: string;
    message: string;
  }> {
    const res = await fetch(`/api/cameras/${id}/test`, {
      method: 'POST',
    });
    return res.json();
  },

  async startCameraScan(id: string): Promise<{ success: boolean; camera: Camera }> {
    const res = await fetch(`/api/cameras/${id}/start`, { method: 'POST' });
    return res.json();
  },

  async stopCameraScan(id: string): Promise<{ success: boolean; camera: Camera }> {
    const res = await fetch(`/api/cameras/${id}/stop`, { method: 'POST' });
    return res.json();
  },

  // Detection & AI Inference
  async runDetection(params: {
    imageBase64?: string;
    cameraName?: string;
    cameraId?: string;
    forceScenario?: 'KNIFE_DETECTED' | 'GUN_DETECTED' | 'RIFLE_DETECTED' | 'AREA_CLEAR';
    confidenceThresholdOverride?: number;
  }): Promise<{
    detected: boolean;
    objects: any[];
    camera: string;
    detectionId: string;
    alert?: SecurityAlert;
    confidenceThreshold: number;
    highestConfidence: number;
    status: 'WEAPON_DETECTED' | 'AREA_CLEAR';
  }> {
    const res = await fetch('/api/detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error('AI Detection request failed');
    }
    return res.json();
  },

  async getDetectionHistory(params?: {
    object?: string;
    camera?: string;
    minConfidence?: number;
    status?: string;
    search?: string;
  }): Promise<{ total: number; detections: DetectionResult[] }> {
    const query = new URLSearchParams();
    if (params?.object) query.append('object', params.object);
    if (params?.camera) query.append('camera', params.camera);
    if (params?.minConfidence) query.append('minConfidence', String(params.minConfidence));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/detection/history?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load detection history');
    return res.json();
  },

  async getDetectionById(id: string): Promise<DetectionResult> {
    const res = await fetch(`/api/detection/${id}`);
    if (!res.ok) throw new Error('Failed to load detection details');
    return res.json();
  },

  async deleteDetection(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/detection/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async clearDetectionHistory(): Promise<{ success: boolean }> {
    const res = await fetch('/api/detection/clear-history', { method: 'POST' });
    return res.json();
  },

  // Alert Center
  async getAlerts(params?: { severity?: string; status?: string }): Promise<SecurityAlert[]> {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`/api/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string, officerName?: string): Promise<SecurityAlert> {
    const res = await fetch(`/api/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerName }),
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async reviewAlert(
    id: string,
    params: { officerName?: string; resolutionNotes?: string; isFalsePositive?: boolean }
  ): Promise<SecurityAlert> {
    const res = await fetch(`/api/alerts/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to review alert');
    return res.json();
  },

  async deleteAlert(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Reports
  async getReports(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'): Promise<ReportSummary> {
    const res = await fetch(`/api/reports?period=${period}`);
    if (!res.ok) throw new Error('Failed to load security reports');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load system settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update system settings');
    return res.json();
  },

  // Demo Samples
  async getDemoSamples(): Promise<any[]> {
    const res = await fetch('/api/demo/samples');
    return res.json();
  },
};
