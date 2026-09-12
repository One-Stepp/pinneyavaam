import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  Palette,
  Check,
  ChevronDown,
  Clock,
  Battery,
  ShieldAlert,
  Bot,
  Bird,
  MousePointer,
  BellRing,
  Lock,
  LayoutDashboard,
  Eye,
  BarChart3,
  Settings
} from 'lucide-react';
import { useUselessStore } from '../store/useUselessStore';
import { VibeTheme } from '../types';
import { sounds } from '../utils/sound';

interface TopMenubarProps {
  isActivityOpen: boolean;
  onToggleActivity: () => void;
  onOpenMobileSidebar?: () => void;
  onLockScreen?: () => void;
}

interface ThemeOption {
  id: VibeTheme;
  name: string;
  dotColor: string;
  tagline: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'nebula',
    name: 'Nebula Obsidian',
    dotColor: 'bg-indigo-500 shadow-indigo-500/50',
    tagline: 'Deep void with electric violet & cyan glow',
  },
  {
    id: 'amber',
    name: 'Cyberdeck Amber',
    dotColor: 'bg-amber-500 shadow-amber-500/50',
    tagline: 'Warm phosphor terminal CRT aesthetic',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Midnight',
    dotColor: 'bg-pink-500 shadow-pink-500/50',
    tagline: 'Cyberpunk synthwave magenta & neon',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    dotColor: 'bg-emerald-500 shadow-emerald-500/50',
    tagline: 'Bioluminescent jade & dark sci-fi HUD',
  },
  {
    id: 'stealth',
    name: 'Titanium Stealth',
    dotColor: 'bg-zinc-400 shadow-zinc-400/50',
    tagline: 'High-contrast monochrome minimalist',
  },
];

