import React, { useState } from 'react';
import { SystemSettings, UserProfile } from '../types';
import { api } from '../services/api';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  HardDrive,
  Cpu,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  settings: SystemSettings;
  user: UserProfile;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onUpdateUser: (newUser: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  user,
  onUpdateSettings,
  onUpdateUser,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [userData, setUserData] = useState<UserProfile>({ ...user });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const updated = await api.updateSettings(formData);
      onUpdateSettings(updated);
      onUpdateUser(userData);
      setStatusMsg({ type: 'success', text: 'System settings and officer profile updated successfully.' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all AI surveillance parameters to factory defaults?')) return;
    const defaults: SystemSettings = {
      confidenceThreshold: 75,
      alertCooldownSeconds: 5,
      soundAlertEnabled: true,
      autoEmailAlerts: true,
      logRetentionDays: 30,
      supportedWeaponTypes: ['gun', 'knife', 'rifle', 'blade'],
      cameraScanFps: 30,
      enableWebcamFallback: true,
    };
    setFormData(defaults);
    try {
      const updated = await api.updateSettings(defaults);
      onUpdateSettings(updated);
      setStatusMsg({ type: 'success', text: 'Factory defaults restored.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const toggleWeaponType = (type: string) => {
    const exists = formData.supportedWeaponTypes.includes(type);
    const updated = exists
      ? formData.supportedWeaponTypes.filter((t) => t !== type)
      : [...formData.supportedWeaponTypes, type];
    setFormData({ ...formData, supportedWeaponTypes: updated });
  };

  return (
    <div id="kls-settings-view" className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              SOC Terminal Configuration &amp; Neural Hyperparameters
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Security &amp; AI Settings
          </h1>
          <p className="text-xs text-slate-400">
            Tune computer vision thresholds, siren alarms, retention policies, and station credentials
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Message */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 shadow-lg ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
              : 'bg-red-950/80 border-red-700 text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Model & Weapon Detection Parameters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              AI Detection &amp; Confidence Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Confidence Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">
                  Global Confidence Trigger Threshold
                </label>
                <span className="font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                  {formData.confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={formData.confidenceThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, confidenceThreshold: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                Any weapon detection below this percentage will be logged but will not trigger audible alarm sirens.
              </p>
            </div>

            {/* Alert Cooldown */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-300">
                Alert Cooldown Filter (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.alertCooldownSeconds}
                onChange={(e) =>
                  setFormData({ ...formData, alertCooldownSeconds: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                Prevents alarm flooding during continuous camera footage exposure of the same threat.
              </p>
            </div>
          </div>

          {/* Supported Weapon Classes */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Neural Weapon Detection Categories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'gun', label: 'Handguns & Pistols' },
                { id: 'rifle', label: 'Rifles & Longarms' },
                { id: 'knife', label: 'Knives & Daggers' },
                { id: 'blade', label: 'Machetes & Swords' },
              ].map((wp) => {
                const active = formData.supportedWeaponTypes.includes(wp.id);
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => toggleWeaponType(wp.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-red-950/40 border-red-700 text-red-200'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{wp.label}</div>
                    <div className="text-[10px] font-mono mt-0.5">
                      {active ? '● ENABLED' : '○ DISABLED'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Audio Siren & Notifications */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Siren Alarms &amp; Notification Protocols
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Synthesized Audio Alert Siren</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Plays audible security siren on Critical firearm or knife identification
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.soundAlertEnabled}
                onChange={(e) => setFormData({ ...formData, soundAlertEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500"
              />
            </label>

            <label className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-slate-200">Auto Incident Dispatch Notification</div>
                <p className="text-[11px] text-slate-400">
                  Notify on-duty tactical response team when confidence exceeds 90%
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoEmailAlerts}
                onChange={(e) => setFormData({ ...formData, autoEmailAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Officer Profile & SOC Station */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              On-Duty Security Officer &amp; Terminal Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Officer Name
              </label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Badge / Credential ID
              </label>
              <input
                type="text"
                value={userData.badgeNumber}
                onChange={(e) => setUserData({ ...userData, badgeNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Security Role / Clearance
              </label>
              <input
                type="text"
                value={userData.role}
                onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-sky-950/50 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
