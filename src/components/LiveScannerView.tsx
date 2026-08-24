import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, DetectedObject, SecurityAlert } from '../types';
import { api } from '../services/api';
import { playWeaponAlertSiren, playAcknowledgeChime, playScanPulse } from '../utils/audioAlert';
import {
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  Camera as CameraIcon,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Radio,
  Cctv,
  Zap,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  Crosshair,
} from 'lucide-react';

interface LiveScannerViewProps {
  cameras: Camera[];
  selectedCameraId?: string;
  onTriggerAlert: (alert: SecurityAlert) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const LiveScannerView: React.FC<LiveScannerViewProps> = ({
  cameras,
  selectedCameraId,
  onTriggerAlert,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeCamId, setActiveCamId] = useState<string>(
    selectedCameraId || cameras[0]?.id || 'cam-axis-01'
  );
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [scanMode, setScanMode] = useState<'SIMULATION' | 'WEBCAM' | 'CUSTOM_IMAGE'>('SIMULATION');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [activeScenario, setActiveScenario] = useState<'KNIFE' | 'GUN' | 'RIFLE' | 'CLEAR' | 'WEBCAM_LIVE'>('KNIFE');

  // Detection Results State
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([
    {
      name: 'Knife',
      confidence: 0.94,
      boundingBox: { x: 38, y: 32, width: 24, height: 35 },
      threatLevel: 'HIGH',
      category: 'bladed_weapon',
      details: 'Visible folding tactical knife identified in suspect right hand.',
    },
  ]);
  const [isWeaponDetected, setIsWeaponDetected] = useState<boolean>(true);
  const [highestConfidence, setHighestConfidence] = useState<number>(0.94);
  const [fps, setFps] = useState<number>(30);
  const [latencyMs, setLatencyMs] = useState<number>(18);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>(new Date().toLocaleTimeString());

  // WebCam Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [analyzingAi, setAnalyzingAi] = useState<boolean>(false);

  const activeCamera = cameras.find((c) => c.id === activeCamId) || cameras[0];

  // Stop webcam stream helper
  const stopWebcam = useCallback(() => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
  }, [webcamStream]);

  // Start webcam
  const startWebcam = async () => {
    try {
      stopWebcam();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanMode('WEBCAM');
      setActiveScenario('WEBCAM_LIVE');
    } catch (err) {
      console.warn('Webcam permission not granted or unavailable, falling back to simulated AXIS stream:', err);
      setScanMode('SIMULATION');
    }
  };

  // Switch camera source
  const handleSelectCamera = (camId: string) => {
    setActiveCamId(camId);
    const cam = cameras.find((c) => c.id === camId);
    if (cam?.type === 'USB Webcam') {
      startWebcam();
    } else {
      stopWebcam();
      setScanMode('SIMULATION');
    }
  };

  // Run AI Detection on current frame
  const executeScan = useCallback(
    async (forcedScenarioOverride?: 'KNIFE_DETECTED' | 'GUN_DETECTED' | 'RIFLE_DETECTED' | 'AREA_CLEAR') => {
      if (!isScanning || isPaused) return;

      setAnalyzingAi(true);
      const startT = performance.now();

      let imageBase64: string | undefined = undefined;

      // If webcam active, capture canvas snapshot
      if (scanMode === 'WEBCAM' && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
          }
        }
      } else if (scanMode === 'CUSTOM_IMAGE' && customImageSrc) {
        imageBase64 = customImageSrc;
      }

