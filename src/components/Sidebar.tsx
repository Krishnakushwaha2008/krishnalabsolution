import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  Cctv,
  BellRing,
  History,
  FileBarChart2,
  Settings,
  ShieldCheck,
  Radio,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertsCount: number;
  onlineCamerasCount: number;
  onOpenDemoTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
  onlineCamerasCount,
  onOpenDemoTour,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scanner',
      label: 'Live AI Scanner',
      icon: ScanEye,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    },
    {
      id: 'cameras',
      label: 'AXIS Cameras',
      icon: Cctv,
      badge: `${onlineCamerasCount} Online`,
      badgeColor: 'bg-sky-950 text-sky-400 border border-sky-800',
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null,
      badgeColor: 'bg-red-600 text-white font-bold animate-pulse',
    },
    {
      id: 'history',
      label: 'Detection History',
      icon: History,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Security Reports',
      icon: FileBarChart2,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings & AI Config',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      id="kls-sidebar"
      className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-[calc(100vh-61px)] p-3 justify-between select-none"
    >
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          SOC Surveillance Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-sky-900/60 to-slate-800/80 text-sky-300 border border-sky-600/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Area: Presentation Demo Banner & System Info */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {/* Hackathon Demo Quick Launch Box */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-950/40 via-slate-900 to-amber-950/30 border border-red-800/40 text-left">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hackathon Demo Mode</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 leading-tight">
            Run automated weapon detection showcase with simulated AXIS stream.
          </p>
          <button
            id="sidebar-start-demo-btn"
            onClick={onOpenDemoTour}
            className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Launch Demo Flow</span>
          </button>
        </div>

        {/* System Footnote */}
        <div className="px-2 text-[10px] text-slate-500 space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>KLS Security Engine v2.4</span>
          </div>
          <div className="font-mono text-[9px] text-slate-600">AXIS ARTPEC-8 &bull; ONVIF Ready</div>
        </div>
      </div>
    </aside>
  );
};
