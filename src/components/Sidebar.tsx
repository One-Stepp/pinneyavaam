import React from 'react';
import {
  LayoutDashboard,
  MousePointer,
  Bird,
  BellRing,
  Bot,
  Eye,
  BarChart3,
  Settings,
  Trash2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useUselessStore } from '../store/useUselessStore';
import { AppId } from '../types';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: AppId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  subtext?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { state, setApp } = useUselessStore();

  const homeItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];

  const appItems: NavItem[] = [
    {
      id: 'gravity-cursor',
      label: 'Gravity Cursor',
      icon: <MousePointer className="w-4 h-4 text-sky-400" />,
      subtext: `${state.gravityCursor.currentWeight} kg`,
    },
    {
      id: 'flappy-bird',
      label: 'Helpful Flappy Bird',
      icon: <Bird className="w-4 h-4 text-emerald-400" />,
      badge: `${state.flappyBird.bestScore}`,
    },
    {
      id: 'anti-alarm',
      label: 'Anti-Alarm',
      icon: <BellRing className="w-4 h-4 text-amber-400" />,
      badge: `${state.alarm.snoozeCount}z`,
    },
    {
      id: 'useless-bot',
      label: 'UselessBot',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      badge: 'AI',
    },
    {
      id: 'eye-contact',
      label: 'Eye Contact',
      icon: <Eye className="w-4 h-4 text-rose-400" />,
      subtext: state.eyeContact.attentionStatus,
    },
  ];

  const systemItems: NavItem[] = [
    {
      id: 'procrastination',
      label: 'Procrastination',
      icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
      badge: `${state.procrastinationScore}%`,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
    },
  ];

  const handleSelect = (id: AppId) => {
    setApp(id);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = state.currentApp === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/[0.12] text-white shadow-md shadow-black/40 border border-[var(--border-highlight)] backdrop-blur-xl'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/5'
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.subtext && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.subtext}
                  </span>
                )}
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 group-hover:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-slate-400 opacity-80" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="useless-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 h-full flex flex-col justify-between 
          bg-[var(--bg-sidebar)] backdrop-blur-3xl border-r border-[var(--border-subtle)] p-4 select-none transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div>
          <div className="px-3 pt-2 pb-5 border-b border-white/6 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-base shadow-inner">
                  <span role="img" aria-label="wastebasket">🗑️</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-wider text-white">
                      PINNEYAVAAM
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      v4.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    pani undu, samayam undu, pinneyavaam
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Sections */}
          <nav className="overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            {renderSection('Home', homeItems)}
            {renderSection('Useless Apps', appItems)}
            {renderSection('System', systemItems)}
          </nav>
        </div>

        {/* System Status Pill at Bottom */}
        <div className="pt-3 border-t border-white/6">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  System Status
                </div>
                <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                  UNPRODUCTIVE
                </div>
              </div>
            </div>
            <div title="Procrastination Verified" className="text-slate-400 hover:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
