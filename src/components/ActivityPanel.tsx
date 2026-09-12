import React, { useState } from 'react';
import { Activity, Clock, Trash2, Filter, BellOff, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useUselessStore } from '../store/useUselessStore';
import { ActivityItem } from '../types';

interface ActivityPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ isOpen = true, onClose }) => {
  const { state } = useUselessStore();
  const [filter, setFilter] = useState<string>('all');

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  const filteredActivities = state.activities.filter((act) => {
    if (filter === 'all') return true;
    return act.source.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <aside
      id="useless-activity-panel"
      className={`h-full flex flex-col bg-[var(--bg-sidebar)] backdrop-blur-3xl border-l border-[var(--border-subtle)] p-4 select-none
        transition-all duration-300 w-80 shrink-0 ${isOpen ? 'block' : 'hidden'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <span className="font-extrabold text-xs tracking-wider text-slate-200 uppercase">
            Activity
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/5 text-slate-400">
            {state.activities.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 lg:hidden"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-header / System Telemetry note */}
      <div className="px-2.5 py-2 mb-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Idle Telemetry Active
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          REAL-TIME
        </span>
      </div>

      {/* Activities Scroll Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <BellOff className="w-7 h-7 mx-auto mb-2 opacity-30" />
            No activities recorded.
            <p className="text-[10px] mt-1 text-slate-400">Start avoiding tasks to see updates.</p>
          </div>
        ) : (
          filteredActivities.map((act, idx) => {
            const isHighPriority = act.highlight;
            return (
              <div
                key={act.id ? `${act.id}-${idx}` : `act-${idx}`}
                className={`p-3 rounded-2xl transition-all duration-200 border text-left ${
                  isHighPriority
                    ? 'bg-amber-500/10 border-amber-500/30 text-slate-200 shadow-md shadow-amber-950/20'
                    : 'bg-white/[0.03] border-white/6 hover:bg-white/[0.06] hover:border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">{act.icon}</span>
                    <span className="text-xs font-semibold text-white truncate">
                      {act.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatRelativeTime(act.timestamp)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300/90 leading-relaxed break-words pl-0.5">
                  {act.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom mini-summary */}
      <div className="pt-3 border-t border-white/6 mt-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Non-Productivity Rate</span>
          <span className="font-mono text-emerald-400 font-semibold">100.0%</span>
        </div>
      </div>
    </aside>
  );
};