      try {
        let force: any = forcedScenarioOverride;
        if (!force && scanMode === 'SIMULATION') {
          if (activeScenario === 'KNIFE') force = 'KNIFE_DETECTED';
          else if (activeScenario === 'GUN') force = 'GUN_DETECTED';
          else if (activeScenario === 'RIFLE') force = 'RIFLE_DETECTED';
          else if (activeScenario === 'CLEAR') force = 'AREA_CLEAR';
        }

        const res = await api.runDetection({
          imageBase64,
          cameraName: activeCamera?.name || 'Main Gate AXIS Camera',
          cameraId: activeCamera?.id || 'cam-axis-01',
          forceScenario: force,
          confidenceThresholdOverride: confidenceThreshold,
        });

        const elapsed = Math.round(performance.now() - startT);
        setLatencyMs(elapsed < 10 ? 18 : elapsed);
        setLastScanTimestamp(new Date().toLocaleTimeString());

        setDetectedObjects(res.objects || []);
        setIsWeaponDetected(res.detected);
        setHighestConfidence(res.highestConfidence || 0);

        if (res.detected && res.alert) {
          if (soundEnabled) {
            playWeaponAlertSiren();
          }
          onTriggerAlert(res.alert);
        }
      } catch (err) {
        console.error('Scan execution error:', err);
      } finally {
        setAnalyzingAi(false);
      }
    },
    [isScanning, isPaused, scanMode, customImageSrc, activeScenario, activeCamera, confidenceThreshold, soundEnabled, onTriggerAlert]
  );

  // Periodic AI scanning cycle
  useEffect(() => {
    if (!isScanning || isPaused) return;

    const interval = setInterval(() => {
      executeScan();
    }, 4000);

    return () => clearInterval(interval);
  }, [isScanning, isPaused, executeScan]);

  // Clean up webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // Handle image upload test
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setCustomImageSrc(b64);
      setScanMode('CUSTOM_IMAGE');
      stopWebcam();
      // Trigger scan immediately on uploaded frame
      setTimeout(() => {
        executeScan();
      }, 200);
    };
    reader.readAsDataURL(file);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Switch demo simulation scenario
  const setScenario = (sc: 'KNIFE' | 'GUN' | 'RIFLE' | 'CLEAR') => {
    stopWebcam();
    setScanMode('SIMULATION');
    setActiveScenario(sc);
    setCustomImageSrc(null);
    const forceMap = {
      KNIFE: 'KNIFE_DETECTED' as const,
      GUN: 'GUN_DETECTED' as const,
      RIFLE: 'RIFLE_DETECTED' as const,
      CLEAR: 'AREA_CLEAR' as const,
    };
    executeScan(forceMap[sc]);
  };

  return (
    <div id="kls-live-scanner-view" className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header & Camera Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-100 uppercase tracking-tight">
                Live AI Weapon Scanner
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                AXIS ARTPEC-8 VAPIX
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Neural line-of-sight computer vision threat scanner for firearms &amp; bladed weapons
            </p>
          </div>
        </div>

        {/* Camera Selector Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-slate-400">Target Feed:</label>
          <select
            id="scanner-camera-selector"
            value={activeCamId}
            onChange={(e) => handleSelectCamera(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Scanner Stage */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[480px] lg:min-h-[560px]"
      >
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 1. WEBCAM FEED */}
        {scanMode === 'WEBCAM' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover max-h-[560px]"
          />
        )}

        {/* 2. CUSTOM UPLOADED IMAGE */}
        {scanMode === 'CUSTOM_IMAGE' && customImageSrc && (
          <img
            src={customImageSrc}
            alt="Custom uploaded camera frame"
            className="w-full h-full object-contain max-h-[560px] bg-black"
          />
        )}

        {/* 3. SIMULATED AXIS SECURITY CAMERA FEED (DEFAULT) */}
        {scanMode === 'SIMULATION' && (
          <div className="relative w-full h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden">
            {/* High-Tech Security Visual Simulation Canvas Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-900/90" />
            
            {/* Visual Security Camera Scene Representation */}
            <div className="relative z-0 w-full h-full flex items-center justify-center">
              {/* Surveillance Room / Entrance Environment Graphic */}
              <svg className="w-full h-full opacity-60" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Wall and Horizon Grid */}
                <rect width="800" height="450" fill="#050811" />
                <path d="M0 320L800 320M0 360L800 360M0 400L800 400" stroke="#1e293b" strokeWidth="1" />
                <path d="M150 450L300 280M650 450L500 280M400 450L400 280" stroke="#1e293b" strokeWidth="1" />
                {/* Security Turnstile / Doorframe */}
                <rect x="260" y="140" width="280" height="240" stroke="#334155" strokeWidth="3" fill="#0f172a" fillOpacity="0.4" />
                <line x1="400" y1="140" x2="400" y2="380" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />
                {/* Overhead Security Lamp Glow */}
                <circle cx="400" cy="80" r="40" fill="#38bdf8" fillOpacity="0.05" />
                <circle cx="400" cy="80" r="4" fill="#38bdf8" />
              </svg>

              {/* Subject Illustration based on active scenario */}
              {activeScenario === 'KNIFE' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Silhouette of suspect holding tactical knife */}
                  <div className="relative w-72 h-80 flex flex-col items-center">
                    {/* Person Silhouette */}
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700" />
                    <div className="w-36 h-48 bg-slate-800/80 rounded-t-3xl mt-2 border border-slate-700 relative">
                      {/* Arm holding knife */}
                      <div className="absolute -right-12 top-10 w-24 h-10 bg-slate-800 rounded-lg rotate-12 border border-slate-700 flex items-center justify-end pr-2">
                        {/* Tactical Knife Graphic */}
                        <div className="w-16 h-4 bg-gradient-to-r from-slate-400 to-slate-100 rounded-r-md border border-amber-400 shadow-lg shadow-amber-500/50 flex items-center">
                          <span className="text-[7px] text-black font-bold font-mono pl-1">TACTICAL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeScenario === 'GUN' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Silhouette of suspect with raised handgun */}
                  <div className="relative w-80 h-80 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700" />
                    <div className="w-40 h-48 bg-slate-800/80 rounded-t-3xl mt-2 border border-slate-700 relative">
                      {/* Arm holding handgun */}
                      <div className="absolute -right-14 top-8 w-28 h-12 bg-slate-800 rounded-lg -rotate-6 border border-slate-700 flex items-center justify-end pr-2">
                        {/* Handgun Graphic */}
                        <div className="w-14 h-8 bg-zinc-900 border-2 border-red-500 rounded-sm shadow-xl shadow-red-500/50 flex items-center justify-center">
                          <span className="text-[7px] text-red-400 font-black font-mono">9MM GUN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeScenario === 'RIFLE' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Silhouette of suspect with tactical rifle */}
                  <div className="relative w-96 h-80 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700" />
                    <div className="w-44 h-48 bg-slate-800/80 rounded-t-3xl mt-2 border border-slate-700 relative">
                      {/* Tactical Rifle Graphic Across Chest */}
                      <div className="absolute -left-10 top-14 w-64 h-12 bg-zinc-900 border-2 border-rose-500 rounded shadow-xl shadow-rose-500/50 flex items-center justify-between px-3 -rotate-12">
                        <span className="text-[8px] text-rose-300 font-mono font-black">LONGARM RIFLE DETECTED</span>
                        <div className="w-16 h-3 bg-zinc-800 rounded-r border border-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeScenario === 'CLEAR' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Normal pedestrian silhouette with briefcase / coffee */}
                  <div className="relative w-64 h-80 flex flex-col items-center opacity-70">
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-emerald-600/50" />
                    <div className="w-36 h-48 bg-slate-800/80 rounded-t-3xl mt-2 border border-emerald-600/50 relative">
                      <div className="absolute -right-8 top-16 w-12 h-14 bg-amber-900/60 rounded border border-amber-700 flex items-center justify-center">
                        <span className="text-[7px] text-amber-200 font-mono">BAG</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REAL-TIME AI BOUNDING BOX OVERLAYS */}
        {isScanning && !isPaused && detectedObjects.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {detectedObjects.map((obj, idx) => {
              const isGun = obj.name.toLowerCase().includes('gun') || obj.name.toLowerCase().includes('rifle');
              const boxColor = isGun ? '#ef4444' : '#f59e0b';
              const confPercent = Math.round(obj.confidence * 100);

              return (
                <div
                  key={`bbox-${idx}`}
                  style={{
                    left: `${obj.boundingBox.x}%`,
                    top: `${obj.boundingBox.y}%`,
                    width: `${obj.boundingBox.width}%`,
                    height: `${obj.boundingBox.height}%`,
                    borderColor: boxColor,
                  }}
                  className="absolute border-2 rounded-sm shadow-lg transition-all duration-300 animate-pulse"
                >
                  {/* Corner Reticles */}
                  <div
                    style={{ borderColor: boxColor }}
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2"
                  />
                  <div
                    style={{ borderColor: boxColor }}
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2"
                  />
                  <div
                    style={{ borderColor: boxColor }}
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2"
                  />
                  <div
                    style={{ borderColor: boxColor }}
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2"
                  />

                  {/* Target Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <Crosshair className="w-6 h-6 text-white" />
                  </div>

                  {/* Top Floating Badge Tag: Name & Confidence */}
                  <div
                    style={{ backgroundColor: boxColor }}
                    className="absolute -top-7 left-0 text-white font-black text-xs px-2 py-0.5 rounded shadow flex items-center gap-1.5 tracking-wider whitespace-nowrap"
                  >
                    <span>{obj.name}</span>
                    <span className="bg-black/60 px-1 py-0.2 rounded font-mono text-[10px]">
                      {confPercent}%
                    </span>
                  </div>

                  {/* Threat Level Label */}
                  <div className="absolute -bottom-5 right-0 bg-black/80 border border-slate-700 text-[9px] text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    THREAT: {obj.threatLevel}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optical Scanning Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[length:100%_4px] opacity-40 z-10" />

        {/* Top Left OSD: Camera Name & Timecode */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1 text-[11px] font-mono text-slate-200 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-white uppercase">{activeCamera?.name}</span>
            <span className="text-slate-500">[{activeCamera?.location}]</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>REC &bull; 1080p@30FPS</span>
            <span>RTSP/554 TCP</span>
            <span className="text-sky-400">{lastScanTimestamp}</span>
          </div>
        </div>

        {/* Top Right OSD: Live AI Detection Status Banner */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* Main Status Pill */}
          {isWeaponDetected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/90 border-2 border-red-600 text-red-200 shadow-xl shadow-red-950/80 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider text-red-300">
                  ⚠ WEAPON DETECTED
                </div>
                <div className="text-[10px] text-red-200 font-mono">
                  {detectedObjects.map((o) => `${o.name} (${Math.round(o.confidence * 100)}%)`).join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  ✓ AREA CLEAR
                </div>
                <div className="text-[10px] text-emerald-400/80">
                  No supported weapon detected
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/70 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom OSD Bar: AI Model Telemetry */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ● AI SCANNING ACTIVE
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              Confidence Threshold: <strong className="text-amber-400">{confidenceThreshold}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[10px]">
            <span>Latency: <strong className="text-sky-400">{latencyMs}ms</strong></span>
            <span>FPS: <strong className="text-slate-200">{fps}</strong></span>
            {analyzingAi && <span className="text-amber-400 animate-pulse">Scanning Frame...</span>}
          </div>
        </div>
      </div>

      {/* Control Console: Primary Actions, Sensitivity & Scenario Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Scan Controls & Audio Siren Toggle */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Scanner Playback Controls</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleSound}
                className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                <span>{soundEnabled ? 'Siren ON' : 'Muted'}</span>
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              id="scanner-start-btn"
              onClick={() => {
                setIsScanning(true);
                setIsPaused(false);
                executeScan();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isScanning && !isPaused
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Scan</span>
            </button>

            <button
              id="scanner-pause-btn"
              onClick={() => setIsPaused(!isPaused)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isPaused
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              id="scanner-stop-btn"
              onClick={() => {
                setIsScanning(false);
                setDetectedObjects([]);
                setIsWeaponDetected(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isScanning
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Scan</span>
            </button>
          </div>

          {/* Video Input Modes: Webcam / Upload Frame */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
            <button
              onClick={startWebcam}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === 'WEBCAM'
                  ? 'bg-sky-600 text-white border-sky-500 shadow'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <CameraIcon className="w-3.5 h-3.5" />
              <span>Use PC Webcam</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Upload custom camera frame image for AI weapon scan"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Upload Frame</span>
            </button>
          </div>
        </div>

        {/* Center: AI Confidence Threshold Slider */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Confidence Threshold</span>
              </span>
              <span className="font-mono text-amber-400 text-sm bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                {confidenceThreshold}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Detections with confidence &ge; {confidenceThreshold}% immediately generate security alerts and sound alarms.
            </p>

            <input
              id="scanner-threshold-slider"
              type="range"
              min="50"
              max="95"
              step="1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>50% (High Sensitivity)</span>
              <span>75% (Default)</span>
              <span>95% (High Precision)</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-slate-300 font-bold">Cooldown Filter:</span> Continuous frames debounced to 5-sec cooldown to avoid alert flooding.
          </div>
        </div>

        {/* Right: Hackathon 1-Click Interactive Threat Scenarios */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Threat Simulation</span>
            </span>
            <span className="text-[10px] text-slate-500">Hackathon Mode</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScenario('KNIFE')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'KNIFE' && scanMode === 'SIMULATION'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-amber-400">Knife Detected</div>
              <div className="text-[10px] text-slate-400 font-mono">94% Confidence &bull; High</div>
            </button>

            <button
              onClick={() => setScenario('GUN')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'GUN' && scanMode === 'SIMULATION'
                  ? 'bg-red-950/60 border-red-500 text-red-200 shadow'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-red-400">Gun Detected</div>
              <div className="text-[10px] text-slate-400 font-mono">92% Confidence &bull; Critical</div>
            </button>

            <button
              onClick={() => setScenario('RIFLE')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'RIFLE' && scanMode === 'SIMULATION'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-rose-400">Rifle Detected</div>
              <div className="text-[10px] text-slate-400 font-mono">96% Confidence &bull; Critical</div>
            </button>

            <button
              onClick={() => setScenario('CLEAR')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'CLEAR' && scanMode === 'SIMULATION'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-emerald-400">Area Clear</div>
              <div className="text-[10px] text-slate-400 font-mono">No Weapon &bull; 0% Threat</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
