import React from 'react';
import {
  Camera,
  DashboardStats,
  SecurityAlert,
} from '../types';
import {
  ShieldAlert,
  Cctv,
  Activity,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  cameras: Camera[];
  alerts: SecurityAlert[];
  onNavigate: (tab: string) => void;
  onSelectAlert: (alert: SecurityAlert) => void;
  onRefresh: () => void;
  onOpenDemoTour: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  cameras,
  alerts,
  onNavigate,
  onSelectAlert,
  onRefresh,
  onOpenDemoTour,
}) => {
  const onlineCameras = cameras.filter((c) => c.status === 'ONLINE').length;
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const todayDetectionsCount = stats?.todayDetections ?? alerts.length;

  const chartData = stats?.hourlyTrend || [
    { hour: '00:00', scans: 450, threats: 0 },
    { hour: '03:00', scans: 520, threats: 0 },
    { hour: '06:00', scans: 890, threats: 1 },
    { hour: '09:00', scans: 1420, threats: 2 },
    { hour: '12:00', scans: 1680, threats: 1 },
    { hour: '15:00', scans: 1540, threats: 0 },
    { hour: '18:00', scans: 1210, threats: 0 },
    { hour: '21:00', scans: 950, threats: 1 },
  ];

  const pieData = stats?.weaponCategoryBreakdown || [
    { name: 'Guns / Firearms', count: 4, percentage: 57, color: '#ef4444' },
    { name: 'Knives / Blades', count: 3, percentage: 43, color: '#f59e0b' },
  ];

  return (
    <div id="kls-dashboard-view" className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-red-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              KLS Security Operations Center
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Security & Weapon Monitoring Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time visible weapon threat detection &bull; AXIS Camera Network Active
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10 flex-wrap">
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Launch Live Scanner</span>
          </button>

          <button
            onClick={onOpenDemoTour}
            className="px-4 py-2 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black rounded-xl shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>START DEMO</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: System Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">System Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Active</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Continuous Optical Vision</p>
          </div>
        </div>

        {/* Card 2: Total Cameras */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cameras</span>
            <Cctv className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-100">
              {onlineCameras} <span className="text-xs text-slate-400 font-normal">/ {cameras.length} Total</span>
            </div>
            <p className="text-[10px] text-sky-400 mt-0.5 font-medium">{onlineCameras} Online &amp; Streaming</p>
          </div>
        </div>

        {/* Card 3: Total Scans */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Scans</span>
            <Scan className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-100 font-mono">
              {(stats?.totalScans || 14382).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">30 FPS Live Ingestion</p>
          </div>
        </div>

        {/* Card 4: Today's Detections */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Threat Scans</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {todayDetectionsCount}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Weapon Positives Logged</p>
          </div>
        </div>

        {/* Card 5: Active Alerts */}
        <div className={`rounded-xl p-4 flex flex-col justify-between border ${
          activeAlerts.length > 0
            ? 'bg-red-950/40 border-red-800/80 text-red-300'
            : 'bg-slate-900/80 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Alerts</span>
            <ShieldAlert className={`w-4 h-4 ${activeAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div>
            <div className="text-xl font-black text-red-400 font-mono">
              {activeAlerts.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {activeAlerts.length > 0 ? 'Urgent Review Needed' : 'Perimeter Safe'}
            </p>
          </div>
        </div>

        {/* Card 6: Average Confidence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Confidence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              91.4%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">YOLO / Vision Model</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Threat Feeds + Today's Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Threat & Scan Activity Graph */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>24-Hour AI Surveillance Throughput</span>
              </h2>
              <p className="text-xs text-slate-400">Continuous optical frame verification &amp; weapon detections</p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Live Feed Sampling
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="#38bdf8" fillOpacity={1} fill="url(#scansGrad)" name="Frames Scanned" />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#threatsGrad)" name="Weapons Flagged" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weapon Category Stats Distribution */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="count" innerRadius={20} outerRadius={36} paddingAngle={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Threat Classification
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-300">Guns / Firearms (57%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Knives / Blades (43%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span>AXIS ARTPEC-8 Neural VMS</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                RTSP stream ingestion with 554/TCP latency: <strong className="text-slate-200">14ms</strong>. Real-time visual bounding box coordinates generation enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Security Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Recent Security Alerts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-sky-400 hover:underline cursor-pointer"
            >
              Alert Center &rarr;
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[340px]">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                No threat alerts detected. Perimeter clear.
              </div>
            ) : (
              alerts.slice(0, 4).map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlert(alt)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:border-slate-600 ${
                    alt.status === 'ACTIVE'
                      ? 'bg-red-950/40 border-red-800/80'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alt.status === 'ACTIVE' ? 'bg-red-500 animate-ping' : 'bg-slate-500'
                        }`}
                      />
                      {alt.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alt.timeFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <span className="font-semibold">{alt.cameraName}</span> &bull; {alt.location}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/60">
                      Confidence: {Math.round(alt.confidence * 100)}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alt.status === 'ACTIVE'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Review All Security Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Camera Fleet Quick Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Cctv className="w-4 h-4 text-sky-400" />
              <span>Camera Fleet Matrix ({cameras.length})</span>
            </h2>
            <p className="text-xs text-slate-400">AXIS IP and RTSP streams monitored by AI</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('cameras')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage AXIS Cameras</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cam.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                    />
                    <span className="truncate max-w-[180px]">{cam.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{cam.location}</div>
                </div>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                    cam.status === 'ONLINE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {cam.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900 font-mono">
                <span>{cam.type}</span>
                <span className={cam.isAiScanning ? 'text-sky-400 font-bold' : 'text-slate-600'}>
                  {cam.isAiScanning ? '● AI Scanning' : '○ Standby'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
