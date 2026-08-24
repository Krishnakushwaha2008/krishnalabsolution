import React from 'react';
import { SecurityAlert } from '../types';
import {
  ShieldAlert,
  Cctv,
  Clock,
  Crosshair,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Send,
  X,
} from 'lucide-react';

interface AlertDetailModalProps {
  alert: SecurityAlert | null;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  officerName: string;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
  officerName,
}) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'CRITICAL';
  const isHigh = alert.severity === 'HIGH';
  const isGun = alert.objectName.toLowerCase().includes('gun') || alert.objectName.toLowerCase().includes('rifle');
  const boxColor = isGun ? '#ef4444' : '#f59e0b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div
            className={`p-3 rounded-xl border ${
              isCritical
                ? 'bg-red-950 border-red-700 text-red-400'
                : 'bg-amber-950 border-amber-700 text-amber-400'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500 font-bold bg-black/50 px-1.5 py-0.5 rounded">
                {alert.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                  isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {alert.severity}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight mt-1">
              {alert.title}
            </h2>
          </div>
        </div>

        {/* Forensic Snapshot Stage with Bounding Box Overlay */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Optical Forensic Camera Capture
          </div>

          <div className="relative w-full h-56 sm:h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Visual Background Canvas */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center opacity-80">
              <svg className="w-full h-full opacity-40" viewBox="0 0 600 300" fill="none">
                <rect width="600" height="300" fill="#020617" />
                <path d="M0 220L600 220" stroke="#334155" strokeWidth="1" />
                <rect x="200" y="80" width="200" height="180" stroke="#475569" strokeWidth="2" fill="#0f172a" fillOpacity="0.5" />
              </svg>
            </div>

            {/* Simulated Bounding Box */}
            <div
              style={{
                left: `${alert.boundingBox?.x || 36}%`,
                top: `${alert.boundingBox?.y || 28}%`,
                width: `${alert.boundingBox?.width || 28}%`,
                height: `${alert.boundingBox?.height || 36}%`,
                borderColor: boxColor,
              }}
              className="absolute border-2 rounded-sm shadow-xl flex items-center justify-center"
            >
              <div
                style={{ backgroundColor: boxColor }}
                className="absolute -top-6 left-0 text-white font-black text-[11px] px-2 py-0.5 rounded shadow flex items-center gap-1"
              >
                <span>{alert.objectName}</span>
                <span className="bg-black/60 px-1 rounded text-[10px]">
                  {Math.round(alert.confidence * 100)}%
                </span>
              </div>
              <Crosshair className="w-5 h-5 text-white/50" />
            </div>

            {/* OSD Stamp */}
            <div className="absolute bottom-2 left-2 z-10 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
              {alert.cameraName} &bull; {alert.timeFormatted}
            </div>
          </div>
        </div>

        {/* Threat Intelligence Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Identified Threat</div>
            <div className="font-bold text-slate-200 mt-0.5">{alert.objectName}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Confidence Score</div>
            <div className="font-bold text-amber-400 font-mono mt-0.5">
              {Math.round(alert.confidence * 100)}%
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Camera Node</div>
            <div className="font-bold text-slate-200 mt-0.5">{alert.cameraName}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Location Zone</div>
            <div className="text-slate-300 mt-0.5">{alert.location}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Time Recorded</div>
            <div className="text-slate-300 font-mono mt-0.5">
              {alert.dateFormatted} {alert.timeFormatted}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Incident Status</div>
            <div className="font-bold text-red-400 font-mono mt-0.5">{alert.status}</div>
          </div>
        </div>

        {/* Limitation Notice */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Optical Detection Scope:</strong> Visual classification based on optical line-of-sight analysis. No concealed or wall penetration claims.
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Window
          </button>

          <div className="flex items-center gap-2">
            {alert.status === 'ACTIVE' && (
              <button
                onClick={() => {
                  onAcknowledge(alert.id);
                  onClose();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Acknowledge as {officerName}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
