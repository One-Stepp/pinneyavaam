import React from 'react';
import {
  MousePointer,
  Bird,
  BellRing,
  Bot,
  Eye,
  ArrowUpRight,
  Shield,
  Gauge,
  Sparkles
} from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { AppId } from '../../types';

export const FeatureCardsGrid: React.FC = () => {
  const { state, setApp } = useUselessStore();

  const cards = [
    {
      id: 'gravity-cursor' as AppId,
      icon: '🪐',
      name: 'GRAVITY CURSOR',
      description: 'Your mouse is too lightweight. Dedicated full-screen gravity simulation.',
      statusLabel: state.gravityCursor.enabled ? 'FULL SCREEN' : 'OFF',
      statusColor: state.gravityCursor.enabled ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : 'text-slate-400 bg-slate-800',
      statistic: `Vertical mass scaling up to ${state.gravityCursor.maxWeight} kg`,
      accentColor: 'from-sky-500/10 to-indigo-500/5',
      borderColor: 'group-hover:border-sky-500/30',
      actionText: 'Launch Fullscreen',
    },
    {
      id: 'flappy-bird' as AppId,
      icon: '🐦',
      name: 'HELPFUL FLAPPY BIRD',
      description: 'A Flappy Bird game that refuses to let you lose.',
      statusLabel: 'INVULNERABLE',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      statistic: `Score: ${state.flappyBird.score}  •  Best: ${state.flappyBird.bestScore}`,
      accentColor: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'group-hover:border-emerald-500/30',
      actionText: 'Play & Never Lose',
    },
    {
      id: 'anti-alarm' as AppId,
      icon: '⏰',
      name: 'ANTI-ALARM',
      description: 'Auditory sabotage: Metal rock at bedtime prevents sleep, morphing into hypnotic lullaby to prevent waking.',
      statusLabel: state.alarm.isRinging ? 'RINGING' : 'IDLE',
      statusColor: state.alarm.isRinging ? 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse' : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      statistic: `Next: ${state.alarm.nextAlarm}  •  Snoozes: ${state.alarm.snoozeCount}`,
      accentColor: 'from-amber-500/10 to-orange-500/5',
      borderColor: 'group-hover:border-amber-500/30',
      actionText: 'Schedule Delay',
    },
    {
      id: 'useless-bot' as AppId,
      icon: '🤖',
      name: 'USELESSBOT',
      description: 'Your sarcastic AI companion strictly committed to harmless procrastination.',
      statusLabel: state.uselessBot.mode,
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      statistic: `Excuses: ${state.excusesGenerated}  •  [GENERATE EXCUSE] ready`,
      accentColor: 'from-purple-500/10 to-pink-500/5',
      borderColor: 'group-hover:border-purple-500/30',
      actionText: 'Consult Excuse Engine',
    },
    {
      id: 'eye-contact' as AppId,
      icon: '👁️',
      name: 'EYE CONTACT MONITOR',
      description: 'Converts unwanted productivity into randomized YouTube dopamine.',
      statusLabel: state.eyeContact.dopamineMode ? 'DOPAMINE ON' : 'MONITOR ONLY',
      statusColor: state.eyeContact.dopamineMode
        ? 'text-pink-400 bg-pink-500/15 border-pink-500/30'
        : 'text-slate-400 bg-white/5 border-white/10',
      statistic: `Releases: ${state.dopamineReleases}  •  ${state.eyeContactSessionsCompleted} sessions`,
      accentColor: 'from-rose-500/10 to-purple-500/5',
      borderColor: 'group-hover:border-rose-500/30',
      actionText: 'Open Dopamine System',
    },
    {
      id: 'procrastination' as AppId,
      icon: '📊',
      name: 'PROCRASTINATION AUDIT',
      description: 'Quantify your inefficiency. Comprehensive metrics on time well-wasted.',
      statusLabel: `${state.procrastinationScore}% INEFFICIENCY`,
      statusColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      statistic: `Wasted: ${state.minutesWasted}m  •  Avoided: ${state.tasksAvoided}`,
      accentColor: 'from-indigo-500/10 to-blue-500/5',
      borderColor: 'group-hover:border-indigo-500/30',
      actionText: 'View Slacker Report',
    },
    {
      id: 'settings' as AppId,
      icon: '⚙️',
      name: 'SYSTEM PREFERENCES',
      description: 'Fine-tune sound frequencies, chime volumes, and chromatic OS vibes.',
      statusLabel: state.audioEnabled ? 'AUDIO ON' : 'MUTED',
      statusColor: state.audioEnabled
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : 'text-slate-400 bg-white/5 border-white/10',
      statistic: `Theme: ${state.vibeTheme.toUpperCase()}  •  5 Themes Available`,
      accentColor: 'from-slate-500/10 to-zinc-500/5',
      borderColor: 'group-hover:border-slate-500/30',
      actionText: 'Customize OS',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          id={`feature-card-${card.id}`}
          onClick={() => setApp(card.id)}
          className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-[var(--bg-surface)] 
            backdrop-blur-xl border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] 
            hover:bg-[var(--bg-surface-hover)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 cursor-pointer flex flex-col justify-between`}
        >
          {/* Subtle gradient background wash */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

          <div className="relative z-10">
            {/* Top Row: Icon + Status */}
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-[var(--border-subtle)] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                {card.icon}
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${card.statusColor}`}>
                  {card.statusLabel}
                </span>
                <span className="p-1 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Feature Name */}
            <h4 className="text-sm font-bold tracking-wide text-white uppercase font-mono mb-1.5">
              {card.name}
            </h4>

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {card.description}
            </p>
          </div>

          {/* Bottom Statistic + Action hint */}
          <div className="relative z-10 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-300 font-medium truncate max-w-[70%]">
              {card.statistic}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              {card.actionText} →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
