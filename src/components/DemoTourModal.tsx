import React, { useState } from 'react';
import { KLSLogo } from './KLSLogo';
import {
  Sparkles,
  ShieldCheck,
  ScanEye,
  Cctv,
  BellRing,
  FileBarChart2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Play,
  Crosshair,
  Volume2,
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to KRISHNA LAB SOLUTIONS',
      subtitle: 'Smart AI Surveillance for Safer Spaces',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      badge: 'Hackathon Presentation Guide',
      description:
        'KLS is a professional AI-powered security monitoring system engineered to detect visible weapons (guns, knives, rifles) in real time from CCTV/IP camera feeds, including native AXIS network hardware integration.',
      keyPoints: [
        'Real-time optical AI computer vision running at 30 FPS ingestion',
        'Direct AXIS ARTPEC-8 & ONVIF Profile S camera integration over RTSP',
        'Instant bounding box reticles, confidence scores, and sound alert dispatch',
        'Strict visual line-of-sight policy (No non-visible/concealed detection claims)',
      ],
      actionLabel: 'Explore AXIS Fleet Integration',
      actionTab: 'cameras',
    },
    {
      title: 'AXIS IP Camera Network Fleet',
      subtitle: 'Secure RTSP & ONVIF Stream Management',
      icon: Cctv,
      iconColor: 'text-sky-400',
      badge: 'Step 1: Hardware Integration',
      description:
        'KLS seamlessly connects with commercial AXIS network cameras and RTSP streams. Built-in network diagnostics allow officers to verify RTSP handshakes, ping latency, and toggle AI scanning per camera node.',
      keyPoints: [
        'Encrypted credentials stored exclusively on backend service',
        'Interactive RTSP ping handshake testing with latency benchmarks',
        'Support for AXIS VAPIX, RTSP over TCP/UDP, and USB webcams',
      ],
      actionLabel: 'Launch Live AI Scanner',
      actionTab: 'scanner',
    },
    {
      title: 'Live Optical Weapon Scanner',
      subtitle: 'Bounding Boxes & Confidence Reticles',
      icon: ScanEye,
      iconColor: 'text-red-400',
      badge: 'Step 2: AI Computer Vision',
      description:
        'The scanner ingests camera feeds and generates instantaneous bounding boxes around visible threats with classification names (Gun, Knife, Rifle) and confidence metrics.',
      keyPoints: [
        'Interactive simulation triggers for Gun, Knife, and Clear Area',
        'Adjustable confidence threshold slider (50% to 95%)',
        'Live PC Webcam scanning & custom frame upload support',
        'Synthesized audio alert siren using Web Audio API',
      ],
      actionLabel: 'Open Security Alert Center',
      actionTab: 'alerts',
    },
    {
      title: 'Incident Dispatch & Forensic Audit',
      subtitle: 'Actionable SOC Workflows & Compliance',
      icon: BellRing,
      iconColor: 'text-emerald-400',
      badge: 'Step 3: Alert & Reporting SLA',
      description:
        'When a visible weapon is flagged, KLS initiates Tier 1 security protocols: alerts are cataloged, audio sirens fire, officers acknowledge incidents, and printable PDF compliance reports are generated.',
      keyPoints: [
        'Full officer incident review, false alarm dismissal, and dispatch notes',
        'Immutable detection history log with search and CSV export',
        'Executive PDF print-ready security brief with officer certification stamp',
      ],
      actionLabel: 'Go to Main SOC Dashboard',
      actionTab: 'dashboard',
    },
  ];

  const active = steps[currentStep];
  const Icon = active.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      onNavigate('dashboard');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJump = (tab: string) => {
    onClose();
    onNavigate(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <KLSLogo size="sm" showTagline={false} />
          <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full font-mono">
            {active.badge}
          </span>
        </div>

        {/* Step Indicator Bars */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i === currentStep ? 'bg-amber-400' : i < currentStep ? 'bg-sky-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl bg-slate-950 border border-slate-800 ${active.iconColor} flex-shrink-0`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">
                {active.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{active.subtitle}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {active.description}
          </p>

          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Key Capabilities:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {active.keyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation & Jump Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={() => handleJump(active.actionTab)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Jump to {active.actionLabel}</span>
            </button>
          </div>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black rounded-xl shadow-lg shadow-red-950/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish & Enter System' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
