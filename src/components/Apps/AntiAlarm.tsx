import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  BellRing,
  Moon,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  BedDouble,
  Timer,
  Flame,
  Music,
  Headphones,
  Sliders,
  Play,
  Square
} from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { sounds } from '../../utils/sound';
import { antiAlarmAudio } from '../../utils/antiAlarmAudio';

export const AntiAlarm: React.FC = () => {
  const { state, setApp, snoozeAlarm, setTargetAlarm, setAlarmRinging } = useUselessStore();
  const { alarm } = state;

  const [customTime, setCustomTime] = useState('07:00');
  const [activeDemoCountdown, setActiveDemoCountdown] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0); // 0 (Metal) -> 1 (Lullaby)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [manualScrubbing, setManualScrubbing] = useState(false);
  const [lullabyMovement, setLullabyMovement] = useState(antiAlarmAudio.currentMovementName);

  // Sync state with audio engine
  useEffect(() => {
    setIsAudioPlaying(antiAlarmAudio.getIsPlaying());
    setIsAudioMuted(antiAlarmAudio.isMuted());

    // Subscribe to multi-movement lullaby progression
    const unsub = antiAlarmAudio.onMovementChange((movement) => {
      setLullabyMovement(movement);
    });
    return unsub;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      antiAlarmAudio.stop();
    };
  }, []);

  // Countdown timer for scheduled alarm & progressive sound morphing
  useEffect(() => {
    if (!alarm.targetTimestamp) {
      setActiveDemoCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.ceil((alarm.targetTimestamp! - now) / 1000));
      setActiveDemoCountdown(remainingSeconds);

      const totalSeconds = alarm.totalDurationSeconds || 60;
      const setTs = alarm.setTimestamp || (alarm.targetTimestamp! - totalSeconds * 1000);
      const elapsedSeconds = (now - setTs) / 1000;

      // Calculate progress: 0.0 at alarm set time -> 1.0 at target alarm time
      const computedProgress = Math.min(1, Math.max(0, elapsedSeconds / totalSeconds));

      if (!manualScrubbing) {
        setAudioProgress(computedProgress);
        antiAlarmAudio.setProgress(computedProgress);
      }

      // Check if alarm triggered
      if (remainingSeconds <= 0) {
        clearInterval(interval);
        setActiveDemoCountdown(null);
        setAlarmRinging(true);
        // Ensure sleep-inducing lullaby is at 100% when alarm triggers
        antiAlarmAudio.setProgress(1.0);
        setAudioProgress(1.0);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [alarm.targetTimestamp, alarm.totalDurationSeconds, alarm.setTimestamp, manualScrubbing, setAlarmRinging]);

  // Keep audio playing in pure lullaby mode when alarm is ringing
  useEffect(() => {
    if (alarm.isRinging) {
      if (!antiAlarmAudio.getIsPlaying()) {
        antiAlarmAudio.start(1.0);
      } else {
        antiAlarmAudio.setProgress(1.0);
      }
      setAudioProgress(1.0);
      setIsAudioPlaying(true);
    }
  }, [alarm.isRinging]);

  const handleSetCustomAlarm = () => {
    sounds.playClick();
    const [hours, minutes] = customTime.split(':').map(Number);
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1); // Next day
    }
    const diffSeconds = Math.max(10, Math.round((targetDate.getTime() - now.getTime()) / 1000));

    setTargetAlarm(`Target ${customTime}`, diffSeconds);
    antiAlarmAudio.start(0);
    setAudioProgress(0);
    setIsAudioPlaying(true);
  };

  const handleQuickDemoAlarm = (seconds: number, label: string) => {
    sounds.playClick(800, 0.04);
    setTargetAlarm(label, seconds);
    antiAlarmAudio.start(0);
    setAudioProgress(0);
    setIsAudioPlaying(true);
  };

  const handleTriggerInstantAlarm = () => {
    antiAlarmAudio.start(1.0);
    antiAlarmAudio.setProgress(1.0);
    setAudioProgress(1.0);
    setIsAudioPlaying(true);
    setAlarmRinging(true);
  };

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      antiAlarmAudio.stop();
      setIsAudioPlaying(false);
    } else {
      antiAlarmAudio.start(audioProgress);
      setIsAudioPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const muted = antiAlarmAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleManualScrub = (val: number) => {
    setAudioProgress(val);
    antiAlarmAudio.setProgress(val);
    if (!isAudioPlaying) {
      antiAlarmAudio.start(val);
      setIsAudioPlaying(true);
    }
  };

  const handleSnooze = () => {
    snoozeAlarm();
    // Restart cycle with heavy metal insomnia burst!
    antiAlarmAudio.start(0);
    setAudioProgress(0);
    setIsAudioPlaying(true);
  };

  // Phase metadata for the current auditory transition
  const phaseInfo = useMemo(() => {
    if (audioProgress < 0.28) {
      return {
        name: 'PHASE 1: HEAVY METAL INSOMNIA',
        icon: '🎸',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        barColor: 'from-rose-500 to-amber-500',
        bpm: '145 BPM',
        effect: 'Aggressive drop-D guitar distortion & double-bass blast kicks',
        goal: 'Completely prevents the user from falling asleep at alarm set time',
      };
    } else if (audioProgress < 0.70) {
      return {
        name: 'PHASE 2: PSYCHOACOUSTIC MORPHING',
        icon: '⚡',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        barColor: 'from-amber-500 to-indigo-500',
        bpm: 'Decelerating...',
        effect: 'Distortion rolling off, tempo halving, theta drone emerging',
        goal: 'Gradually dissolving vigilance into heavy sensory sedation',
      };
    } else {
      return {
        name: 'PHASE 3: HYPNOTIC COMA LULLABY',
        icon: '💤',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/30',
        barColor: 'from-indigo-500 to-cyan-400',
        bpm: '48-52 BPM',
        effect: '56-note 4-movement suite: Wiegenlied, Celesta Starlight, Satie Meditations, Delta Sleep Lock',
        goal: 'Irreversible sedation at wake-up time; getting out of bed is neurologically impossible',
      };
    }
  }, [audioProgress]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/6 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setApp('overview')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 cursor-pointer"
            title="Back to OS Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white uppercase">
                ANTI-PRODUCTIVITY ALARM
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                AUDITORY SABOTAGE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Plays aggressive heavy metal so you can't sleep, morphs into soothing lullaby so you can't wake up.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Master Controls */}
          <button
            onClick={handleToggleAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isAudioPlaying
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={isAudioPlaying ? 'Stop Audio Engine' : 'Start Audio Engine'}
          >
            {isAudioPlaying ? <Square className="w-3.5 h-3.5 fill-rose-300" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAudioPlaying ? 'Engine Active' : 'Start Engine'}</span>
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleTriggerInstantAlarm}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Sound Alarm</span>
          </button>
        </div>
      </div>

      {/* AUDITORY SABOTAGE DYNAMIC ENGINE PANEL */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#181124] via-[#100f1c] to-[#0b0c16] border border-white/10 shadow-2xl shadow-black/60 space-y-5">
        {/* Glow ambient accent */}
        <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          audioProgress < 0.35 ? 'bg-rose-600' : audioProgress < 0.7 ? 'bg-amber-500' : 'bg-cyan-500'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{phaseInfo.icon}</span>
              <h3 className="text-sm font-extrabold font-mono tracking-wider text-white uppercase">
                {phaseInfo.name}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${phaseInfo.bg} ${phaseInfo.color}`}>
                {phaseInfo.bpm}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              <span className="font-semibold text-white">Acoustic Strategy:</span> {phaseInfo.goal}
            </p>
            <p className="text-[11px] text-slate-400 italic mt-0.5">
              "{phaseInfo.effect}"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">MORPH RATIO</div>
              <div className="text-lg font-bold font-mono text-white">
                {Math.round((1 - audioProgress) * 100)}% <span className="text-rose-400">Metal</span> / {Math.round(audioProgress * 100)}% <span className="text-cyan-400">Sleep</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Frequency Bars Visualizer */}
        <div className="relative h-14 bg-black/40 rounded-2xl border border-white/5 px-4 flex items-center justify-between gap-1 overflow-hidden">
          {Array.from({ length: 32 }).map((_, i) => {
            const relPos = i / 32;
            const isMetalDominant = audioProgress < 0.5;
            // Height calculation based on progress & index
            const wave = Math.sin(i * 0.4 + Date.now() * 0.003);
            const heightMultiplier = isMetalDominant
              ? (0.35 + Math.random() * 0.6) * (1 - audioProgress * 0.4)
              : (0.2 + 0.3 * Math.abs(wave)) * (0.6 + audioProgress * 0.4);
            const barHeight = Math.max(12, Math.min(100, heightMultiplier * 100));

            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor:
                    relPos < (1 - audioProgress)
                      ? i % 2 === 0 ? '#f43f5e' : '#fb923c'
                      : i % 2 === 0 ? '#818cf8' : '#22d3ee',
                  opacity: isAudioPlaying ? (isAudioMuted ? 0.25 : 0.85) : 0.2,
                }}
              />
            );
          })}
        </div>

        {/* Realtime Crossfade Scrubber & Dual Pole Spectrum */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Flame className="w-4 h-4" />
              <span>Heavy Metal Insomnia (0%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Moon className="w-4 h-4" />
              <span>Deep Coma Lullaby (100%)</span>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={audioProgress}
              onMouseDown={() => setManualScrubbing(true)}
              onMouseUp={() => setManualScrubbing(false)}
              onTouchStart={() => setManualScrubbing(true)}
              onTouchEnd={() => setManualScrubbing(false)}
              onChange={(e) => handleManualScrub(parseFloat(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-400 rounded-lg appearance-none cursor-pointer accent-white shadow-inner"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Bedtime Setting (Raging Distortion)</span>
            <span className="text-amber-300">
              {activeDemoCountdown !== null
                ? `Auto-syncing to countdown: ${activeDemoCountdown}s remaining`
                : 'Drag slider to test sound morphing directly'}
            </span>
            <span>Wake-up Target (Irreversible Slumber)</span>
          </div>
        </div>

        {/* Live Lullaby Movement Banner (Shows when lullaby components are active) */}
        {audioProgress >= 0.15 && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span className="text-slate-300">Lullaby Movement:</span>
              <span className="text-cyan-300 font-bold tracking-wide">{lullabyMovement}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-cyan-400/80">
              <span>• 56-Note Classical Suite</span>
              <span>• Celesta & Harp Arpeggios</span>
              <span>• 4Hz Delta Sleep Waves</span>
            </div>
          </div>
        )}

        {/* Quick Auditory Test Buttons */}
        <div className="pt-2 border-t border-white/6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[11px] font-mono text-slate-400">Quick Sound Tests:</span>
            <button
              onClick={() => handleManualScrub(0)}
              className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <Flame className="w-3 h-3" />
              <span>Test 100% Metal</span>
            </button>
            <button
              onClick={() => handleManualScrub(0.5)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Test 50% Hybrid</span>
            </button>
            <button
              onClick={() => handleManualScrub(1.0)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-950"
            >
              <Moon className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="font-bold">Test Extended Lullaby Suite</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            Audio Synthesizer: 100% Native Web Audio API
          </span>
        </div>
      </div>

      {/* Main Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>NEXT ALARM</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white truncate">
            {alarm.nextAlarm}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeDemoCountdown !== null
              ? `Triggering in ${activeDemoCountdown}s...`
              : 'Armed and awaiting snooze'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SNOOZE COUNT</span>
            <BedDouble className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            {alarm.snoozeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total extra sleep: ~{alarm.snoozeCount * 5} minutes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>LATEST SNOOZE VERDICT</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-medium text-slate-200 italic line-clamp-2">
            "{alarm.lastSnoozeMessage || 'Productivity successfully postponed.'}"
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Decision: Commendable
          </div>
        </div>
      </div>

      {/* Alarm Setup Card */}
      <div className="p-6 rounded-3xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              Schedule Anti-Alarm & Launch Auditory Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Setting an alarm triggers the blistering heavy metal immediately. Watch it morph into sleeping lullaby as zero-hour nears!
            </p>
          </div>
        </div>

        {/* Demo Fast Triggers */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            ⚡ Quick Demo Timers (Experience Transition & Full Lullaby)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleQuickDemoAlarm(15, '15s Rapid Demo')}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono font-bold text-slate-200 border border-white/10 flex flex-col items-center gap-1 cursor-pointer group"
            >
              <Timer className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>15 Seconds</span>
              <span className="text-[10px] text-slate-400">Fast Metamorphosis</span>
            </button>

            <button
              onClick={() => handleQuickDemoAlarm(45, '45s Extended Demo')}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono font-bold text-slate-200 border border-white/10 flex flex-col items-center gap-1 cursor-pointer group"
            >
              <Timer className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>45 Seconds</span>
              <span className="text-[10px] text-slate-400">Balanced Transition</span>
            </button>

            <button
              onClick={() => handleQuickDemoAlarm(90, '90s Lullaby Suite')}
              className="p-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 transition-all text-xs font-mono font-bold text-cyan-200 border border-cyan-500/30 flex flex-col items-center gap-1 cursor-pointer group"
            >
              <Moon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>90 Seconds</span>
              <span className="text-[10px] text-cyan-400/80">Full 4-Movement Suite</span>
            </button>

            <button
              onClick={() => handleQuickDemoAlarm(180, '3m Deep Sleep Cycle')}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono font-bold text-slate-200 border border-white/10 flex flex-col items-center gap-1 cursor-pointer group"
            >
              <Timer className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>3 Minutes</span>
              <span className="text-[10px] text-slate-400">Deep Sleep Journey</span>
            </button>
          </div>
        </div>

        {/* Custom Time Selector */}
        <div className="pt-4 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-mono text-slate-400">Set Real Wake-Up Target:</label>
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="bg-black/40 border border-white/10 text-white font-mono text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={handleSetCustomAlarm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:opacity-90 active:scale-95 text-black border border-amber-500/40 text-xs font-mono font-extrabold tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-950/40"
          >
            [ SET ALARM & LAUNCH METAL ]
          </button>
        </div>
      </div>

      {/* Sleep Report based on actual interactions */}
      <div className="p-6 rounded-3xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              Sleep Sabotage Analytics
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            OPTIMAL LETHARGY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-0.5">Sleep Prevention Factor</div>
            <div className="text-sm font-bold text-rose-400">100% (Maximum Insomnia)</div>
            <p className="text-[10px] text-slate-400 mt-1">Blistering heavy metal shreds any bedtime calm.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-0.5">Wake-Up Avoidance Factor</div>
            <div className="text-sm font-bold text-cyan-400">100% (Sedative Hypnosis)</div>
            <p className="text-[10px] text-slate-400 mt-1">Soothing lullaby locks nervous system into slumber.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-0.5">Dismiss Button Inquiries</div>
            <div className="text-sm font-bold text-amber-400">0 (Forbidden by Law)</div>
            <p className="text-[10px] text-slate-400 mt-1">The only way out is snooze and more sleep.</p>
          </div>
        </div>
      </div>

      {/* ACTIVE ALARM RINGING OVERLAY MODAL */}
      {alarm.isRinging && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative max-w-md w-full p-8 rounded-3xl bg-gradient-to-b from-[#1c1424] via-[#14101e] to-[#0c0914] border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 mx-auto flex items-center justify-center text-3xl animate-pulse">
              💤
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                MANDATORY SEDATION NOTICE
              </span>
              <h3 className="text-3xl font-extrabold font-mono text-white mt-1">
                YOU CANNOT WAKE UP.
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                The blistering metal kept you awake at night. Now, the soothing hypnotic lullaby has achieved 100% sleep depth. It is physically impossible to get out of bed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  {lullabyMovement}
                </span>
                <span className="text-cyan-400/70">4-Movement Suite</span>
              </div>
              <div className="flex items-center justify-center gap-1 h-5">
                {[40, 75, 50, 90, 60, 85, 45, 70, 95, 55, 80, 65].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-cyan-400/80 animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${idx * 80}ms`,
                      animationDuration: '1.2s',
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-cyan-200/90 italic">
                Celesta bells, plucked harp chords, 4Hz Delta binaural entrainment, and warm rain.
              </p>
            </div>

            {/* ONLY ONE BUTTON: SNOOZE 5 MIN */}
            <div className="pt-2">
              <button
                onClick={handleSnooze}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-black font-mono font-extrabold text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                [ SNOOZE 5 MIN (MORE SLEEP) ]
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-400">
              Snooze #{alarm.snoozeCount + 1} will re-arm the cycle and register in the OS log.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

