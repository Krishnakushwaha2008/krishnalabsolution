import React, { useState } from 'react';
import { SecurityAlert, Camera } from '../types';
import { exportAlertsToCSV } from '../utils/exportUtils';
import {
  History,
  Search,
  Download,
  Calendar,
  Cctv,
  ShieldAlert,
  Eye,
  Filter,
  ArrowUpDown,
  Crosshair,
} from 'lucide-react';

interface DetectionHistoryViewProps {
  alerts: SecurityAlert[];
  cameras: Camera[];
  onSelectAlert: (alert: SecurityAlert) => void;
}

export const DetectionHistoryView: React.FC<DetectionHistoryViewProps> = ({
  alerts,
  cameras,
  onSelectAlert,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCameraFilter, setSelectedCameraFilter] = useState('ALL');
  const [selectedWeaponFilter, setSelectedWeaponFilter] = useState('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('ALL');

  const filteredHistory = alerts.filter((item) => {
    if (selectedCameraFilter !== 'ALL' && item.cameraId !== selectedCameraFilter) return false;
    if (selectedWeaponFilter !== 'ALL' && !item.objectName.toLowerCase().includes(selectedWeaponFilter.toLowerCase())) return false;
    if (selectedSeverityFilter !== 'ALL' && item.severity !== selectedSeverityFilter) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.objectName.toLowerCase().includes(q) ||
        item.cameraName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="kls-history-view" className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              Forensic Audit Logs &bull; Immutable Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            AI Detection &amp; Threat History
          </h1>
          <p className="text-xs text-slate-400">
            Historical visible weapon identifications, confidence distributions, and bounding box forensics
          </p>
        </div>

        <button
          onClick={() => exportAlertsToCSV(filteredHistory)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4 text-sky-400" />
          <span>Export Forensics CSV</span>
        </button>
      </div>

      {/* Filter Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Search Records
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Camera Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Camera Node
          </label>
          <select
            value={selectedCameraFilter}
            onChange={(e) => setSelectedCameraFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Monitored Cameras</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Weapon Type Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Weapon Category
          </label>
          <select
            value={selectedWeaponFilter}
            onChange={(e) => setSelectedWeaponFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Weapon Categories</option>
            <option value="Gun">Guns &amp; Handguns</option>
            <option value="Knife">Knives &amp; Blades</option>
            <option value="Rifle">Rifles &amp; Longarms</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Threat Severity
          </label>
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Threats</option>
            <option value="HIGH">High Threats</option>
            <option value="MEDIUM">Medium Threats</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Event ID / Time</th>
                <th className="py-3.5 px-4">Camera Source</th>
                <th className="py-3.5 px-4">Detected Weapon</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status / Officer</th>
                <th className="py-3.5 px-4 text-right">Forensic View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No detection logs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isCritical = item.severity === 'CRITICAL';
                  const isHigh = item.severity === 'HIGH';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectAlert(item)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* ID & Time */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-200 font-bold">{item.id}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.dateFormatted} &bull; {item.timeFormatted}
                        </div>
                      </td>

                      {/* Camera */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-semibold">{item.cameraName}</div>
                        <div className="text-[10px] text-slate-400">{item.location}</div>
                      </td>

                      {/* Detected Weapon */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-red-400" />
                          {item.objectName}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            isCritical
                              ? 'bg-red-600 text-white'
                              : isHigh
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 text-[11px]">{item.status}</div>
                        {item.acknowledgedBy && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            By {item.acknowledgedBy}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAlert(item);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
