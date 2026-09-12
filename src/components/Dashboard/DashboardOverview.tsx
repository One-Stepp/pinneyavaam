import React, { useState, useEffect } from 'react';
import { HeroProcrastinationCard } from './HeroProcrastinationCard';
import { FeatureCardsGrid } from './FeatureCardsGrid';
import { Clock, Calendar, Sparkles, Coffee, ShieldAlert, Cpu } from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';

export const DashboardOverview: React.FC = () => {
  const { avoidTask } = useUselessStore();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('GOOD EVENING, USER.');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );

      const hours = now.getHours();
      if (hours < 12) setGreeting('GOOD MORNING, USER.');
      else if (hours < 18) setGreeting('GOOD AFTERNOON, USER.');
      else setGreeting('GOOD EVENING, USER.');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 font-bold">
              {greeting}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans">
            Welcome back to Useless.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Everything is working exactly as inefficiently as intended.
          </p>
        </div>

        {/* Live Clock & Date Badge */}
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/6 px-4 py-2.5 rounded-2xl backdrop-blur-md self-start md:self-auto">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-mono font-bold text-white tracking-wide">
              {time || '--:--:--'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {dateStr || 'Loading date...'}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Procrastination Score Card */}
      <HeroProcrastinationCard />

      {/* Feature Apps Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-300 font-mono">
            Installed Inefficiencies
          </h2>
          <p className="text-xs text-slate-400">
            Select an anti-productivity tool to actively waste your precious hours.
          </p>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          5 APPS READY
        </span>
      </div>

      {/* Feature Cards Grid */}
      <FeatureCardsGrid />

      {/* Bottom Humorous Quote / Telemetry Box */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="text-base">🛋️</span>
          <span>
            <strong>Procrastinator's Law #1:</strong> If you wait until the last minute, it only takes a minute to do.
          </span>
        </div>
        <button
          onClick={avoidTask}
          className="shrink-0 text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors cursor-pointer"
        >
          Confirm deliberate delay →
        </button>
      </div>
    </div>
  );
};
