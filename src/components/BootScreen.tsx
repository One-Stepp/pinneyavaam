import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu, HardDrive, CheckCircle2, ChevronRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  '>> USELESS BIOS v2.0.26-ALPHA [BUILD 0404-NOOP]',
  '>> CPU: 0-Core Unproductive Processing Unit @ 0.00 GHz',
  '>> RAM: 640 KB BASE MEMORY VERIFIED (ALL ALLOCATED TO INERTIA)',
  '>> INITIALIZING ANTI-PRODUCTIVITY KERNEL v1.0.9...',
  '>> DISABLING RESPONSIBILITY PROTOCOLS... [OK]',
  '>> LOADING CORE SUBSYSTEMS:',
  '   + mod_gravity_cursor.sys (Curvature field active)',
  '   + mod_helpful_flappy.sys (Invisible cheat shields enabled)',
  '   + mod_anti_alarm.sys (Infinite snooze routine loaded)',
  '   + mod_useless_bot.sys (Synthetic excuse matrix online)',
  '   + mod_eye_contact.sys (MediaPipe gaze deflection ready)',
  '>> CALIBRATING PROCRASTINATION INDEX: -37% INITIAL EFFICIENCY DROP',
  '>> SYSTEM STATUS: DELIGHTFULLY UNPRODUCTIVE.',
  '>> BOOT COMPLETE. LAUNCHING USELESS OS INTERFACE...',
];

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Reveal log lines sequentially
    const lineInterval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        if (prev < BOOT_LOGS.length - 1) {
          sounds.playClick(800 + prev * 50, 0.02);
          return prev + 1;
        }
        return prev;
      });
    }, 120);

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + Math.floor(Math.random() * 12) + 6);
      });
    }, 110);

    // Transition out when finished
    const completeTimeout = setTimeout(() => {
      sounds.playStartup();
      onComplete();
    }, 2200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        sounds.playStartup();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(lineInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        sounds.playStartup();
        onComplete();
      }}
      className="fixed inset-0 z-50 bg-[#06080d] text-emerald-400 font-mono text-xs select-none flex flex-col justify-between p-6 sm:p-10 cursor-pointer overflow-hidden animate-in fade-in duration-300"
    >
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between border-b border-emerald-900/50 pb-3">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold tracking-widest uppercase text-emerald-300">
            USELESS OS BOOTSTRAP ENVIRONMENT // v2.0.26
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-emerald-600">
          <span className="hidden sm:inline">ENERGY STATE: DORMANT</span>
          <span className="text-emerald-400 animate-pulse">[CLICK OR SPACE TO SKIP]</span>
        </div>
      </div>

      {/* Terminal logs */}
      <div className="relative z-30 flex-1 my-6 space-y-1.5 overflow-hidden flex flex-col justify-end">
        {BOOT_LOGS.slice(0, currentLineIndex + 1).map((log, idx) => (
          <div
            key={idx}
            className={`transition-opacity duration-100 ${
              idx === currentLineIndex
                ? 'text-emerald-300 font-bold'
                : 'text-emerald-500/80'
            }`}
          >
            {log}
          </div>
        ))}
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Footer & Progress */}
      <div className="relative z-30 border-t border-emerald-900/50 pt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-500">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>UNPRODUCTIVITY ENGINE LOADING: {progress}%</span>
          </div>
          <span>MEMORY DUMP: 0 ERRORS (BECAUSE NOTHING IS USEFUL)</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-emerald-950/60 rounded-full overflow-hidden border border-emerald-900/40">
          <div
            className="h-full bg-emerald-400 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(52,211,153,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
