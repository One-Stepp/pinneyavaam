import React from 'react';
import { AlertCircle, Clock, ShieldCheck, Flame, ShieldAlert } from 'lucide-react';

interface DistractionTimerProps {
  seconds: number;
  maxSeconds?: number;
  isDistracted: boolean;
  onEmergencyTrigger?: () => void;
}

export const DistractionTimer: React.FC<DistractionTimerProps> = ({
  seconds,
  maxSeconds = 10,
  isDistracted,
}) => {
  const progressPercent = Math.min(100, Math.round((seconds / maxSeconds) * 100));
  const remainingSeconds = Math.max(0, maxSeconds - seconds);

  // SVG circular gauge math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Determine urgency level (adapted for 10-second threshold)
  const isDangerZone = seconds >= 7;
  const isWarningZone = seconds >= 4 && seconds < 7;

  let strokeColor = '#10b981'; // green
  if (isDangerZone) {
    strokeColor = '#f43f5e'; // red
  } else if (isWarningZone || isDistracted) {
    strokeColor = '#f59e0b'; // amber
  }

  return (
    <div
      id="distraction-timer-card"
      className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 backdrop-blur-2xl ${
        isDangerZone
          ? 'bg-rose-500/15 border-rose-500/50 shadow-xl shadow-rose-950/40'
          : isDistracted
          ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-950/30'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Progress Gauge + Timer Numbers */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="7"
                className="text-white/10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`text-xl font-bold font-mono ${
                  isDangerZone ? 'text-rose-400 animate-pulse' : isDistracted ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {seconds}s
              </span>
              <span className="text-[9px] font-mono text-slate-400">/ {maxSeconds}s</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {isDangerZone ? (
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
              ) : isDistracted ? (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                {isDangerZone
                  ? 'CRITICAL DISTRACTION'
                  : isDistracted
                  ? 'GAZE DIVERTED'
                  : 'ATTENTION LOCKED'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              {isDistracted ? (
                <span>
                  Timer active: <strong className="font-mono text-white">{remainingSeconds}s</strong> until full emergency.
                </span>
              ) : (
                <span>Screen gaze verified. Idle protocol in effect.</span>
              )}
            </p>

            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {isDistracted
                ? `Look back at screen to reset the ${maxSeconds}s emergency timer.`
                : 'Timer safely parked at 0s.'}
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
              isDangerZone
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : isDistracted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isDistracted ? 'LOOKING AWAY' : 'MAINTAINED'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Threshold: {maxSeconds} seconds
          </span>
        </div>
      </div>

      {/* Progress Bar Line at Bottom */}
      <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isDangerZone
              ? 'bg-rose-500'
              : isDistracted
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
