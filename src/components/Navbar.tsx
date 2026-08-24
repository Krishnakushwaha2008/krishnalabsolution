import React, { useState } from 'react';
import { KLSLogo } from './KLSLogo';
import { SecurityAlert, UserProfile } from '../types';
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  LogOut,
  Shield,
  Radio,
  User,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeAlerts: SecurityAlert[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  onOpenDemoTour: () => void;
  onSelectAlert: (alert: SecurityAlert) => void;
  onNavigate: (tab: string) => void;
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeAlerts,
  soundEnabled,
  onToggleSound,
  onLogout,
  onOpenDemoTour,
  onSelectAlert,
  onNavigate,
}) => {
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadAlertsCount = activeAlerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <header
      id="kls-top-navbar"
      className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 flex items-center justify-between"
    >
      {/* Left: Brand & Radar Status */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-left cursor-pointer focus:outline-none"
        >
          <KLSLogo size="md" showTagline={false} />
        </button>

        {/* Live System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-300 font-medium">AI Monitoring:</span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">ACTIVE</span>
        </div>
      </div>

      {/* Right: Actions, Alerts, Sound, Demo Mode & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Hackathon 1-Click Interactive Demo Button */}
        <button
          id="navbar-start-demo-btn"
          onClick={onOpenDemoTour}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold rounded-lg shadow-md shadow-red-950/40 transition-all cursor-pointer transform hover:scale-[1.02]"
          title="Launch Guided Hackathon Demo Presentation"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>START DEMO</span>
        </button>

        {/* Audio Siren Toggle Button */}
        <button
          id="navbar-audio-toggle"
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
          }`}
          title={soundEnabled ? 'Alert Siren Audio: ENABLED' : 'Alert Siren Audio: MUTED'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Security Alerts Dropdown */}
        <div className="relative">
          <button
            id="navbar-alerts-bell"
            onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
            className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
              unreadAlertsCount > 0
                ? 'bg-red-950/40 border-red-800/80 text-red-400 hover:bg-red-900/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {alertsDropdownOpen && (
            <div
              id="navbar-alerts-menu"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Active Security Alerts ({unreadAlertsCount})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAlertsDropdownOpen(false);
                    onNavigate('alerts');
                  }}
                  className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                >
                  View All in Alert Center
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-60" />
                    All perimeter zones clear. No active alerts.
                  </div>
                ) : (
                  activeAlerts.slice(0, 5).map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => {
                        onSelectAlert(alt);
                        setAlertsDropdownOpen(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-800/60 transition-colors flex items-start gap-3 cursor-pointer"
                    >
                      <span
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-red-500 animate-ping'
                            : alt.severity === 'HIGH'
                            ? 'bg-amber-400'
                            : 'bg-blue-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-red-400 truncate">{alt.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{alt.timeFormatted}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                          {alt.cameraName} &bull; <span className="text-amber-300">{Math.round(alt.confidence * 100)}% Conf</span>
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="navbar-user-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{user.badgeNumber}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div
              id="navbar-user-menu"
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs"
            >
              <div className="p-2 border-b border-slate-800 mb-1">
                <div className="font-bold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                <div className="mt-1 inline-block text-[9px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.5 rounded">
                  {user.role} &bull; {user.badgeNumber}
                </div>
              </div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onNavigate('settings');
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Account & SOC Settings</span>
              </button>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/50 text-red-400 flex items-center gap-2 cursor-pointer mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
