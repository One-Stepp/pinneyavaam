import React, { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { CoverScreen } from './components/CoverScreen';
import { TopMenubar } from './components/TopMenubar';
import { Sidebar } from './components/Sidebar';
import { ActivityPanel } from './components/ActivityPanel';
import { StatusBar } from './components/StatusBar';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { GravityCursor } from './components/Apps/GravityCursor';
import { GlobalGravityCursor } from './components/GlobalGravityCursor';
import { HelpfulFlappyBird } from './components/Apps/HelpfulFlappyBird';
import { AntiAlarm } from './components/Apps/AntiAlarm';
import { UselessBot } from './components/Apps/UselessBot';
import { EyeContactMonitor } from './components/Apps/EyeContactMonitor';
import { ProcrastinationView } from './components/Apps/ProcrastinationView';
import { SettingsView } from './components/Apps/SettingsView';
import { useUselessStore } from './store/useUselessStore';
import { Activity, Menu, Sparkles, X } from 'lucide-react';

type OSStage = 'boot' | 'cover' | 'desktop';

export default function App() {
  const { state, setApp, avoidTask } = useUselessStore();
  const [osStage, setOsStage] = useState<OSStage>('boot');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-collapse activity panel on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsActivityOpen(false);
      } else {
        setIsActivityOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut: Escape returns to overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.currentApp !== 'overview') {
        setApp('overview');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentApp, setApp]);

  // Stage 1: Boot Sequence
  if (osStage === 'boot') {
    return <BootScreen onComplete={() => setOsStage('cover')} />;
  }

  // Stage 2: Visually Impressive Cover / Landing Screen
  if (osStage === 'cover') {
    return <CoverScreen onEnter={() => setOsStage('desktop')} />;
  }

  // Stage 3: Main Desktop Environment
  // Render the active app view (for standard apps)
  const renderWorkspace = () => {
    switch (state.currentApp) {
      case 'gravity-cursor':
        // Gravity Cursor is rendered as a dedicated full-screen overlay experience
        return <DashboardOverview />;
      case 'flappy-bird':
        return <HelpfulFlappyBird />;
      case 'anti-alarm':
        return <AntiAlarm />;
      case 'useless-bot':
        return <UselessBot />;
      case 'eye-contact':
        return <EyeContactMonitor />;
      case 'procrastination':
        return <ProcrastinationView />;
      case 'settings':
        return <SettingsView />;
      case 'overview':
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div
      data-vibe={state.vibeTheme}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-white relative transition-colors duration-400"
    >
      {/* Global Gravity Cursor (Active across entire OS) */}
      <GlobalGravityCursor />

      {/* Dedicated Full-Screen Gravity Cursor Mode */}
      {state.currentApp === 'gravity-cursor' && (
        <GravityCursor onExit={() => setApp('overview')} />
      )}

      {/* Dynamic Ambient Background Illumination */}
      <div className="ambient-desktop-mesh" />
      <div className="os-subtle-grid absolute inset-0 pointer-events-none opacity-30 z-0" />

      {/* Top Desktop OS Menubar */}
      <TopMenubar
        isActivityOpen={isActivityOpen}
        onToggleActivity={() => setIsActivityOpen(!isActivityOpen)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onLockScreen={() => setOsStage('cover')}
      />

      {/* Mobile Bar for small screens */}
      <div className="lg:hidden h-10 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between shrink-0 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 text-xs font-mono"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Apps Menu</span>
        </button>
        <span className="text-[11px] font-mono text-slate-400 capitalize">
          {state.currentApp.replace('-', ' ')}
        </span>
      </div>

      {/* Main App Workspace Shell */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Persistent Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Mobile Flyout Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-72 h-full bg-[var(--bg-sidebar)] shadow-2xl">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Central Workspace Container */}
        <main
          id="useless-main-workspace"
          className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth relative"
        >
          {/* Render Active View */}
          {renderWorkspace()}
        </main>

        {/* Persistent Right Activity Panel */}
        <ActivityPanel
          isOpen={isActivityOpen}
          onClose={() => setIsActivityOpen(false)}
        />
      </div>

      {/* Persistent Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}
