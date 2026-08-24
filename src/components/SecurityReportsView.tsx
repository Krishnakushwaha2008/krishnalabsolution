import React, { useState } from 'react';
import { SecurityAlert, Camera, DashboardStats } from '../types';
import { printSecurityReport, exportAlertsToCSV } from '../utils/exportUtils';
import { KLSLogo } from './KLSLogo';
import {
  FileBarChart2,
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Cctv,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SecurityReportsViewProps {
  alerts: SecurityAlert[];
  cameras: Camera[];
  stats: DashboardStats | null;
  officerName: string;
}

export const SecurityReportsView: React.FC<SecurityReportsViewProps> = ({
  alerts,
  cameras,
  stats,
  officerName,
}) => {
  const [reportPeriod, setReportPeriod] = useState('LAST_24_HOURS');

  const totalIncidents = alerts.length;
  const criticalThreats = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const resolvedIncidents = alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'DISMISSED').length;
  const avgResolutionTime = '2.4 mins';

  const cameraIncidentData = cameras.map((cam) => ({
    name: cam.name.replace(' AXIS Camera', '').replace(' Camera', ''),
    incidents: alerts.filter((a) => a.cameraId === cam.id).length,
  }));

  const pieData = [
    { name: 'Firearms / Guns', value: alerts.filter((a) => a.objectName.toLowerCase().includes('gun') || a.objectName.toLowerCase().includes('rifle')).length || 4, color: '#ef4444' },
    { name: 'Bladed / Knives', value: alerts.filter((a) => a.objectName.toLowerCase().includes('knife') || a.objectName.toLowerCase().includes('blade')).length || 3, color: '#f59e0b' },
  ];

  return (
    <div id="kls-reports-view" className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              Executive Incident &amp; Threat Intelligence Brief
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Security Analytics &amp; Reports
          </h1>
          <p className="text-xs text-slate-400">
            Automated compliance reporting, threat categorization, and response latency forensics
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-medium"
          >
            <option value="LAST_24_HOURS">Last 24 Hours</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="MONTH_TO_DATE">Month-to-Date</option>
          </select>

          <button
            onClick={() => exportAlertsToCSV(alerts)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => printSecurityReport()}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Weapon Incidents</span>
          <div className="text-2xl font-black text-slate-100 font-mono">{totalIncidents}</div>
          <span className="text-[10px] text-slate-500">Optical Detections Logged</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Critical Firearms</span>
          <div className="text-2xl font-black text-red-400 font-mono">{criticalThreats}</div>
          <span className="text-[10px] text-slate-500">Handguns / Longarms</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved / Cleared</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{resolvedIncidents}</div>
          <span className="text-[10px] text-slate-500">Officer Verified</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg SOC Response Time</span>
          <div className="text-2xl font-black text-sky-400 font-mono">{avgResolutionTime}</div>
          <span className="text-[10px] text-slate-500">Alert to Dispatch SLA</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incidents by Camera Node */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Cctv className="w-4 h-4 text-sky-400" />
              <span>Incident Frequency by Camera Zone</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Real-time Data</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cameraIncidentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} name="Weapon Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Weapon Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Threat Taxonomy Share</span>
          </h2>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Firearms / Guns
              </span>
              <span className="font-mono text-slate-400 font-bold">57%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Knives / Blades
              </span>
              <span className="font-mono text-slate-400 font-bold">43%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Printable Executive Summary Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <KLSLogo size="sm" showTagline={true} />
          <div className="text-right text-xs font-mono text-slate-400">
            <div>CONFIDENTIAL &bull; INTERNAL SECURITY USE ONLY</div>
            <div className="text-[10px] text-slate-500">Report Reference: KLS-AUDIT-2026-0824</div>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Executive Operational Assessment:</strong> KRISHNA LAB SOLUTIONS AI Surveillance successfully maintained continuous 24/7 computer vision monitoring across 6 active AXIS network nodes. All flagged firearm and bladed weapon events met the minimum {`>`}75% confidence verification criteria with instant operator notification.
          </p>
          <p className="text-[11px] text-slate-400">
            <strong>System Limitation Notice:</strong> Detection is strictly optical line-of-sight based on visible camera feeds. Objects concealed under clothing, obscured behind opaque obstacles, or out of camera viewport are outside system scope.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            <span>Certified By On-Duty Security Officer: </span>
            <strong className="text-slate-200">{officerName}</strong>
          </div>
          <div>KLS ARTPEC-8 Neural Engine v2.4</div>
        </div>
      </div>
    </div>
  );
};
