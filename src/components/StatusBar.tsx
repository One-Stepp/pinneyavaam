import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, Cpu, Sparkles, RefreshCw, MousePointer } from 'lucide-react';
import { useUselessStore } from '../store/useUselessStore';
import { sounds } from '../utils/sound';

export const StatusBar: React.FC = () => {
  const { state, toggleSound, avoidTask, updateGravityCursor, addActivity } = useUselessStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - state.sessionStartTime) / 1000));
      setElapsedSeconds(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [state.sessionStartTime]);

  const formatSessionTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <footer
      id="useless-statusbar"
      className="h-8 shrink-0 w-full bg-[var(--bg-sidebar)] backdrop-blur-2xl border-t border-[var(--border-subtle)] px-4 flex items-center justify-between text-[11px] font-mono select-none z-30 transition-colors duration-300"
    >
      {/* Left: Brand & Active Theme */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs">🗑️</span>
        <span className="font-bold tracking-wider text-slate-200">USELESS OS</span>
        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/5 text-slate-400 text-[10px] border border-white/5 capitalize">
          {state.vibeTheme} vibe
        </span>
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span className="text-slate-400">System Status:</span>
        <span className="text-emerald-400 font-semibold tracking-wide">
          UNPRODUCTIVE
        </span>
      </div>

      {/* Right: Telemetry & Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Gravity Status & Quick Toggle */}
        <button
          onClick={() => {
            const next = !state.gravityCursor.enabled;
            updateGravityCursor({ enabled: next });
            if (next) sounds.playGravityEngage();
            else sounds.playClick();
          }}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all active:scale-95 cursor-pointer border ${
            state.gravityCursor.enabled
              ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
              : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Click to toggle Global Gravity Cursor (Alt+G)"
        >
          <MousePointer className={`w-3 h-3 ${state.gravityCursor.enabled ? 'text-sky-300 fill-sky-400' : 'text-slate-400'}`} />
          <span className="hidden xs:inline">Gravity:</span>
          <span className={state.gravityCursor.enabled ? 'text-sky-300 font-bold' : 'text-slate-400'}>
            {state.gravityCursor.enabled ? `${state.gravityCursor.currentWeight || 847}kg` : 'OFF'}
          </span>
        </button>

        {/* Quick Task Avoid Button */}
        <button
          onClick={avoidTask}
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 active:scale-95"
          title="Log an avoided task instantly"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Avoid Task (+1)</span>
        </button>

        {/* Live Session Counter */}
        <div className="text-slate-400 flex items-center gap-1.5">
          <span className="text-slate-400">Session:</span>
          <span className="text-slate-200">{formatSessionTime(elapsedSeconds)}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          title={state.soundEnabled ? 'Mute OS Audio' : 'Unmute OS Audio'}
        >
          {state.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          )}
        </button>
      </div>
    </footer>
  );
};
