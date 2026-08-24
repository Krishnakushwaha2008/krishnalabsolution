import React, { useState } from 'react';
import { SecurityAlert } from '../types';
import { api } from '../services/api';
import { exportAlertsToCSV } from '../utils/exportUtils';
import { playAcknowledgeChime } from '../utils/audioAlert';
import {
  BellRing,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Clock,
  Cctv,
  UserCheck,
  Search,
  Download,
  Filter,
  CheckSquare,
  Eye,
  Trash2,
  Send,
} from 'lucide-react';

interface AlertCenterViewProps {
  alerts: SecurityAlert[];
  onRefresh: () => void;
  onSelectAlert: (alert: SecurityAlert) => void;
  officerName: string;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  alerts,
  onRefresh,
  onSelectAlert,
  officerName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Review Modal State
  const [reviewModalAlert, setReviewModalAlert] = useState<SecurityAlert | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Filter alerts
  const filteredAlerts = alerts.filter((alt) => {
    if (selectedCategory === 'CRITICAL' && alt.severity !== 'CRITICAL') return false;
    if (selectedCategory === 'HIGH' && alt.severity !== 'HIGH') return false;
    if (selectedCategory === 'MEDIUM' && alt.severity !== 'MEDIUM') return false;
    if (selectedCategory === 'REVIEWED' && alt.status !== 'RESOLVED' && alt.status !== 'DISMISSED') return false;
    if (selectedCategory === 'ACTIVE' && alt.status !== 'ACTIVE') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        alt.title.toLowerCase().includes(term) ||
        alt.objectName.toLowerCase().includes(term) ||
        alt.cameraName.toLowerCase().includes(term) ||
        alt.location.toLowerCase().includes(term) ||
        alt.id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.acknowledgeAlert(id, officerName);
      playAcknowledgeChime();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReview = (alt: SecurityAlert, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewModalAlert(alt);
    setReviewNotes(alt.notes || '');
    setIsFalsePositive(alt.status === 'DISMISSED');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalAlert) return;

    setProcessing(true);
    try {
      await api.reviewAlert(reviewModalAlert.id, {
        officerName,
        resolutionNotes: reviewNotes,
        isFalsePositive,
      });
      playAcknowledgeChime();
      setReviewModalAlert(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAlert = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this alert log?')) return;
    try {
      await api.deleteAlert(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH' && a.status === 'ACTIVE').length;
  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const reviewedCount = alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'DISMISSED').length;

  return (
    <div id="kls-alert-center-view" className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-[10px] font-bold text-red-400 uppercase tracking-wider">
              Security Incident Dispatch &bull; Tier 1 Response
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Security Alert Center
          </h1>
          <p className="text-xs text-slate-400">
            Acknowledge threat alarms, review visual weapon captures, and dispatch security teams
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAlertsToCSV(alerts)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export Alerts to CSV Log"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Alerts', count: alerts.length, color: 'text-slate-200' },
          { id: 'ACTIVE', label: 'Active Alerts', count: activeCount, color: 'text-red-400 font-bold' },
          { id: 'CRITICAL', label: 'Critical Firearms', count: criticalCount, color: 'text-red-400 font-bold' },
          { id: 'HIGH', label: 'High Threat (Knives)', count: highCount, color: 'text-amber-400 font-bold' },
          { id: 'REVIEWED', label: 'Reviewed / Cleared', count: reviewedCount, color: 'text-emerald-400' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
              selectedCategory === tab.id
                ? 'bg-slate-800 text-white border-slate-600 shadow'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className={tab.color}>{tab.label}</span>
            <span className="bg-black/50 px-1.5 py-0.2 rounded-full text-[10px] font-mono text-slate-400">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by weapon type (Gun, Knife), camera name, location, or alert ID..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto opacity-60" />
            <div className="text-sm font-bold text-slate-300">No Security Alerts Found</div>
            <p>Perimeter zones are clear or no alerts match the current filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCritical = alt.severity === 'CRITICAL';
            const isHigh = alt.severity === 'HIGH';
            const isActive = alt.status === 'ACTIVE';
            const isAcknowledged = alt.status === 'ACKNOWLEDGED';

            return (
              <div
                key={alt.id}
                onClick={() => onSelectAlert(alt)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-600 ${
                  isActive
                    ? 'bg-red-950/30 border-red-800/80 hover:bg-red-950/40'
                    : isAcknowledged
                    ? 'bg-slate-900/90 border-amber-800/60'
                    : 'bg-slate-950/80 border-slate-800/80'
                }`}
              >
                {/* Left: Severity indicator & Alert info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-red-950 border-red-700 text-red-400 animate-pulse'
                        : isHigh
                        ? 'bg-amber-950 border-amber-700 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-500 font-bold bg-black/50 px-1.5 py-0.5 rounded">
                        {alt.id}
                      </span>
                      <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                        {alt.title}
                      </h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : isHigh
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {alt.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-200">
                        <Cctv className="w-3.5 h-3.5 text-sky-400" />
                        {alt.cameraName}
                      </span>
                      <span>&bull;</span>
                      <span>{alt.location}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {alt.dateFormatted} at {alt.timeFormatted}
                      </span>
                    </div>

                    {alt.notes && (
                      <p className="text-xs text-slate-400 pt-1 italic">
                        "{alt.notes}"
                      </p>
                    )}

                    {alt.acknowledgedBy && (
                      <div className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        <span>Acknowledged by {alt.acknowledgedBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Confidence Score & Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-bold uppercase text-slate-500">AI Confidence</div>
                    <div className="text-base font-black text-amber-400 font-mono">
                      {Math.round(alt.confidence * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Acknowledge Button */}
                    {alt.status === 'ACTIVE' && (
                      <button
                        onClick={(e) => handleAcknowledge(alt.id, e)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Acknowledge Alert as on-duty officer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {/* Review & Resolve Button */}
                    <button
                      onClick={(e) => handleOpenReview(alt, e)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Review resolution or mark false positive"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>{alt.status === 'ACTIVE' ? 'Review' : 'Update Review'}</span>
                    </button>

                    {/* Details view */}
                    <button
                      onClick={() => onSelectAlert(alt)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      title="View Details Modal"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeleteAlert(alt.id, e)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl border border-red-800/60 transition-colors cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Alert Modal */}
      {reviewModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                  Incident Review &bull; {reviewModalAlert.id}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalAlert(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Weapon Object:</span>
                <span className="font-bold text-red-400">{reviewModalAlert.objectName} ({Math.round(reviewModalAlert.confidence * 100)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-200">{reviewModalAlert.cameraName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-400 font-mono">{reviewModalAlert.timeFormatted}</span>
              </div>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Officer Incident Notes &amp; Action Taken
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Guard dispatched to main turnstile. Suspect inspected and verified."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="false-positive-toggle"
                  checked={isFalsePositive}
                  onChange={(e) => setIsFalsePositive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-red-500"
                />
                <label htmlFor="false-positive-toggle" className="text-slate-300 cursor-pointer">
                  Mark as Benign Object / False Positive (Tool / Umbrella)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalAlert(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isFalsePositive ? 'Dismiss as False Alarm' : 'Resolve Incident'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