export const TopMenubar: React.FC<TopMenubarProps> = ({
  isActivityOpen,
  onToggleActivity,
  onOpenMobileSidebar,
  onLockScreen,
}) => {
  const {
    state,
    setApp,
    setVibeTheme,
    toggleSound,
    avoidTask,
    snoozeAlarm,
    recordExcuseGenerated,
    updateGravityCursor,
    addActivity,
  } = useUselessStore();

  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isVibeMenuOpen, setIsVibeMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setIsVibeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWindowControl = (action: string) => {
    sounds.playClick(400, 0.05);
    if (action === 'close') {
      avoidTask();
    } else if (action === 'minimize') {
      setApp('overview');
    } else if (action === 'maximize') {
      setApp('procrastination');
    }
  };

  const currentTheme = THEME_OPTIONS.find((t) => t.id === state.vibeTheme) || THEME_OPTIONS[0];

  return (
    <header
      ref={menuRef}
      id="useless-top-menubar"
      className="h-10 shrink-0 w-full bg-[var(--bg-sidebar)] backdrop-blur-2xl border-b border-[var(--border-subtle)] px-3 sm:px-4 flex items-center justify-between text-xs select-none z-40 transition-colors duration-300"
    >
      {/* Left: Window Controls & OS Menus */}
      <div className="flex items-center gap-3">
        {/* macOS style Window Dots */}
        <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-white/10">
          <button
            onClick={() => handleWindowControl('close')}
            title="Close Ambition (Logs an avoided task)"
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 border border-rose-600 transition-transform active:scale-90"
          />
          <button
            onClick={() => handleWindowControl('minimize')}
            title="Minimize Stress (Back to Overview)"
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 border border-amber-600 transition-transform active:scale-90"
          />
          <button
            onClick={() => handleWindowControl('maximize')}
            title="Maximize Procrastination (Analytics)"
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-600 transition-transform active:scale-90"
          />
        </div>

        {/* Brand / Logo */}
        <div
          onClick={() => setApp('overview')}
          className="flex items-center gap-1.5 cursor-pointer font-bold font-mono tracking-wider text-white hover:opacity-90"
        >
          <span className="text-sm">🗑️</span>
          <span className="text-xs">PINNEYAVAAM</span>
        </div>

        {/* Fictional OS Menus */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-300 font-medium">
          {/* Menu: File */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
                activeMenu === 'file' ? 'bg-white/10 text-white' : ''
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    avoidTask();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center justify-between"
                >
                  <span>Postpone Next Task</span>
                  <kbd className="text-[10px] font-mono text-slate-400">⌘+P</kbd>
                </button>
                <button
                  onClick={() => {
                    setApp('procrastination');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center justify-between"
                >
                  <span>View Slacker Audit</span>
                  <kbd className="text-[10px] font-mono text-slate-400">⌘+A</kbd>
                </button>
                <div className="h-px bg-white/10 my-1" />
                {onLockScreen && (
                  <button
                    onClick={() => {
                      onLockScreen();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center justify-between"
                  >
                    <span>Lock to Cover Screen</span>
                    <kbd className="text-[10px] font-mono text-slate-400">⌘+L</kbd>
                  </button>
                )}
                <button
                  onClick={() => {
                    setApp('overview');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs"
                >
                  Close Active Window
                </button>
              </div>
            )}
          </div>

          {/* Menu: Apps */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'apps' ? null : 'apps')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
                activeMenu === 'apps' ? 'bg-white/10 text-white' : ''
              }`}
            >
              Apps
            </button>
            {activeMenu === 'apps' && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
                  Main System
                </div>
                <button
                  onClick={() => {
                    setApp('overview');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'overview' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                    <span>OS Overview</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Esc</span>
                </button>

                <div className="h-px bg-white/10 my-1" />
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
                  Useless Apps
                </div>

                <button
                  onClick={() => {
                    setApp('gravity-cursor');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'gravity-cursor' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-3.5 h-3.5 text-sky-400" />
                    <span>Gravity Cursor</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{state.gravityCursor.currentWeight}kg</span>
                </button>

                <button
                  onClick={() => {
                    setApp('flappy-bird');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'flappy-bird' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bird className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Helpful Flappy Bird</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{state.flappyBird.bestScore} pts</span>
                </button>

                <button
                  onClick={() => {
                    setApp('anti-alarm');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'anti-alarm' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                    <span>Anti-Alarm</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{state.alarm.snoozeCount} snoozes</span>
                </button>

                <button
                  onClick={() => {
                    setApp('useless-bot');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'useless-bot' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>UselessBot</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300">AI</span>
                </button>

                <button
                  onClick={() => {
                    setApp('eye-contact');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'eye-contact' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>Eye Contact Monitor</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300">{state.eyeContact.attentionStatus}</span>
                </button>

                <div className="h-px bg-white/10 my-1" />
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
                  Utilities & Config
                </div>

                <button
                  onClick={() => {
                    setApp('procrastination');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'procrastination' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Procrastination Audit</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300">{state.procrastinationScore}%</span>
                </button>

                <button
                  onClick={() => {
                    setApp('settings');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between transition-colors ${
                    state.currentApp === 'settings' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings & Themes</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Menu: Sabotage */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'sabotage' ? null : 'sabotage')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
                activeMenu === 'sabotage' ? 'bg-white/10 text-white' : ''
              }`}
            >
              Sabotage
            </button>
            {activeMenu === 'sabotage' && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setApp('gravity-cursor');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center gap-2"
                >
                  <MousePointer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Increase Mouse Weight</span>
                </button>
                <button
                  onClick={() => {
                    setApp('flappy-bird');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center gap-2"
                >
                  <Bird className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Play Flappy Bird Incompetence</span>
                </button>
                <button
                  onClick={() => {
                    snoozeAlarm('Delayed via Top OS Sabotage Menu.');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center gap-2"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <span>Snooze Anti-Alarm (+5m)</span>
                </button>
                <button
                  onClick={() => {
                    setApp('useless-bot');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center gap-2"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Generate Bot Excuse</span>
                </button>
                <button
                  onClick={() => {
                    setApp('eye-contact');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Evade Screen Surveillance</span>
                </button>
              </div>
            )}
          </div>

          {/* Menu: Window */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'window' ? null : 'window')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors ${
                activeMenu === 'window' ? 'bg-white/10 text-white' : ''
              }`}
            >
              Window
            </button>
            {activeMenu === 'window' && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
                  Window Control
                </div>
                <button
                  onClick={() => {
                    handleWindowControl('minimize');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center justify-between"
                >
                  <span>Minimize Window</span>
                  <span className="text-[10px] font-mono text-slate-400">Esc</span>
                </button>
                <button
                  onClick={() => {
                    handleWindowControl('close');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 text-xs flex items-center justify-between"
                >
                  <span>Avoid Current Task</span>
                  <span className="text-[10px] font-mono text-slate-400">⌘+P</span>
                </button>

                <div className="h-px bg-white/10 my-1" />
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
                  Open Windows
                </div>
                <button
                  onClick={() => {
                    setApp('overview');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'overview' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                  <span>OS Overview</span>
                </button>
                <button
                  onClick={() => {
                    setApp('gravity-cursor');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'gravity-cursor' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <MousePointer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Gravity Cursor</span>
                </button>
                <button
                  onClick={() => {
                    setApp('flappy-bird');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'flappy-bird' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <Bird className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Helpful Flappy Bird</span>
                </button>
                <button
                  onClick={() => {
                    setApp('anti-alarm');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'anti-alarm' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <span>Anti-Alarm</span>
                </button>
                <button
                  onClick={() => {
                    setApp('useless-bot');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'useless-bot' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>UselessBot</span>
                </button>
                <button
                  onClick={() => {
                    setApp('eye-contact');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'eye-contact' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Eye Contact</span>
                </button>
                <button
                  onClick={() => {
                    setApp('procrastination');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'procrastination' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Procrastination</span>
                </button>
                <button
                  onClick={() => {
                    setApp('settings');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 ${
                    state.currentApp === 'settings' ? 'bg-white/10 text-white font-semibold' : 'text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Vibe & Color Scheme Selector */}
      <div className="relative">
        <button
          id="top-vibe-selector-btn"
          onClick={() => setIsVibeMenuOpen(!isVibeMenuOpen)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-[var(--border-subtle)] text-[11px] font-mono text-slate-200 transition-all active:scale-95 shadow-sm"
          title="Change Color Scheme & Vibe"
        >
          <span className={`w-2 h-2 rounded-full ${currentTheme.dotColor} animate-pulse shadow-sm`} />
          <span className="font-semibold text-white tracking-wide">{currentTheme.name}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isVibeMenuOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-64 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-3xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-white/10 mb-1.5 flex items-center justify-between">
              <span>Aesthetic Vibe Preset</span>
              <Palette className="w-3 h-3 text-indigo-400" />
            </div>

            <div className="space-y-1">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = state.vibeTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setVibeTheme(theme.id);
                      setIsVibeMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-white/15 border border-white/20 text-white shadow-md'
                        : 'hover:bg-white/8 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.dotColor} shrink-0`} />
                      <div>
                        <div className="text-xs font-bold font-mono text-white">{theme.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{theme.tagline}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Telemetry, Battery, Sound, Activity Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Gravity Cursor Toggle */}
        <button
          onClick={() => {
            const next = !state.gravityCursor.enabled;
            updateGravityCursor({ enabled: next });
            if (next) {
              sounds.playGravityEngage();
              addActivity('Gravity Cursor', 'Global gravitational field engaged across all OS apps.', '🪐');
            } else {
              sounds.playClick();
              addActivity('Gravity Cursor', 'Antigravity stabilizer engaged. Global cursor mass neutralized.', '🪶');
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all active:scale-95 cursor-pointer ${
            state.gravityCursor.enabled
              ? 'bg-sky-500/20 text-sky-200 border-sky-500/40 shadow-sm shadow-sky-950/60'
              : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border-white/5 hover:bg-white/[0.08]'
          }`}
          title="Toggle Global Gravity Cursor across all apps (Alt+G)"
        >
          <MousePointer
            className={`w-3.5 h-3.5 ${
              state.gravityCursor.enabled ? 'text-sky-300 fill-sky-400 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span className="hidden sm:inline font-bold">Gravity:</span>
          <span className={state.gravityCursor.enabled ? 'text-sky-300 font-bold' : 'text-slate-400'}>
            {state.gravityCursor.enabled ? 'ON' : 'OFF'}
          </span>
          {state.gravityCursor.enabled && (
            <span className="hidden xl:inline text-[10px] text-sky-400/80 font-bold">
              {state.gravityCursor.currentWeight || 847}kg
            </span>
          )}
        </button>

        {/* Quick Avoid Button */}
        <button
          onClick={avoidTask}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-[11px] font-mono text-amber-300 font-bold transition-all active:scale-95 shadow-sm"
          title="Log an avoided task"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Postpone (+1)</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 text-slate-300 transition-colors"
          title={state.soundEnabled ? 'Mute OS Sounds' : 'Unmute OS Sounds'}
        >
          {state.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          )}
        </button>

        {/* Lock / Cover Screen Button */}
        {onLockScreen && (
          <button
            onClick={() => {
              sounds.playClick();
              onLockScreen();
            }}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 text-slate-300 hover:text-white transition-colors"
            title="Lock to Cover Screen"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        )}

        {/* Simulated Battery: 99% Drained */}
        <div
          title="Battery: 99% Drained of Ambition"
          className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/5"
        >
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
          <span>99%</span>
        </div>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-200">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{time || '12:00:00'}</span>
        </div>

        {/* Activity Feed Toggle */}
        <button
          onClick={onToggleActivity}
          className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono ${
            isActivityOpen
              ? 'bg-white/15 text-white border-white/20'
              : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/5'
          }`}
          title="Toggle System Activity Feed"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>
    </header>
  );
};
