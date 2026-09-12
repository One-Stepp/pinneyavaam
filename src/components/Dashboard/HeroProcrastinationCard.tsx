import React from 'react';
import { TrendingUp, Sparkles, Coffee, Moon, ShieldCheck, Gauge } from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';

export const HeroProcrastinationCard: React.FC = () => {
  const { state, avoidTask, setApp } = useUselessStore();
  const score = state.procrastinationScore;

  return (
    <div
      id="hero-procrastination-card"
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] 
        backdrop-blur-3xl border border-[var(--border-subtle)] shadow-2xl shadow-black/60 group transition-all duration-300 hover:border-[var(--border-highlight)]"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[var(--accent-primary)] opacity-10 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--accent-secondary)] opacity-10 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />

      <div className="relative z-10">
        {/* Card Header & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/[0.06] border border-[var(--border-subtle)] text-amber-400 shadow-inner">
              <Coffee className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-widest text-slate-300 uppercase font-mono">
                  PROCRASTINATION SCORE™
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
                  PEAK INEFFICIENCY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audited un-achievement metric running on verified zero ambition.
              </p>
            </div>
          </div>

          <button
            onClick={avoidTask}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-mono font-bold text-white border border-[var(--border-subtle)] shadow-lg shadow-black/40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Avoid Another Task (+1)</span>
          </button>
        </div>

        {/* Big Score Display */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white font-mono drop-shadow-md">
                {score}%
              </span>
              <span className="text-sm font-semibold text-emerald-400 font-mono flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +3.2% vs yesterday
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-200 font-medium mt-1">
              "You are doing remarkably, exquisitely little."
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/[0.04] px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] backdrop-blur-md">
            <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>System status: <strong className="text-emerald-400">DORMANT</strong>. No immediate risk of getting things done.</span>
          </div>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="mb-6">
          <div className="h-3.5 w-full rounded-full bg-white/5 border border-white/5 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-700 ease-out shadow-md"
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
            <span>Productive (Danger Zone)</span>
            <span className="text-slate-300">Target: 100% Supreme Inactivity</span>
          </div>
        </div>

        {/* Inefficiency Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--border-subtle)] hover:bg-white/[0.06] transition-all">
            <div className="text-[11px] font-medium text-slate-400 mb-1">Tasks Avoided</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {state.tasksAvoided}
            </div>
            <div className="text-[10px] text-emerald-400/90 mt-0.5 font-mono">Dodged with grace</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--border-subtle)] hover:bg-white/[0.06] transition-all">
            <div className="text-[11px] font-medium text-slate-400 mb-1">Minutes Wasted</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-sky-400">
              {state.minutesWasted}m
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Irretrievable bliss</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--border-subtle)] hover:bg-white/[0.06] transition-all">
            <div className="text-[11px] font-medium text-slate-400 mb-1">Anti-Alarm Snoozes</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
              {state.snoozesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Consciousness denied</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--border-subtle)] hover:bg-white/[0.06] transition-all">
            <div className="text-[11px] font-medium text-slate-400 mb-1">Excuses Generated</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-400">
              {state.excusesGenerated}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Flawless rationale</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--border-subtle)] hover:bg-white/[0.06] transition-all">
            <div className="text-[11px] font-medium text-slate-400 mb-1">Dopamine Releases</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-pink-400">
              {state.dopamineReleases}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
              {state.dopamineCategory ? `${state.dopamineCategory}` : 'YouTube rewards'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
