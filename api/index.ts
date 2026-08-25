import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google Gemini SDK lazily / with fallback
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// IN-MEMORY DATABASE / STATE STORE
// ==========================================

let systemSettings = {
  aiEnabled: true,
  confidenceThreshold: 75,
  supportedWeaponClasses: ['Gun', 'Handgun', 'Rifle', 'Knife', 'Machete', 'Dagger', 'Firearm'],
  alertSoundEnabled: true,
  alertSoundVolume: 80,
  notificationsEnabled: true,
  alertCooldownSeconds: 5,
  autoAcknowledgeLowConfidence: false,
  maxStoredDetections: 500,
  axisRtspPort: 554,
  axisTimeoutMs: 5000,
  privacyComplianceNoticeAccepted: true,
  darkMode: true,
};

let cameras = [
  {
    id: 'cam-axis-01',
    name: 'Main Gate AXIS P1455-LE',
    location: 'Main Entrance & Perimeter',
    type: 'AXIS IP Camera',
    ipAddress: '192.168.1.101',
    port: 554,
    username: 'axis_sec_admin',
    hasPassword: true,
    streamUrl: 'rtsp://192.168.1.101/axis-media/media.amp?videocodec=h264',
    rtspProtocol: 'TCP',
    status: 'ONLINE',
    isAiScanning: true,
    fps: 30,
    resolution: '1080p (1920x1080)',
    modelName: 'AXIS P1455-LE Network Camera',
    lastPing: new Date().toISOString(),
    isDemo: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    id: 'cam-axis-02',
    name: 'North Parking Lot AXIS Q3538-LVE',
    location: 'North Vehicle Parking',
    type: 'AXIS IP Camera',
    ipAddress: '192.168.1.102',
    port: 554,
    username: 'axis_sec_admin',
    hasPassword: true,
    streamUrl: 'rtsp://192.168.1.102/axis-media/media.amp?videocodec=h264',
    rtspProtocol: 'TCP',
    status: 'ONLINE',
    isAiScanning: true,
    fps: 30,
    resolution: '4K Ultra HD',
    modelName: 'AXIS Q3538-LVE Dome Camera',
    lastPing: new Date().toISOString(),
    isDemo: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
  },
  {
    id: 'cam-axis-03',
    name: 'Visitor Reception AXIS M3077-PLVE',
    location: 'Corporate Reception Lobby',
    type: 'AXIS IP Camera',
    ipAddress: '192.168.1.103',
    port: 554,
    username: 'axis_sec_admin',
    hasPassword: true,
    streamUrl: 'rtsp://192.168.1.103/axis-media/media.amp',
    rtspProtocol: 'TCP',
    status: 'ONLINE',
    isAiScanning: true,
    fps: 25,
    resolution: '1080p (1920x1080)',
    modelName: 'AXIS M3077 Panoramic Camera',
    lastPing: new Date().toISOString(),
    isDemo: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'cam-axis-04',
    name: 'Loading Dock AXIS M1137-E',
    location: 'Warehouse Loading Bay B',
    type: 'AXIS IP Camera',
    ipAddress: '192.168.1.104',
    port: 554,
    username: 'axis_sec_admin',
    hasPassword: true,
    streamUrl: 'rtsp://192.168.1.104/axis-media/media.amp',
    rtspProtocol: 'TCP',
    status: 'ONLINE',
    isAiScanning: false,
    fps: 30,
    resolution: '5MP HD',
    modelName: 'AXIS M1137-E Box Camera',
    lastPing: new Date().toISOString(),
    isDemo: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 'cam-axis-05',
    name: 'Executive Corridor West',
    location: 'Building A - 3rd Floor',
    type: 'RTSP Stream',
    ipAddress: '192.168.1.105',
    port: 8554,
    username: 'sec_officer',
    hasPassword: true,
    streamUrl: 'rtsp://192.168.1.105:8554/live/stream1',
    rtspProtocol: 'UDP',
    status: 'OFFLINE',
    isAiScanning: false,
    fps: 20,
    resolution: '720p',
    modelName: 'Generic ONVIF HD Profile S',
    lastPing: new Date(Date.now() - 3600000 * 4).toISOString(),
    isDemo: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'cam-demo-01',
    name: 'Demo Interactive Camera (AXIS Simulation)',
    location: 'KLS Security Test Bench',
    type: 'Demo Simulation',
    ipAddress: '127.0.0.1 (Virtual)',
    port: 554,
    username: 'kls_demo',
    hasPassword: true,
    streamUrl: 'virtual://kls-demo-feed-axis-emulation',
    rtspProtocol: 'TCP',
    status: 'ONLINE',
    isAiScanning: true,
    fps: 30,
    resolution: '1080p Full HD',
    modelName: 'AXIS ARTPEC-8 AI Weapon Demo Unit',
    lastPing: new Date().toISOString(),
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
];

let detections: any[] = [
  {
    id: 'DET-89241',
    detected: true,
    objects: [
      {
        name: 'Knife',
        confidence: 0.94,
        boundingBox: { x: 38, y: 32, width: 24, height: 35 },
        threatLevel: 'HIGH',
        category: 'bladed_weapon',
        details: 'Visible folding tactical knife identified in suspect right hand.',
      },
    ],
    camera: 'Main Gate AXIS P1455-LE',
    cameraId: 'cam-axis-01',
    location: 'Main Entrance & Perimeter',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    timeFormatted: '10:35 AM',
    dateFormatted: 'Today',
    highestConfidence: 0.94,
    highestThreatLevel: 'HIGH',
    status: 'ACKNOWLEDGED',
    notes: 'Guard dispatched to checkpoint #1.',
  },
  {
    id: 'DET-89239',
    detected: true,
    objects: [
      {
        name: 'Gun',
        confidence: 0.91,
        boundingBox: { x: 52, y: 28, width: 28, height: 42 },
        threatLevel: 'CRITICAL',
        category: 'firearm',
        details: 'Semi-automatic black handgun drawn near vehicle entrance.',
      },
    ],
    camera: 'North Parking Lot AXIS Q3538-LVE',
    cameraId: 'cam-axis-02',
    location: 'North Vehicle Parking',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    timeFormatted: '09:58 AM',
    dateFormatted: 'Today',
    highestConfidence: 0.91,
    highestThreatLevel: 'CRITICAL',
    status: 'PENDING_REVIEW',
    notes: 'Immediate perimeter lockdown trigger queued.',
  },
];

let alerts: any[] = [
  {
    id: 'ALT-1092',
    detectionId: 'DET-89239',
    title: 'WEAPON DETECTED - HANDGUN',
    objectName: 'Gun',
    confidence: 0.91,
    cameraName: 'North Parking Lot AXIS Q3538-LVE',
    cameraId: 'cam-axis-02',
    location: 'North Vehicle Parking',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    timeFormatted: '09:58 AM',
    dateFormatted: 'Today',
    notes: 'High threat detected. Bounding box coordinates tagged.',
  },
];

let totalScansCounter = 14382;
let lastAlertTimestamp = 0;

// ==========================================
// API ROUTES - All endpoints
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let role = 'SECURITY_OFFICER';
  let name = 'Security Officer';
  let badgeNumber = 'KLS-SO-4421';

  if (email.toLowerCase().includes('admin') || password === 'admin123') {
    role = 'ADMIN';
    name = 'Commander A. Krishna';
    badgeNumber = 'KLS-ADM-001';
  } else if (email.toLowerCase().includes('sharma')) {
    name = 'Officer Sharma';
    badgeNumber = 'KLS-SO-109';
  } else {
    name = email.split('@')[0].toUpperCase();
  }

  const token = 'kls_jwt_' + Buffer.from(`${email}:${Date.now()}:${role}`).toString('base64');

  res.json({
    token,
    user: {
      id: 'usr-' + Date.now(),
      email,
      name,
      role,
      badgeNumber,
      department: 'Central Security & Threat Management SOC',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}&backgroundColor=0f172a`,
      lastLogin: new Date().toISOString(),
    },
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  const onlineCameras = cameras.filter((c) => c.status === 'ONLINE').length;
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const todayDetections = detections.filter((d) => d.detected).length;

  res.json({
    totalCameras: cameras.length,
    onlineCameras,
    totalScans: totalScansCounter,
    todayDetections,
    activeAlerts,
    criticalAlerts,
    aiMonitoringStatus: systemSettings.aiEnabled ? 'ACTIVE' : 'PAUSED',
    averageConfidence: 91.2,
    systemHealth: 99.4,
    recentAlerts: alerts.slice(0, 5),
  });
});

app.get('/api/cameras', (req, res) => {
  res.json(cameras);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/detection/history', (req, res) => {
  res.json({
    total: detections.length,
    detections: detections,
  });
});

app.get('/api/settings', (req, res) => {
  res.json(systemSettings);
});

app.post('/api/detection', async (req, res) => {
  totalScansCounter += 1;
  const { imageBase64, cameraName, cameraId, forceScenario } = req.body;

  const targetCamName = cameraName || 'Main Gate AXIS P1455-LE';
  const targetCamId = cameraId || 'cam-axis-01';

  let detectedObjects: any[] = [];

  if (forceScenario === 'KNIFE_DETECTED') {
    detectedObjects = [{
      name: 'Knife',
      confidence: 0.94,
      threatLevel: 'HIGH',
      details: 'Tactical knife detected',
    }];
  } else if (forceScenario === 'GUN_DETECTED') {
    detectedObjects = [{
      name: 'Gun',
      confidence: 0.92,
      threatLevel: 'CRITICAL',
      details: 'Handgun detected',
    }];
  }

  const detectionRecordId = 'DET-' + Math.floor(Math.random() * 89999 + 10000);

  res.json({
    detected: detectedObjects.length > 0,
    objects: detectedObjects,
    camera: targetCamName,
    detectionId: detectionRecordId,
    status: detectedObjects.length > 0 ? 'WEAPON_DETECTED' : 'AREA_CLEAR',
  });
});

// ==========================================
// STATIC FILE SERVING & ROOT HANDLER
// ==========================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');

// Serve static files from dist directory
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

export default app;