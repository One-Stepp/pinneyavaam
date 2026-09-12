import React from 'react';
import { ArrowLeft, Award, BarChart2, Coffee, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { sounds } from '../../utils/sound';

export const ProcrastinationView: React.FC = () => {
  const { state, setApp, avoidTask } = useUselessStore();

  const badges = [
    {
      title: 'Grandmaster of Deferral',
      description: 'Avoided 10+ critical life obligations with zero remorse.',
      icon: '🛋️',
      unlocked: state.tasksAvoided >= 10,
    },
    {
      title: 'Titanium Forearm',
      description: 'Wrangled cursor mass exceeding 800 kg without yielding.',
      icon: '🏋️',
      unlocked: state.gravityCursor.currentWeight >= 800,
    },
    {
      title: 'Flappy Demigod',
      description: 'Accepted secret pipe guidance without questioning own skill.',
      icon: '🐦',
      unlocked: state.flappyBird.pipesAvoided >= 20,
    },
    {
      title: 'Consciousness Rejector',
      description: 'Snoozed the Anti-Alarm 5+ times in a single session.',
      icon: '⏰',
      unlocked: state.snoozesCount >= 5,
    },
    {
      title: 'Creative Rationale Poet',
      description: 'Generated 15+ excuses that defy human logic.',
      icon: '🤖',
      unlocked: state.excusesGenerated >= 15,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setApp('overview')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
            title="Back to OS Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white uppercase">
                PROCRASTINATION ANALYTICS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                AUDITED INCOMPETENCE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              A comprehensive quantitative breakdown of everything you haven't done.
            </p>
          </div>
        </div>

        <button
          onClick={avoidTask}
          className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Postpone More Work</span>
        </button>
      </div>

      {/* Big Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="text-[11px] font-mono text-slate-400 mb-1">COMPOSITE SCORE</div>
          <div className="text-4xl font-extrabold font-mono text-white">
            {state.procrastinationScore}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">Tier: Elite Slacker</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="text-[11px] font-mono text-slate-400 mb-1">TOTAL TIME WASTED</div>
          <div className="text-4xl font-extrabold font-mono text-sky-400">
            {state.minutesWasted}m
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Saved from work burnout</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="text-[11px] font-mono text-slate-400 mb-1">TASKS DODGED</div>
          <div className="text-4xl font-extrabold font-mono text-amber-400">
            {state.tasksAvoided}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Peace of mind preserved</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="text-[11px] font-mono text-slate-400 mb-1">SNOOZES REGISTERED</div>
          <div className="text-4xl font-extrabold font-mono text-purple-400">
            {state.snoozesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Dreams extended</div>
        </div>
      </div>

      {/* Time Allocation Breakdown */}
      <div className="p-6 rounded-3xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 space-y-4">
        <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
          Wasted Time Distribution
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">🐦 Helping Flappy Bird Avoid Reality</span>
              <span className="text-emerald-400">38%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[38%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">🖱️ Fighting Gravitational Mouse Physics</span>
              <span className="text-sky-400">27%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full w-[27%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">⏰ Denying Morning Consciousness</span>
              <span className="text-amber-400">21%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[21%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">🤖 Inventing Surreal AI Excuses</span>
              <span className="text-purple-400">14%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[14%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Inefficiency Badges Grid */}
      <div className="p-6 rounded-3xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              Certificates of Non-Achievement
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {badges.filter((b) => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all ${
                b.unlocked
                  ? 'bg-white/[0.04] border-white/10 text-white'
                  : 'bg-white/[0.01] border-white/5 text-slate-400 opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{b.icon}</div>
              <div className="text-xs font-bold font-mono text-slate-200 mb-1">
                {b.title}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {b.description}
              </p>
              <div className="mt-3 text-[10px] font-mono">
                {b.unlocked ? (
                  <span className="text-emerald-400 font-semibold">✓ UNLOCKED</span>
                ) : (
                  <span className="text-slate-400">🔒 IN PROGRESS</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
