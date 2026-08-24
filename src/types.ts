/**
 * KRISHNA LAB SOLUTIONS
 * AI-Powered Security & Weapon Detection System
 * Type Definitions
 */

export interface BoundingBox {
  x: number;      // normalized 0-100% or absolute px
  y: number;      // normalized 0-100% or absolute px
  width: number;  // normalized 0-100% or absolute px
  height: number; // normalized 0-100% or absolute px
}

export interface DetectedObject {
  name: string;             // e.g. "Gun", "Knife", "Handgun", "Rifle", "Machete"
  confidence: number;       // 0 - 1 (e.g. 0.92 = 92%)
  boundingBox: BoundingBox;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: 'firearm' | 'bladed_weapon' | 'blunt_weapon' | 'suspicious';
  details?: string;
}

export interface DetectionResult {
  id: string;
  detected: boolean;
  objects: DetectedObject[];
  camera: string;
  cameraId?: string;
  location: string;
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  frameSnapshot?: string; // base64 or placeholder preview image
  highestConfidence: number;
  highestThreatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';
  status: 'PENDING_REVIEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';
  notes?: string;
  alert?: SecurityAlert;
}

export type CameraType = 'AXIS IP Camera' | 'RTSP Stream' | 'ONVIF Camera' | 'USB Webcam' | 'Demo Simulation';
export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'ERROR';

export interface Camera {
  id: string;
  name: string;
  location: string;
  type: CameraType;
  ipAddress: string;
  port: number;
  username?: string;
  hasPassword?: boolean;
  password?: string;
  streamUrl: string;
  rtspProtocol?: 'TCP' | 'UDP' | 'HTTP';
  status: CameraStatus;
  isAiScanning: boolean;
  fps: number;
  resolution: string;
  modelName: string;
  lastPing?: string;
  thumbnailUrl?: string;
  sampleVideoUrl?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  detectionId: string;
  title: string;
  objectName: string;
  confidence: number;
  cameraName: string;
  cameraId?: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'REVIEWED';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  snapshotUrl?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  actionTaken?: string;
  boundingBox?: BoundingBox;
}

export interface DashboardStats {
  totalCameras: number;
  onlineCameras: number;
  totalScans: number;
  todayDetections: number;
  activeAlerts: number;
  criticalAlerts: number;
  aiMonitoringStatus: 'ACTIVE' | 'PAUSED' | 'IDLE';
  averageConfidence: number;
  systemHealth: number; // 0-100%
  recentAlerts: SecurityAlert[];
  cameraSummaries: {
    id: string;
    name: string;
    location: string;
    status: CameraStatus;
    isScanning: boolean;
    todayDetections: number;
  }[];
  hourlyTrend: { hour: string; scans: number; threats: number }[];
  weaponCategoryBreakdown: { name: string; count: number; percentage: number; color: string }[];
}

export interface SystemSettings {
  confidenceThreshold: number; // 50 to 95, default 75
  alertCooldownSeconds: number; // e.g. 5 seconds to avoid spam
  soundAlertEnabled: boolean;
  autoEmailAlerts: boolean;
  logRetentionDays: number;
  supportedWeaponTypes: string[];
  cameraScanFps: number;
  enableWebcamFallback: boolean;
}

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  role: string;
  badgeNumber: string;
  stationId?: string;
  department?: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface ReportSummary {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  totalDetections: number;
  threatDistribution: { severity: string; count: number }[];
  cameraRankings: { cameraName: string; location: string; detectionCount: number }[];
  weaponTypeCounts: { type: string; count: number }[];
  averageConfidence: number;
  falsePositiveRate: number;
  timelineData: { date: string; detections: number; critical: number; resolved: number }[];
}
